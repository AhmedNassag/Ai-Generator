<?php

namespace App\Traits;

use App\Config\ServiceRelationConfig;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Enhanced Cross-Service Relation Trait
 * 
 * Features:
 * - Full support for nested relations across multiple services
 * - Handles both standard hasMany (with FK array) and reverse hasMany (inverse lookup)
 * - Proper foreign key tracking for all nested levels
 * - Optimized caching and parallel loading
 */
trait CrossServiceRelationTrait
{
    protected int $httpTimeout = 5;
    protected int $cacheDuration = 600;
    protected bool $enableCache = false;
    protected bool $enableParallelRequests = true;

    /**
     * Load cross-service relations for a collection or single model
     */
    public function loadCrossServiceRelations($data, array $relations, ?string $modelName = null)
    {
        if (empty($data)) {
            return $data;
        }

        $isCollection = $data instanceof Collection;
        $isSingleItem = !$isCollection && !is_array($data);

        if ($isSingleItem) {
            $data = collect([$data]);
        } elseif (!$isCollection) {
            $data = collect($data);
        }

        if (!$modelName) {
            $modelName = $this->getModelNameFromClass();
        }

        foreach ($relations as $relationDef) {
            if (is_string($relationDef)) {
                $this->loadNestedRelation($data, $relationDef, $modelName);
            } elseif (is_array($relationDef) && isset($relationDef['with'])) {
                $this->loadRelationsFromObjectFormat($data, $relationDef['with'], $modelName);
            }
        }

        if ($isSingleItem) {
            return $data->first();
        }

        return $isCollection ? $data : $data->all();
    }

    /**
     * Get required foreign keys for relations (including nested)
     */
    public function getRequiredForeignKeys(array $relations, ?string $modelName = null): array
    {
        if (!$modelName) {
            $modelName = $this->getModelNameFromClass();
        }

        $foreignKeys = [];

        foreach ($relations as $relationDef) {
            if (is_string($relationDef)) {
                $keys = $this->extractForeignKeysFromPath($relationDef, $modelName);
                $foreignKeys = array_merge($foreignKeys, $keys);
            }
        }

        return array_unique($foreignKeys);
    }

    /**
     * Extract foreign keys from a relation path
     */
    protected function extractForeignKeysFromPath(string $relationPath, string $currentModel): array
    {
        $foreignKeys = [];
        $parts = explode('.', $relationPath);
        
        foreach ($parts as $part) {
            $parsed = $this->parseRelationPart($part);
            $relationName = $parsed['relationName'];
            
            $relationInfo = ServiceRelationConfig::getRelationConfig($currentModel, $relationName);
            
            if ($relationInfo) {
                // For reverse hasMany, we don't need FK in parent, but we need 'id'
                if ($this->isReverseHasMany($relationInfo)) {
                    // The parent just needs its ID for the child to reference
                    $foreignKeys[] = 'id';
                } elseif ($relationInfo['foreign_key']) {
                    $foreignKeys[] = $relationInfo['foreign_key'];
                }
                
                $currentModel = $relationInfo['model'];
            } else {
                break;
            }
        }

        return $foreignKeys;
    }

    /**
     * Check if relation is a reverse hasMany
     * (hasMany where parent doesn't have FK array, but child has parent FK)
     */
    protected function isReverseHasMany(array $relationInfo): bool
    {
        return $relationInfo['type'] === 'hasMany' 
            && isset($relationInfo['reverse']) 
            && $relationInfo['reverse'] === true;
    }

