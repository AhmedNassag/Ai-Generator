<?php

namespace App\Traits;

use App\Config\ServiceRelationConfig;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Cross-Service Relation Loading Trait with Enhanced Debugging
 */
trait CrossServiceRelationTrait
{
    protected int $httpTimeout = 30;
    protected int $cacheDuration = 300;
    protected bool $enableCache = true;

    /**
     * Load cross-service relations for a collection or single model
     */
    public function loadCrossServiceRelations($data, array $relations, ?string $modelName = null)
    {
        // Handle empty data
        if (empty($data)) {
            return $data;
        }

        // Convert to collection for consistent handling
        $isCollection = $data instanceof Collection;
        $isSingleItem = !$isCollection && !is_array($data);

        if ($isSingleItem) {
            $data = collect([$data]);
        } elseif (!$isCollection) {
            $data = collect($data);
        }

        // Auto-detect model name if not provided
        if (!$modelName) {
            $modelName = $this->getModelNameFromClass();
        }

        // Process each relation definition
        foreach ($relations as $index => $relationDef) {
            if (is_string($relationDef)) {
                $this->loadNestedRelation($data, $relationDef, $modelName);
            } elseif (is_array($relationDef) && isset($relationDef['with'])) {
                $this->loadRelationsFromObjectFormat($data, $relationDef['with'], $modelName);
            }
        }

        // Return in original format
        if ($isSingleItem) {
            return $data->first();
        }

        return $isCollection ? $data : $data->all();
    }

    /**
     * Get required foreign keys for relations - PUBLIC so BaseRepository can use it
     */
    public function getRequiredForeignKeys(array $relations, ?string $modelName = null): array
    {
        if (!$modelName) {
            $modelName = $this->getModelNameFromClass();
        }

        $foreignKeys = [];

        foreach ($relations as $relationDef) {
            if (is_string($relationDef)) {
                // Parse the first level of the relation path
                $parts = explode('.', $relationDef);
                $currentPart = $parts[0];
                
                $parsed = $this->parseRelationPart($currentPart);
                $relationName = $parsed['relationName'];
                
                $relationInfo = ServiceRelationConfig::getRelationConfig($modelName, $relationName);
                
                if ($relationInfo && $relationInfo['foreign_key']) {
                    $foreignKeys[] = $relationInfo['foreign_key'];
                }
            }
        }

        return array_unique($foreignKeys);
    }