    /**
     * Load nested relation path with support for cross-service relations
     */
    protected function loadNestedRelation(Collection $data, string $relationPath, string $currentModel): void
    {
        $parts = explode('.', $relationPath);
        $currentPart = array_shift($parts);
        $remainingPath = implode('.', $parts);

        $parsed = $this->parseRelationPart($currentPart);
        $relationName = $parsed['relationName'];
        $selectFields = $parsed['selectFields'];
        $relationParams = $parsed['relationParams'];
        \Log::info('Loading relation', [
            'model' => $currentModel,
            'relation' => $relationName,
            'selectFields' => $selectFields,
            'relationParams' => $relationParams,
            'remainingPath' => $remainingPath
        ]);
        $relationInfo = ServiceRelationConfig::getRelationConfig($currentModel, $relationName);

        if (!$relationInfo) {
            Log::warning('Relation not found in config', [
                'model' => $currentModel,
                'relation' => $relationName
            ]);
            return;
        }

        $targetModel = $relationInfo['model'];
        $foreignKey = $relationInfo['foreign_key'];
        $relationType = $relationInfo['type'];
        $isReverse = $this->isReverseHasMany($relationInfo);

        if (!$foreignKey) {
            Log::warning('Foreign key not defined', [
                'model' => $currentModel,
                'relation' => $relationName
            ]);
            return;
        }

        // Include foreign keys needed for nested relations
        if ($selectFields && $remainingPath) {
            $nestedKeys = $this->extractForeignKeysFromPath($remainingPath, $targetModel);
            foreach ($nestedKeys as $nestedKey) {
                if (!in_array($nestedKey, $selectFields)) {
                    $selectFields[] = $nestedKey;
                }
            }
        }

        // Always ensure 'id' is included
        if ($selectFields && !in_array('id', $selectFields)) {
            array_unshift($selectFields, 'id');
        }

        $relatedData = null;

        // Handle reverse hasMany differently
        if ($isReverse) {
            $relatedData = $this->fetchReverseHasMany($data, $targetModel, $foreignKey, $selectFields, $relationParams);
        } else {
            // Standard relation (belongsTo, hasMany with FK array)
            $foreignKeyValues = $this->extractForeignKeys($data, $foreignKey, $relationType);

            // if (empty($foreignKeyValues)) {
            //     Log::info('No foreign key values found', [
            //         'model' => $currentModel,
            //         'relation' => $relationName,
            //         'foreignKey' => $foreignKey
            //     ]);
                
            //     $this->setEmptyRelations($data, $relationName, $relationType);
            //     return;
            // }

            $relatedData = $this->fetchFromService($targetModel, $foreignKeyValues, $selectFields, $relationParams);
        }

        if ($relatedData->isEmpty()) {
            Log::warning('No related data returned from service', [
                'model' => $targetModel,
                'isReverse' => $isReverse
            ]);
            
            $this->setEmptyRelations($data, $relationName, $relationType);
            return;
        }

        // Load nested relations BEFORE mapping
        if ($remainingPath) {
            Log::info('Loading nested relation', [
                'parentModel' => $currentModel,
                'currentRelation' => $relationName,
                'nestedPath' => $remainingPath,
                'targetModel' => $targetModel,
                'relatedDataCount' => $relatedData->count(),
                'isReverse' => $isReverse
            ]);
            
            $this->loadNestedRelation($relatedData, $remainingPath, $targetModel);
        }

        // Map related data back to parent
        if ($isReverse) {
            $this->mapReverseHasManyData($data, $relatedData, $relationName, $foreignKey);
        } else {
            $this->mapRelatedData($data, $relatedData, $relationName, $foreignKey, $relationType);
        }
    }

    /**
     * Fetch data for reverse hasMany relation
     * (Query child records WHERE foreign_key IN parent_ids)
     */
    protected function fetchReverseHasMany(
        Collection $parentData,
        string $targetModel,
        string $foreignKey,
        ?array $selectFields = null,
        ?array $additionalParams = null
    ): Collection {
        // Extract parent IDs
        $parentIds = $parentData->map(function ($item) {
            return $this->getItemId($item);
        })->filter()->unique()->values()->all();

        if (empty($parentIds)) {
            return collect();
        }

        $serviceInfo = ServiceRelationConfig::getServiceConfig($targetModel);
        if (!$serviceInfo) {
            Log::warning('Service config not found', ['model' => $targetModel]);
            return collect();
        }

        try {
            // Build query: fetch children WHERE foreign_key IN (parent_ids)
            $params = [
                'filterIn' => "{$foreignKey}|" . implode(',', $parentIds),
                'perPage' => (count($parentIds) * 50) + 10, // Assume avg 50 items per parent
            ];

            if ($selectFields) {
                // Ensure foreign_key is in select
                if (!in_array($foreignKey, $selectFields)) {
                    $selectFields[] = $foreignKey;
                }
                $params['select'] = implode('|', $selectFields);
            }

            if ($additionalParams) {
                $params = array_merge($params, $additionalParams);
            }

            $url = rtrim($serviceInfo['baseUrl'], '/') . '/' . ltrim($serviceInfo['route'], '/');

            Log::info('Fetching reverse hasMany from service', [
                'model' => $targetModel,
                'url' => $url,
                'params' => $params,
                'parentIds' => $parentIds
            ]);

            $response = Http::timeout($this->httpTimeout)
                ->withHeaders([
                    'Accept' => 'application/json',
                    'Content-Type' => 'application/json',
                    'Authorization' => 'Bearer ' . (request()->bearerToken() ?? ''),
                ])
                ->get($url, $params);

            if (!$response->successful()) {
                Log::error('Reverse hasMany request failed', [
                    'url' => $url,
                    'status' => $response->status(),
                    'params' => $params,
                ]);
                return collect();
            }

            $responseData = $response->json();
            $data = $responseData['data'] ?? $responseData;
            $collection = collect(is_array($data) ? $data : []);

            Log::info('Reverse hasMany data fetched', [
                'model' => $targetModel,
                'count' => $collection->count()
            ]);

            return $collection;
        } catch (\Exception $e) {
            Log::error('Reverse hasMany exception', [
                'model' => $targetModel,
                'error' => $e->getMessage(),
            ]);
            return collect();
        }
    }

    /**
     * Map reverse hasMany data (group children by parent FK)
     */
    // protected function mapReverseHasManyData(
    //     Collection $parentData,
    //     Collection $childData,
    //     string $relationName,
    //     string $foreignKey
    // ): void {
    //     \Log::info('Mapping reverse hasMany data', [
    //         'relation' => $relationName,
    //         'parentCount' => $parentData,
    //         'childCount' => $childData,
    //         'foreignKey' => $foreignKey
    //     ]);
    //     // Group children by foreign key
    //     $grouped = $childData->groupBy(function ($item) use ($foreignKey) {
    //         return (string)$this->getItemValue($item, $foreignKey);
    //     });

    //     $parentData->transform(function ($item) use ($relationName, $grouped) {
    //         $parentId = (string)$this->getItemId($item);
    //         $children = $grouped->get($parentId, collect())->values()->all();
            
    //         $this->setItemValue($item, $relationName, $children);
    //         return $item;
    //     });
    // }
    /**
 * Map reverse hasMany data (group children by parent FK)
 * Handles both single FK values and FK arrays (belongsToMany style)
 */
protected function mapReverseHasManyData(
    Collection $parentData,
    Collection $childData,
    string $relationName,
    string $foreignKey
): void {
    // Check if foreign key contains arrays (belongsToMany) or single values
    $firstChild = $childData->first();
    $fkValue = $firstChild ? $this->getItemValue($firstChild, $foreignKey) : null;
    $isArrayFK = is_array($fkValue);

    if ($isArrayFK) {
        // Handle belongsToMany style (FK is an array in child)
        $this->mapReverseHasManyWithArrayFK($parentData, $childData, $relationName, $foreignKey);
    } else {
        // Handle standard hasMany (FK is a single value in child)
        $this->mapReverseHasManyWithSingleFK($parentData, $childData, $relationName, $foreignKey);
    }
}

/**
 * Map reverse hasMany when FK is a single value (standard hasMany)
 */
protected function mapReverseHasManyWithSingleFK(
    Collection $parentData,
    Collection $childData,
    string $relationName,
    string $foreignKey
): void {
    // Group children by foreign key
    $grouped = $childData->groupBy(function ($item) use ($foreignKey) {
        $fkValue = $this->getItemValue($item, $foreignKey);
        return $fkValue ? (string)$fkValue : null;
    });

    $parentData->transform(function ($item) use ($relationName, $grouped) {
        $parentId = (string)$this->getItemId($item);
        $children = $grouped->get($parentId, collect())->values()->all();
        
        $this->setItemValue($item, $relationName, $children);
        return $item;
    });
}

/**
 * Map reverse hasMany when FK is an array (belongsToMany style)
 */
protected function mapReverseHasManyWithArrayFK(
    Collection $parentData,
    Collection $childData,
    string $relationName,
    string $foreignKey
): void {
    // Build a map of parent_id => [child items]
    $parentChildMap = [];

    // Initialize empty arrays for all parents
    foreach ($parentData as $parent) {
        $parentId = (string)$this->getItemId($parent);
        $parentChildMap[$parentId] = [];
    }

    // Iterate through children and add to all related parents
    foreach ($childData as $child) {
        $fkValues = $this->getItemValue($child, $foreignKey);
        
        if (is_array($fkValues)) {
            foreach ($fkValues as $parentId) {
                $parentIdStr = (string)$parentId;
                if (isset($parentChildMap[$parentIdStr])) {
                    $parentChildMap[$parentIdStr][] = $child;
                }
            }
        }
    }

    // Map children back to parents
    $parentData->transform(function ($item) use ($relationName, $parentChildMap) {
        $parentId = (string)$this->getItemId($item);
        $children = $parentChildMap[$parentId] ?? [];
        
        $this->setItemValue($item, $relationName, $children);
        return $item;
    });
}