    /**
     * Load nested relation path (string format)
     */
    protected function loadNestedRelation(Collection $data, string $relationPath, string $currentModel): void
    {
        $parts = explode('.', $relationPath);
        $currentPart = array_shift($parts);
        $remainingPath = implode('.', $parts);

        // Parse relation part
        $parsed = $this->parseRelationPart($currentPart);
        $relationName = $parsed['relationName'];
        $selectFields = $parsed['selectFields'];
        $relationParams = $parsed['relationParams'];

        // Get relation configuration
        $relationInfo = ServiceRelationConfig::getRelationConfig($currentModel, $relationName);

        if (!$relationInfo) {
            return;
        }

        $targetModel = $relationInfo['model'];
        $foreignKey = $relationInfo['foreign_key'];
        $relationType = $relationInfo['type'];

        if (!$foreignKey) {
            return;
        }

        // Ensure foreign key for next nested relation is included
        if ($selectFields && $remainingPath) {
            $nextPart = explode('.', $remainingPath)[0];
            $nextParsed = $this->parseRelationPart($nextPart);
            $nextRelationInfo = ServiceRelationConfig::getRelationConfig($targetModel, $nextParsed['relationName']);

            if ($nextRelationInfo && $nextRelationInfo['foreign_key']) {
                if (!in_array($nextRelationInfo['foreign_key'], $selectFields)) {
                    $selectFields[] = $nextRelationInfo['foreign_key'];
                }
            }
        }

        // Always ensure 'id' is included
        if ($selectFields && !in_array('id', $selectFields)) {
            array_unshift($selectFields, 'id');
        }

        // Extract foreign key values
        $foreignKeyValues = $this->extractForeignKeys($data, $foreignKey, $relationType);

        if (empty($foreignKeyValues)) {
            return;
        }

        // Fetch related data
        $relatedData = $this->fetchFromService($targetModel, $foreignKeyValues, $selectFields, $relationParams);

        if ($remainingPath && !empty($relatedData)) {
            // Load nested relations directly on the related data collection
            $this->loadNestedRelation($relatedData, $remainingPath, $targetModel);
        }

        // Map related data (now with nested relations already loaded)
        $this->mapRelatedData($data, $relatedData, $relationName, $foreignKey, $relationType);
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
        // Create lookup map for O(1) access
        $relatedMap = [];
        foreach ($relatedData as $item) {
            // Handle both array and object, and also stdClass from API responses
            if (is_array($item)) {
                $id = $item['id'] ?? null;
            } elseif (is_object($item)) {
                $id = $item->id ?? null;
            } else {
                $id = null;
            }

            if ($id) {
                $relatedMap[(string)$id] = $item;
            }
        }

        $parentData->transform(function ($item) use ($relationName, $foreignKey, $relationType, $relatedMap) {
            // Get foreign key value
            if (is_array($item)) {
                $fkValue = $item[$foreignKey] ?? null;
            } elseif (is_object($item)) {
                $fkValue = $item->{$foreignKey} ?? null;
            } else {
                return $item;
            }

            if ($fkValue === null) {
                // Set empty relation
                if (is_array($item)) {
                    $item[$relationName] = $relationType === 'hasMany' ? [] : null;
                } else {
                    $item->{$relationName} = $relationType === 'hasMany' ? [] : null;
                }
                return $item;
            }

            if ($relationType === 'hasMany' && is_array($fkValue)) {
                // Map array of IDs to array of objects
                $mapped = array_values(array_filter(array_map(function ($id) use ($relatedMap) {
                    return $relatedMap[(string)$id] ?? null;
                }, $fkValue)));

                if (is_array($item)) {
                    $item[$relationName] = $mapped;
                } else {
                    $item->{$relationName} = $mapped;
                }
            } else {
                // Map single ID to single object
                $mapped = $relatedMap[(string)$fkValue] ?? null;

                if (is_array($item)) {
                    $item[$relationName] = $mapped;
                } else {
                    $item->{$relationName} = $mapped;
                }
            }

            return $item;
        });
    }

    /**
     * Fetch data from external service
     */
    protected function fetchFromService(
        string $modelName,
        array $ids,
        ?array $selectFields = null,
        ?array $additionalParams = null
    ): Collection {
        $serviceInfo = ServiceRelationConfig::getServiceConfig($modelName);

        if (!$serviceInfo) {
            return collect();
        }

        try {
            // Build query parameters
            $params = [
                'filterIn' => 'id|' . implode(',', $ids),
                'perPage' => count($ids) + 10,
            ];

            // Add select fields
            if ($selectFields) {
                $params['select'] = implode('|', $selectFields);
            }

            // Merge additional params
            if ($additionalParams) {
                $params = array_merge($params, $additionalParams);
            }

            // Build full URL
            $url = rtrim($serviceInfo['baseUrl'], '/') . '/' . ltrim($serviceInfo['route'], '/');

            $response = Http::timeout($this->httpTimeout)
                ->withHeaders([
                    'Accept' => 'application/json',
                    'Content-Type' => 'application/json',
                    'Authorization' => 'Bearer ' . (request()->bearerToken() ?? ''),
                ])
                ->get($url, $params);

            if (!$response->successful()) {
                return collect();
            }

            $responseData = $response->json();

            // Extract data from response (handle both paginated and non-paginated)
            $data = $responseData['data'] ?? $responseData;

            return collect(is_array($data) ? $data : []);
        } catch (\Exception $e) {
            return collect();
        }
    }

    /**
     * Parse relation part to extract name, select fields, and params
     */
    protected function parseRelationPart(string $part): array
    {
        $relationName = $part;
        $selectFields = null;
        $relationParams = [];

        // Extract params from curly braces
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

        // Extract select fields from colon syntax
        $colonPos = strpos($relationName, ':');
        if ($colonPos !== false) {
            $selectFieldsStr = substr($relationName, $colonPos + 1);
            $relationName = substr($relationName, 0, $colonPos);

            if ($selectFieldsStr) {
                $selectFields = strpos($selectFieldsStr, '|') !== false
                    ? explode('|', $selectFieldsStr)
                    : explode(',', $selectFieldsStr);
            }
        }

        return [
            'relationName' => $relationName,
            'selectFields' => $selectFields,
            'relationParams' => $relationParams,
        ];
    }