    /**
     * Set empty relations for items without related data
     */
    protected function setEmptyRelations(Collection $data, string $relationName, string $relationType): void
    {
        $data->transform(function ($item) use ($relationName, $relationType) {
            $emptyValue = $relationType === 'hasMany' ? [] : null;
            
            if (is_array($item)) {
                $item[$relationName] = $emptyValue;
            } else {
                $item->{$relationName} = $emptyValue;
            }
            
            return $item;
        });
    }

    /**
     * Fetch data from external service with caching
     */
    protected function fetchFromService(
        string $modelName,
        array $ids,
        ?array $selectFields = null,
        ?array $additionalParams = null
    ): Collection {
        if ($this->enableCache) {
            $cacheKey = $this->buildCrossServiceCacheKey($modelName, $ids, $selectFields, $additionalParams);

            try {
                if (method_exists(Cache::getStore(), 'tags')) {
                    $cached = Cache::tags(["cross_service_{$modelName}"])->get($cacheKey);
                } else {
                    $cached = Cache::get($cacheKey);
                }

                if ($cached !== null) {
                    return collect($cached);
                }
            } catch (\Exception $e) {
                Log::warning('Cache retrieval failed', [
                    'model' => $modelName,
                    'error' => $e->getMessage()
                ]);
            }
        }

        $serviceInfo = ServiceRelationConfig::getServiceConfig($modelName);
        if (!$serviceInfo) {
            Log::warning('Service config not found', ['model' => $modelName]);
            return collect();
        }

        try {
            $params = [
                'filterIn' => 'id|' . implode(',', $ids),
                'perPage' => count($ids) + 10,
            ];

            if ($selectFields) {
                $params['select'] = implode('|', $selectFields);
            }

            if ($additionalParams) {
                $params = array_merge($params, $additionalParams);
            }

            $url = rtrim($serviceInfo['baseUrl'], '/') . '/' . ltrim($serviceInfo['route'], '/');

            Log::info('Fetching from service', [
                'model' => $modelName,
                'url' => $url,
                'params' => $params
            ]);

            $response = Http::timeout($this->httpTimeout)
                ->withHeaders([
                    'Accept' => 'application/json',
                    'Content-Type' => 'application/json',
                    'Authorization' => 'Bearer ' . (request()->bearerToken() ?? ''),
                ])
                ->get($url, $params);

            if (!$response->successful()) {
                Log::error('Cross-service request failed', [
                    'url' => $url,
                    'status' => $response->status(),
                    'params' => $params,
                    'response' => $response->body()
                ]);
                return collect();
            }

            $responseData = $response->json();
            $data = $responseData['data'] ?? $responseData;
            $collection = collect(is_array($data) ? $data : []);

            Log::info('Service data fetched', [
                'model' => $modelName,
                'count' => $collection->count()
            ]);

            if ($this->enableCache && !empty($collection)) {
                try {
                    if (method_exists(Cache::getStore(), 'tags')) {
                        Cache::tags(["cross_service_{$modelName}"])
                            ->put($cacheKey, $collection->toArray(), $this->cacheDuration);
                    } else {
                        Cache::put($cacheKey, $collection->toArray(), $this->cacheDuration);
                    }
                } catch (\Exception $e) {
                    Log::warning('Cache storage failed', [
                        'model' => $modelName,
                        'error' => $e->getMessage()
                    ]);
                }
            }

            return $collection;
        } catch (\Exception $e) {
            Log::error('Cross-service exception', [
                'model' => $modelName,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return collect();
        }
    }

    /**
     * Map fetched related data back to parent records
     */
    protected function mapRelatedData(
        Collection $parentData,
        Collection $relatedData,
        string $relationName,
        string $foreignKey,
        string $relationType
    ): void {
        $relatedMap = [];
        foreach ($relatedData as $item) {
            $id = $this->getItemId($item);
            if ($id) {
                $relatedMap[(string)$id] = $item;
            }
        }

        $parentData->transform(function ($item) use ($relationName, $foreignKey, $relationType, $relatedMap) {
            $fkValue = $this->getItemValue($item, $foreignKey);

            if ($fkValue === null) {
                $this->setItemValue($item, $relationName, $relationType === 'hasMany' ? [] : null);
                return $item;
            }

            if ($relationType === 'hasMany' && is_array($fkValue)) {
                $mapped = array_values(array_filter(array_map(function ($id) use ($relatedMap) {
                    return $relatedMap[(string)$id] ?? null;
                }, $fkValue)));

                $this->setItemValue($item, $relationName, $mapped);
            } else {
                $mapped = $relatedMap[(string)$fkValue] ?? null;
                $this->setItemValue($item, $relationName, $mapped);
            }

            return $item;
        });
    }

    protected function getItemId($item)
    {
        if (is_array($item)) {
            return $item['id'] ?? $item['_id'] ?? null;
        } elseif (is_object($item)) {
            return $item->id ?? $item->_id ?? null;
        }
        return null;
    }

    protected function getItemValue($item, string $key)
    {
        if (is_array($item)) {
            return $item[$key] ?? null;
        } elseif (is_object($item)) {
            return $item->{$key} ?? null;
        }
        return null;
    }

    protected function setItemValue(&$item, string $key, $value): void
    {
        if (is_array($item)) {
            $item[$key] = $value;
        } elseif (is_object($item)) {
            $item->{$key} = $value;
        }
    }

    protected function parseRelationPart(string $part): array
    {
        $relationName = $part;
        $selectFields = null;
        $relationParams = [];

        if (preg_match('/\{([^}]+)\}/', $part, $matches)) {
            $paramsStr = $matches[1];
            $paramPairs = explode(',', $paramsStr);

            foreach ($paramPairs as $pair) {
                $eqPos = strpos($pair, '=');
                if ($eqPos !== false) {
                    $key = trim(substr($pair, 0, $eqPos));
                    $value = trim(substr($pair, $eqPos + 1));
                    if ($key && $value !== '') {
                        $relationParams[$key] = $value;
                    }
                }
            }

            $relationName = preg_replace('/\{[^}]+\}/', '', $part);
        }

        $colonPos = strpos($relationName, ':');
        if ($colonPos !== false) {
            $selectFieldsStr = substr($relationName, $colonPos + 1);
            $relationName = substr($relationName, 0, $colonPos);

            if ($selectFieldsStr) {
                $selectFields = strpos($selectFieldsStr, '|') !== false
                    ? explode('|', $selectFieldsStr)
                    : explode(',', $selectFieldsStr);
                    
                $selectFields = array_map('trim', $selectFields);
            }
        }

        return [
            'relationName' => trim($relationName),
            'selectFields' => $selectFields,
            'relationParams' => $relationParams,
        ];
    }

    protected function extractForeignKeys(Collection $data, string $foreignKey, string $relationType): array
    {
        $values = [];

        foreach ($data as $item) {
            $value = $this->getItemValue($item, $foreignKey);

            if ($value !== null) {
                if ($relationType === 'hasMany' && is_array($value)) {
                    foreach ($value as $v) {
                        if ($v !== null) {
                            $values[] = $v;
                        }
                    }
                } else {
                    $values[] = $value;
                }
            }
        }

        return array_values(array_unique(array_filter($values)));
    }

    protected function loadRelationsFromObjectFormat(Collection $data, array $relations, string $currentModel): void
    {
        foreach ($relations as $relationName => $relationDef) {
            $this->loadSingleRelationFromObject($data, $relationName, $relationDef, $currentModel);
        }
    }

    protected function loadSingleRelationFromObject(Collection $data, string $relationName, array $relationDef, string $currentModel): void
    {
        $relationInfo = ServiceRelationConfig::getRelationConfig($currentModel, $relationName);

        if (!$relationInfo) {
            return;
        }

        $targetModel = $relationInfo['model'];
        $foreignKey = $relationInfo['foreign_key'];
        $relationType = $relationInfo['type'];
        $isReverse = $this->isReverseHasMany($relationInfo);

        if (!$foreignKey) {
            return;
        }

        $selectFields = $this->parseSelectFields($relationDef['select'] ?? null);

        if ($selectFields && isset($relationDef['with'])) {
            foreach (array_keys($relationDef['with']) as $nestedRelation) {
                $nestedRelationInfo = ServiceRelationConfig::getRelationConfig($targetModel, $nestedRelation);
                if ($nestedRelationInfo && $nestedRelationInfo['foreign_key']) {
                    if (!in_array($nestedRelationInfo['foreign_key'], $selectFields)) {
                        $selectFields[] = $nestedRelationInfo['foreign_key'];
                    }
                }
            }
        }

        if ($selectFields && !in_array('id', $selectFields)) {
            array_unshift($selectFields, 'id');
        }

        $additionalParams = [];
        $reservedKeys = ['select', 'with'];
        foreach ($relationDef as $key => $value) {
            if (!in_array($key, $reservedKeys) && $value !== null) {
                $additionalParams[$key] = $value;
            }
        }

        $relatedData = null;

        if ($isReverse) {
            $relatedData = $this->fetchReverseHasMany($data, $targetModel, $foreignKey, $selectFields, !empty($additionalParams) ? $additionalParams : null);
        } else {
            $foreignKeyValues = $this->extractForeignKeys($data, $foreignKey, $relationType);
            if (empty($foreignKeyValues)) {
                return;
            }
            $relatedData = $this->fetchFromService($targetModel, $foreignKeyValues, $selectFields, !empty($additionalParams) ? $additionalParams : null);
        }

        if (isset($relationDef['with']) && !empty($relatedData)) {
            $this->loadRelationsFromObjectFormat($relatedData, $relationDef['with'], $targetModel);
        }

        if ($isReverse) {
            $this->mapReverseHasManyData($data, $relatedData, $relationName, $foreignKey);
        } else {
            $this->mapRelatedData($data, $relatedData, $relationName, $foreignKey, $relationType);
        }
    }

    protected function parseSelectFields($select): ?array
    {
        if (!$select) {
            return null;
        }

        if (is_array($select)) {
            return $select;
        }

        if (is_string($select)) {
            $fields = strpos($select, '|') !== false
                ? explode('|', $select)
                : explode(',', $select);
            return array_map('trim', $fields);
        }

        return null;
    }

    protected function buildCrossServiceCacheKey(
        string $modelName,
        array $ids,
        ?array $selectFields,
        ?array $additionalParams
    ): string {
        sort($ids);

        $key = sprintf(
            'cross_service:%s:%s:%s:%s',
            $modelName,
            md5(implode(',', $ids)),
            $selectFields ? md5(implode(',', $selectFields)) : 'all',
            $additionalParams ? md5(serialize($additionalParams)) : 'none'
        );

        return $key;
    }

    protected function getModelNameFromClass(): string
    {
        $className = class_basename(get_class($this));
        return str_replace('Repository', '', $className);
    }

    public function clearRelationCache(?string $modelName = null): void
    {
        try {
            if ($modelName) {
                if (method_exists(Cache::getStore(), 'tags')) {
                    Cache::tags(["cross_service_{$modelName}"])->flush();
                    Log::info('Cache cleared for model', ['model' => $modelName]);
                } else {
                    Log::warning('Cache tags not supported, clearing all cache', ['model' => $modelName]);
                    Cache::flush();
                }
            } else {
                Cache::flush();
                Log::info('All cross-service cache cleared');
            }
        } catch (\Exception $e) {
            Log::warning('Failed to clear cache', [
                'model' => $modelName,
                'error' => $e->getMessage()
            ]);
        }
    }

    public function getCacheStats(): array
    {
        return [
            'cache_enabled' => $this->enableCache,
            'cache_duration' => $this->cacheDuration,
            'http_timeout' => $this->httpTimeout,
            'parallel_enabled' => $this->enableParallelRequests,
            'cache_driver' => config('cache.default'),
            'tags_supported' => method_exists(Cache::getStore(), 'tags'),
        ];
    }

    public function setCacheCrossServiceEnabled(bool $enable): void
    {
        $this->enableCache = $enable;
    }

    public function setCacheDuration(int $seconds): void
    {
        $this->cacheDuration = $seconds;
    }

    public function setParallelEnabled(bool $enable): void
    {
        $this->enableParallelRequests = $enable;
    }

    public function setHttpTimeout(int $seconds): void
    {
        $this->httpTimeout = $seconds;
    }
}