    /**
     * Extract unique foreign key values from data
     */
    protected function extractForeignKeys(Collection $data, string $foreignKey, string $relationType): array
    {
        $values = [];

        foreach ($data as $item) {
            // Handle arrays, objects, and stdClass
            if (is_array($item)) {
                $value = $item[$foreignKey] ?? null;
            } elseif (is_object($item)) {
                $value = $item->{$foreignKey} ?? null;
            } else {
                $value = null;
            }

            if ($value !== null) {
                if ($relationType === 'hasMany' && is_array($value)) {
                    foreach ($value as $v) {
                        $values[] = $v;
                    }
                } else {
                    $values[] = $value;
                }
            }
        }

        return array_values(array_unique(array_filter($values)));
    }

    /**
     * Load relations from object format
     */
    protected function loadRelationsFromObjectFormat(Collection $data, array $relations, string $currentModel): void
    {
        foreach ($relations as $relationName => $relationDef) {
            $this->loadSingleRelationFromObject($data, $relationName, $relationDef, $currentModel);
        }
    }

    /**
     * Parse select fields from various formats
     */
    protected function parseSelectFields($select): ?array
    {
        if (!$select) {
            return null;
        }

        if (is_array($select)) {
            return $select;
        }

        if (is_string($select)) {
            return strpos($select, '|') !== false
                ? explode('|', $select)
                : explode(',', $select);
        }

        return null;
    }

    /**
     * Build cache key for service call
     */
    protected function buildCacheKey(string $url, array $params): string
    {
        return 'cross_service:' . md5($url . serialize($params));
    }

    /**
     * Get model name from current class
     */
    protected function getModelNameFromClass(): string
    {
        $className = class_basename(get_class($this));
        return str_replace('Repository', '', $className);
    }

    /**
     * Clear cache for cross-service relations
     */
    public function clearRelationCache(): void
    {
        cache()->flush();
    }

    /**
     * Load a single relation from object definition
     */
    protected function loadSingleRelationFromObject(Collection $data, string $relationName, array $relationDef, string $currentModel): void
    {
        // Get relation configuration
        $relationInfo = ServiceRelationConfig::getRelationConfig($currentModel, $relationName);

        if (!$relationInfo) {
            return;
        }

        $targetModel = $relationInfo['model'];
        $foreignKey = $relationInfo['foreign_key'];
        $relationType = $relationInfo['type'];

        if (!$foreignKey) {
            return;
        }

        // Parse select fields
        $selectFields = $this->parseSelectFields($relationDef['select'] ?? null);

        // Ensure nested relation foreign keys are included in select
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

        // Always ensure 'id' is included
        if ($selectFields && !in_array('id', $selectFields)) {
            array_unshift($selectFields, 'id');
        }

        // Extract foreign key values
        $foreignKeyValues = $this->extractForeignKeys($data, $foreignKey, $relationType);

        if (empty($foreignKeyValues)) {
            return;
        }

        // Build additional params
        $additionalParams = [];
        $reservedKeys = ['select', 'with'];
        foreach ($relationDef as $key => $value) {
            if (!in_array($key, $reservedKeys) && $value !== null) {
                $additionalParams[$key] = $value;
            }
        }

        // Fetch related data
        $relatedData = $this->fetchFromService(
            $targetModel,
            $foreignKeyValues,
            $selectFields,
            !empty($additionalParams) ? $additionalParams : null
        );

        // Process nested relations BEFORE mapping
        if (isset($relationDef['with']) && !empty($relatedData)) {
            $this->loadRelationsFromObjectFormat($relatedData, $relationDef['with'], $targetModel);
        }

        // Map related data back to parent
        $this->mapRelatedData($data, $relatedData, $relationName, $foreignKey, $relationType);
    }
}