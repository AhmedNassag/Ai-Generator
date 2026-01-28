<?php

namespace App\Services\Eloquent\Notification;

use App\Config\ServiceRelationConfig;
use App\Models\Notification\Notification;
use App\Models\User\User;
use App\Notifications\genralNotification;
use App\Services\BaseService;
use App\Services\Eloquent\EmailConfig\EmailConfigService;
use Illuminate\Http\Request;
use App\Repositories\Eloquent\Notification\NotificationRepository;
use Illuminate\Support\Facades\Auth;
use App\Models\NotificationSetting\NotificationSetting;
use Illuminate\Support\Facades\Mail;
use App\Mail\NotificationEmail;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Events\Alert;
use App\Traits\CrossServiceRelationTrait;

class NotificationService extends BaseService
{
    protected $emailConfigService;
    use CrossServiceRelationTrait;
    
    public function __construct()
    {
        parent::__construct(new NotificationRepository());
        $this->emailConfigService = new EmailConfigService();
    }

    /**
     * Extract user and team IDs from data based on model configuration
     * This now handles both direct fields AND nested cross-service relations
     * 
     * Format examples:
     * - "assets:id|owner_id|User|team_ids|Team" - Field pairs with type indicators
     * - "owner_id" - Direct field from main data
     * 
     * @param string $modelName The model class name
     * @param array $data The data containing potential user/team references (may include loaded relations)
     * @param array $relatedUsersFields Fields to check for user/team IDs
     * @return array ['users' => [], 'teams' => []]
     */
    protected function extractRelatedIdsFromConfig(
        string $modelName,
        array $data,
        array $relatedUsersFields = []
    ): array {
        $users = [];
        $teams = [];

        if (empty($relatedUsersFields)) {
            return ['users' => [], 'teams' => []];
        }

        // Filter out null/empty values from related_users
        $relatedUsersFields = array_filter($relatedUsersFields, function($field) {
            return !is_null($field) && is_string($field) && trim($field) !== '';
        });

        if (empty($relatedUsersFields)) {
            Log::info("No valid related_users fields after filtering nulls");
            return ['users' => [], 'teams' => []];
        }

        $modelConfig = ServiceRelationConfig::getModelConfig($modelName);

        if (!$modelConfig || empty($modelConfig['relations'])) {
            return ['users' => [], 'teams' => []];
        }

        foreach ($relatedUsersFields as $fieldKey) {
            // Check if this is a cross-service relation with field specification
            // Format: "relationName:field1|Type1|field2|Type2" or just "fieldName"
            $isCrossServiceRelation = str_contains($fieldKey, ':');
            
            if ($isCrossServiceRelation) {
                // Parse the field specification
                // Format: "assets:id|owner_id|User|team_ids|Team"
                $parts = explode(':', $fieldKey, 2);
                $relationName = $parts[0];
                $fieldSpec = $parts[1] ?? '';
                
                // Parse field specification into field-type pairs
                $fieldTypePairs = $this->parseFieldTypePairs($fieldSpec);
                
                Log::info("Parsing cross-service relation", [
                    'original' => $fieldKey,
                    'relation_name' => $relationName,
                    'field_type_pairs' => $fieldTypePairs
                ]);
                
                // Process cross-service relation data
                $this->extractFromCrossServiceRelation($data, $relationName, $fieldTypePairs, $users, $teams);
            } else {
                // Process direct field from main data
                $this->extractFromDirectField($data, $fieldKey, $modelConfig, $users, $teams);
            }
        }

        return [
            'users' => array_values(array_unique(array_filter($users))),
            'teams' => array_values(array_unique(array_filter($teams))),
        ];
    }

    /**
     * Parse field specification into field-type pairs
     * 
     * IMPORTANT: Only extracts from the LAST field in the specification that matches a User/Team pattern
     * 
     * Examples:
     * - "id|owner_id|team_ids" → Only extracts team_ids (last matching field)
     * - "id|owner_id|User|team_ids|Team" → Only extracts team_ids (last field with explicit type)
     * 
     * @param string $fieldSpec
     * @return array
     */
    protected function parseFieldTypePairs(string $fieldSpec): array
    {
        $parts = explode('|', $fieldSpec);
        $allPairs = [];
        
        // Known type indicators
        $typeIndicators = ['User', 'Team'];
        
        // Field naming patterns for auto-detection
        $userFieldPatterns = ['user_id', 'user_ids', 'owner_id', 'stakeholder_ids', 'assignee_id', 
                             'created_by', 'updated_by', 'creator_id', 'modifier_id', 'manager_id',
                             'chairperson_id', 'vice_chair_id', 'secretary_id', 'member_ids',
                             'auditer_id', 'reviewer_id', 'responsible_id'];
        $teamFieldPatterns = ['team_id', 'team_ids', 'responsible_team_id'];
        
        for ($i = 0; $i < count($parts); $i++) {
            $current = trim($parts[$i]);
            
            // Skip empty parts
            if (empty($current)) {
                continue;
            }
            
            // Check if the next part is a type indicator
            $nextPart = isset($parts[$i + 1]) ? trim($parts[$i + 1]) : null;
            
            if ($nextPart && in_array($nextPart, $typeIndicators)) {
                // Explicit type format: "owner_id|User"
                $allPairs[] = [
                    'field' => $current,
                    'type' => $nextPart
                ];
                $i++; // Skip the next part since we've processed it
                
                Log::debug("Found explicit field type", [
                    'field' => $current,
                    'type' => $nextPart
                ]);
            } else {
                // Auto-detect format: check if current part looks like a user/team field
                $detectedType = null;
                
                // Check against user patterns
                foreach ($userFieldPatterns as $pattern) {
                    if (stripos($current, $pattern) !== false || $current === $pattern) {
                        $detectedType = 'User';
                        break;
                    }
                }
                
                // Check against team patterns if not already detected as user
                if (!$detectedType) {
                    foreach ($teamFieldPatterns as $pattern) {
                        if (stripos($current, $pattern) !== false || $current === $pattern) {
                            $detectedType = 'Team';
                            break;
                        }
                    }
                }
                
                // If we detected a type, add it
                if ($detectedType) {
                    $allPairs[] = [
                        'field' => $current,
                        'type' => $detectedType
                    ];
                    
                    Log::debug("Auto-detected field type", [
                        'field' => $current,
                        'type' => $detectedType
                    ]);
                } else {
                    // Skip fields we can't identify (like standalone "id")
                    Log::debug("Skipping field - no type detected", [
                        'field' => $current
                    ]);
                }
            }
        }
        
        // IMPORTANT: Only return the LAST matching field
        if (!empty($allPairs)) {
            $lastPair = end($allPairs);
            
            Log::info("Using only the LAST field from specification", [
                'all_detected_fields' => array_column($allPairs, 'field'),
                'selected_field' => $lastPair['field'],
                'selected_type' => $lastPair['type']
            ]);
            
            return [$lastPair];
        }
        
        return [];
    }

    /**
     * Extract IDs from direct fields in the data
     */
    protected function extractFromDirectField(array $data, string $fieldKey, array $modelConfig, array &$users, array &$teams): void
    {
        // Find the relation configuration for this field
        $relationConfig = collect($modelConfig['relations'] ?? [])
            ->firstWhere('foreign_key', $fieldKey);

        if (!$relationConfig || !isset($data[$fieldKey])) {
            return;
        }

        $relatedModel = $relationConfig['model'];
        $value = $data[$fieldKey];

        if ($relatedModel === 'User') {
            $users = array_merge($users, $this->normalizeIds($value));
        }

        if ($relatedModel === 'Team') {
            $teams = array_merge($teams, $this->normalizeIds($value));
        }
    }

    /**
     * Extract IDs from loaded cross-service relation data
     * This handles nested arrays of related objects (like assets, vulnerabilities, etc.)
     * 
     * @param array $data The main data array containing loaded relations
     * @param string $relationName The name of the relation (e.g., "assets", "vulnerabilitys")
     * @param array $fieldTypePairs Array of ['field' => 'owner_id', 'type' => 'User'] pairs
     * @param array &$users Reference to users array to append to
     * @param array &$teams Reference to teams array to append to
     */
    // protected function extractFromCrossServiceRelation(
    //     array $data, 
    //     string $relationName, 
    //     array $fieldTypePairs, 
    //     array &$users, 
    //     array &$teams
    // ): void {
    //     // Check if the relation data exists in the loaded data
    //     if (!isset($data[$relationName]) || !is_array($data[$relationName])) {
    //         Log::info("Relation '{$relationName}' not found or not an array in data", [
    //             'available_keys' => array_keys($data)
    //         ]);
    //         return;
    //     }

    //     $relationData = $data[$relationName];
        
    //     Log::info("Processing cross-service relation", [
    //         'relation' => $relationName,
    //         'items_count' => count($relationData),
    //         'field_type_pairs' => $fieldTypePairs
    //     ]);

    //     // If no field-type pairs defined, return early
    //     if (empty($fieldTypePairs)) {
    //         Log::warning("No field-type pairs defined for relation", [
    //             'relation' => $relationName
    //         ]);
    //         return;
    //     }

    //     // Iterate through each related item (e.g., each asset, each vulnerability)
    //     foreach ($relationData as $index => $relatedItem) {
    //         if (!is_array($relatedItem)) {
    //             Log::debug("Skipping non-array item in relation", [
    //                 'relation' => $relationName,
    //                 'index' => $index
    //             ]);
    //             continue;
    //         }

    //         Log::debug("Processing relation item", [
    //             'relation' => $relationName,
    //             'index' => $index,
    //             'available_fields' => array_keys($relatedItem)
    //         ]);

    //         // Extract values based on field-type pairs
    //         foreach ($fieldTypePairs as $pair) {
    //             $field = $pair['field'];
    //             $type = $pair['type'];

    //             if (!isset($relatedItem[$field])) {
    //                 Log::debug("Field not found in relation item", [
    //                     'relation' => $relationName,
    //                     'field' => $field,
    //                     'index' => $index
    //                 ]);
    //                 continue;
    //             }

    //             $value = $relatedItem[$field];

    //             // Extract IDs based on type
    //             if ($type === 'User') {
    //                 $extractedUsers = $this->normalizeIds($value);
    //                 $users = array_merge($users, $extractedUsers);
                    
    //                 Log::info("Extracted users from relation", [
    //                     'relation' => $relationName,
    //                     'field' => $field,
    //                     'users' => $extractedUsers,
    //                     'count' => count($extractedUsers)
    //                 ]);
    //             } elseif ($type === 'Team') {
    //                 $extractedTeams = $this->normalizeIds($value);
    //                 $teams = array_merge($teams, $extractedTeams);
                    
    //                 Log::info("Extracted teams from relation", [
    //                     'relation' => $relationName,
    //                     'field' => $field,
    //                     'teams' => $extractedTeams,
    //                     'count' => count($extractedTeams)
    //                 ]);
    //             }
    //         }
    //     }

    //     Log::info("Completed processing relation", [
    //         'relation' => $relationName,
    //         'total_users_extracted' => count(array_unique($users)),
    //         'total_teams_extracted' => count(array_unique($teams))
    //     ]);
    // }
    protected function extractFromCrossServiceRelation(
    array $data,
    string $relationName,
    array $fieldTypePairs,
    array &$users,
    array &$teams
    ): void {
        // Relation key does not exist
        if (!array_key_exists($relationName, $data)) {
            Log::info("Relation '{$relationName}' not found in data", [
                'available_keys' => array_keys($data),
            ]);
            return;
        }

        $relationData = $data[$relationName];

        // Null or empty relation
        if (empty($relationData)) {
            Log::info("Relation '{$relationName}' is empty or null");
            return;
        }

        // Normalize single object → array of objects
        if (is_array($relationData) && !array_is_list($relationData)) {
            $relationData = [$relationData];
        }

        // Still not iterable safely
        if (!is_array($relationData)) {
            Log::warning("Relation '{$relationName}' is not iterable", [
                'type' => gettype($relationData),
            ]);
            return;
        }

        // No fields defined
        if (empty($fieldTypePairs)) {
            Log::warning("No field-type pairs defined for relation '{$relationName}'");
            return;
        }

        Log::info("Processing cross-service relation", [
            'relation'    => $relationName,
            'items_count' => count($relationData),
            'pairs'       => $fieldTypePairs,
        ]);

        foreach ($relationData as $index => $relatedItem) {
            if (!is_array($relatedItem)) {
                Log::debug("Skipping non-array relation item", [
                    'relation' => $relationName,
                    'index'    => $index,
                ]);
                continue;
            }

            foreach ($fieldTypePairs as $pair) {
                if (!isset($pair['field'], $pair['type'])) {
                    continue;
                }

                $field = $pair['field'];
                $type  = $pair['type'];

                if (!array_key_exists($field, $relatedItem)) {
                    continue;
                }

                $value = $relatedItem[$field];

                if ($type === 'User') {
                    $extracted = $this->normalizeIds($value);
                    $users = array_merge($users, $extracted);

                    Log::debug("Users extracted", [
                        'relation' => $relationName,
                        'field'    => $field,
                        'count'    => count($extracted),
                    ]);
                }

                if ($type === 'Team') {
                    $extracted = $this->normalizeIds($value);
                    $teams = array_merge($teams, $extracted);

                    Log::debug("Teams extracted", [
                        'relation' => $relationName,
                        'field'    => $field,
                        'count'    => count($extracted),
                    ]);
                }
            }
        }

        // Deduplicate
        $users = array_values(array_unique($users));
        $teams = array_values(array_unique($teams));

        Log::info("Completed processing relation", [
            'relation' => $relationName,
            'users'    => count($users),
            'teams'    => count($teams),
        ]);
    }


    /**
     * Normalize IDs from various formats (scalar, array, object) to array of IDs
     */
    protected function normalizeIds($value): array
    {
        if (is_array($value)) {
            return array_map(fn ($v) => is_object($v) ? $v->id ?? null : $v, $value);
        }

        if (is_object($value)) {
            return [$value->id ?? null];
        }

        return [$value];
    }

    /**
     * Main method to get notification type and send notifications
     */
    public function getNotificationType(Request $request)
    {
        $class = $request->input('class');
        $action = $request->input('action');
        $data = $request->input('data', []);

        // Fetch notification configuration
        $notifies = $this->repository->find($class, $action);

        if (empty($notifies)) {
            return response()->json(['message' => 'Notification not found'], 404);
        }
        
        $processedCount = 0;
        $errors = [];

        foreach ($notifies as $index => $notify) {
            try {
                // Extract model name from class
                $modelName = $this->extractModelName($notify->class);
                
                // Filter cross-service relations (format: "relation:fields" or "service:relation")
                $crossServiceRelations = collect($notify->related_users ?? [])
                    ->filter(function ($relation) {
                        if (!is_string($relation)) {
                            return false;
                        }
                        // Match patterns like "assets:id|owner_id|team_ids" or "BaseService:assets"
                        return str_contains($relation, ':');
                    })
                    ->map(function ($relation) {
                        // Extract just the relation name for API call
                        // From "assets:id|owner_id|team_ids" -> "assets"
                        // From "BaseService:assets" -> "assets"
                        $parts = explode(':', $relation, 2);
                        return $parts[0];
                    })
                    ->unique()
                    ->values()
                    ->toArray();

                Log::info('Cross Service Relations Configured', [
                    'data' => $data,
                    'model' => $modelName,
                    'relations' => $crossServiceRelations,
                    'raw_related_users' => $notify->related_users ?? []
                ]);

                // Load cross-service relations if configured
                if (!empty($crossServiceRelations)) {
                    $modelConfig = ServiceRelationConfig::getServiceConfig($modelName);
                    
                    if (!$modelConfig) {
                        Log::warning("Model config not found for: {$modelName}");
                    } else {
                        Log::info('Fetching Cross Service Relations', [
                            'model' => $modelName,
                            'base_url' => $modelConfig['baseUrl'],
                            'route' => $modelConfig['route'],
                            'id' => $data['id'] ?? 'N/A'
                        ]);

                        try {
                            $response = Http::withToken(request()->bearerToken())
                                ->acceptJson()
                                ->get(
                                    $modelConfig['baseUrl'] . '/' . $modelConfig['route'] . '/' . ($data['id'] ?? ''),
                                    [
                                        'withRelations' => $crossServiceRelations,
                                    ]
                                );

                            if ($response->successful()) {
                                $loadedData = $response->json();
                                
                                // Merge loaded relation data into main data
                                $data = array_merge($data, $loadedData);
                                
                                Log::info('Cross Service Relations Loaded Successfully', [
                                    'relations_loaded' => array_keys($loadedData),
                                    'sample_data' => array_slice($loadedData, 0, 2, true) // Log first 2 relations as sample
                                ]);
                            } else {
                                Log::error('Failed to fetch cross-service relations', [
                                    'status' => $response->status(),
                                    'body' => $response->body()
                                ]);
                            }
                        } catch (\Exception $e) {
                            Log::error('Exception while fetching cross-service relations', [
                                'message' => $e->getMessage(),
                                'trace' => $e->getTraceAsString()
                            ]);
                        }
                    }
                }

                // Extract related user and team IDs using improved method
                $extractedIds = $this->extractRelatedIdsFromConfig(
                    $modelName, 
                    $data, 
                    $notify->related_users ?? []
                );
                            \Log::info("rRRRRRRRRRR" , [$extractedIds]);
                
                $configUsers = $extractedIds['users'];
                $configTeams = $extractedIds['teams'];

                Log::info("Extracted IDs from config", [
                    'index' => $index,
                    'config_users' => $configUsers,
                    'config_teams' => $configTeams,
                    'from_fields' => $notify->related_users ?? []
                ]);

                // Merge with notification's predefined users
                $allUsers = array_merge(
                    $configUsers,
                    is_array($notify->users) ? $notify->users : []
                );

                // Get unique user IDs
                $uniqueUsers = array_values(array_unique($allUsers));
                $roles = $notify->roles ?? [];

                Log::info("Final extracted users for notification", [
                    'index' => $index,
                    'unique_users' => $uniqueUsers,
                    'count' => count($uniqueUsers)
                ]);

                // Fetch specific users we need
                $usersData = [];
                if (!empty($uniqueUsers)) {
                    $usersData = $this->fetchSpecificUsers($uniqueUsers);
                    Log::info("Fetched user data", [
                        'index' => $index, 
                        'users_fetched' => count($usersData)
                    ]);
                }

                // Filter users without specific roles or teams
                $usersWithoutRoleOrTeam = [];
                if (!empty($roles) && !empty($configTeams)) {
                    $usersWithoutRoleOrTeam = $this->usersWithoutRoleOrTeam(
                        collect($usersData), 
                        $roles, 
                        $configTeams
                    );
                }

                $usersIds = $usersWithoutRoleOrTeam
                    ? $usersWithoutRoleOrTeam->pluck('id')->all()
                    : $uniqueUsers;

                Log::info("Final users for notification", [
                    'index' => $index, 
                    'users_count' => count($usersIds), 
                    'user_ids' => $usersIds
                ]);

                // Parse message with dynamic values
                $formattedMessage = $this->parseMessage($data, $notify->fillable, $notify->message);
                $formattedMessage = is_array($formattedMessage) ? implode(' ', $formattedMessage) : $formattedMessage;

                // Prepare result array
                $result = [
                    'id' => $notify->id,
                    'type' => $notify->type,
                    'class' => $notify->class,
                    'action' => $notify->action,
                    'status' => $notify->status,
                    'subject' => $notify->subject,
                    'fillable' => $notify->fillable,
                    'message' => $notify->message,
                    'users' => $usersIds,
                    'classId' => $data['id'] ?? '',
                    'roles' => $roles,
                    'teams' => $configTeams
                ];

                Log::info("About to dispatch notification", [
                    'index' => $index,
                    'type' => $notify->type,
                    'users_count' => count($usersIds)
                ]);
                
                // Send notifications based on type
                $this->dispatchNotification($notify->type, $result, $formattedMessage, $usersData);
                
                Log::info("Notification dispatched successfully", [
                    'index' => $index, 
                    'type' => $notify->type
                ]);
                
                $processedCount++;
                
            } catch (\Exception $e) {
                Log::error("Error processing notification", [
                    'index' => $index,
                    'type' => $notify->type ?? 'unknown',
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
                $errors[] = [
                    'index' => $index,
                    'type' => $notify->type ?? 'unknown',
                    'error' => $e->getMessage()
                ];
                continue;
            }
        }

        Log::info("Notification processing completed", [
            'total' => count($notifies),
            'processed' => $processedCount,
            'errors' => count($errors)
        ]);

        if (!empty($errors)) {
            return response()->json([
                'message' => 'Notifications sent with some errors',
                'processed' => $processedCount,
                'errors' => $errors
            ], 207);
        }

        return response()->json(['message' => 'Notification sent'], 200);
    }

    /**
     * Extract model name from full class path
     */
    protected function extractModelName(string $class): string
    {
        $parts = explode('\\', $class);
        return end($parts);
    }

    /**
     * Fetch only specific users by their IDs
     */
    protected function fetchSpecificUsers(array $userIds): array
    {
        if (empty($userIds)) {
            return [];
        }

        $userApiUrl = env('USERSERVICE') . '/user/getUsersByFilters';
        
        try {
            $response = Http::withHeaders([
                'Authorization' => "Bearer " . request()->bearerToken(),
                'Accept' => 'application/json',
                'Content-Type' => 'application/json',
            ])->post($userApiUrl, [
                'type' => 'specific',
                'user_ids' => $userIds,
            ]);

            if ($response->successful()) {
                $users = $response->json();
                return is_array($users) ? $users : [];
            }
        } catch (\Exception $e) {
            Log::error('Failed to fetch specific users: ' . $e->getMessage());
        }

        return [];
    }

    /**
     * Dispatch notification based on type
     */
    protected function dispatchNotification(string $type, array $result, string $formattedMessage, array $usersData)
    {
        Log::info("Dispatching notification", [
            'type' => $type, 
            'users_count' => count($result['users'] ?? [])
        ]);
        
        switch ($type) {
            case 'system':
                $this->sendSystemNotification($result, $formattedMessage);
                break;

            case 'auto':
                if (!empty($result['users'])) {
                    $this->sendAutoNotification($result, $formattedMessage);
                }
                break;

            case 'email':
                $this->sendEmailNotificationWithLog($result, $formattedMessage, $usersData);
                break;

            default:
                Log::warning("Unknown notification type: {$type}");
        }
    }

    /**
     * Send email notifications with database logging
     */
    protected function sendEmailNotificationWithLog(array $result, string $formattedMessage, array $usersData)
    {
        Log::info("Sending email notification", ['users' => $result['users']]);
        
        $notification = [
            'description' => $formattedMessage,
            'type' => $result['type'],
            'action' => $result['action'],
            'user_to' => $result['users'],
            'class' => $result['class'],
            'dataId' => $result['classId'],
            'roles' => $result['roles'],
            'teams' => $result['teams']
        ];
        
        $response = $this->repository->create($notification);
        
        Log::info("Email notification logged to database", [
            'notification_id' => $response->_id ?? 'unknown'
        ]);
        
        $this->sendEmailNotifications($result['users'], $usersData, $formattedMessage, $result['subject']);
    }

    /**
     * Send email notifications to multiple users
     */
    protected function sendEmailNotifications(array $userIds, array $usersData, string $message, string $subject)
    {
        foreach ($usersData as $user) {
            if (isset($user['id'], $user['email']) && in_array($user['id'], $userIds)) {
                $this->sendEmailNotification($user['email'], $message, $subject);
            }
        }
    }

    /**
     * Parse message with dynamic values
     */
    public function parseMessage($data, $fillable, $message)
    {
        if (!is_array($data)) {
            return strip_tags(html_entity_decode($message));
        }

        if (!is_array($fillable) || empty($fillable)) {
            return strip_tags(html_entity_decode($message));
        }

        foreach ($fillable as $field) {
            if (array_key_exists($field, $data)) {
                $value = $data[$field];
                if (is_array($value) || is_object($value)) {
                    $strValue = json_encode($value);
                } else {
                    $strValue = (string)$value;
                }
                $message = str_replace("{" . $field . "}", $strValue, $message);
            }
        }

        return strip_tags(html_entity_decode($message));
    }

    /**
     * Filter users without specific role or team
     */
    public function usersWithoutRoleOrTeam($userData, $roles, $allTeams)
    {
        $usersWithoutRoleOrTeam = collect($userData)->filter(function ($user) use ($roles, $allTeams) {
            $hasRole = false;
            if (!empty($roles) && is_array($roles)) {
                $hasRole = collect($roles)->contains(function ($role) use ($user) {
                    return isset($role['job_id'], $role['department_ids']) &&
                        $user['job_id'] === $role['job_id'] &&
                        in_array($user['department_id'], $role['department_ids']);
                });
            }

            $hasTeam = false;
            if (!empty($allTeams) && is_array($user['team_ids'] ?? [])) {
                $hasTeam = !empty(array_intersect($allTeams, $user['team_ids']));
            }

            return !$hasRole && !$hasTeam;
        })->values();

        return $usersWithoutRoleOrTeam;
    }

    /**
     * Send single email notification
     */
    public function sendEmailNotification($user, $notification, $subject)
    {
        $data['subject'] = $subject;
        $data['body'] = $notification;
        $data['email'] = $user;
        $this->emailConfigService->sendEmailService($data);
    }

    /**
     * Send System Notification
     */
    public function sendSystemNotification($result, $formattedMessage)
    {
        $notification['description'] = $formattedMessage;
        $notification['type'] = $result['type'];
        $notification['action'] = $result['action'];
        $notification['user_to'] = $result['users'];
        $notification['class'] = $result['class'];
        $notification['dataId'] = $result['classId'];
        $notification['roles'] = $result['roles'];
        $notification['teams'] = $result['teams'];
        
        $response = $this->repository->create($notification);
        
        $sentNotification = [
            'id' => $response->_id,
            "description" => $response->description,
            'created_at' => $response->created_at,
            'type' => $response->type,
            'user_to' => $response->user_to,
            'class' => $response->class,
            'classId' => $response->classId,
            'readers' => [],
        ];
    }

    /**
     * Send Auto Notification
     */
    protected function sendAutoNotification($result, $formattedMessage)
    {
        $notification['description'] = $formattedMessage;
        $notification['type'] = $result['type'];
        $notification['action'] = $result['action'];
        $notification['user_to'] = $result['users'];
        $notification['class'] = $result['class'];
        $notification['dataId'] = $result['classId'];
        $notification['roles'] = $result['roles'];
        $notification['teams'] = $result['teams'];
        
        $response = $this->repository->create($notification);
        
        $sentNotification = [
            'id' => $response->_id,
            "description" => $response->description,
            'created_at' => $response->created_at,
            'type' => $response->type,
            'user_to' => $response->user_to,
            'class' => $response->class,
            'classId' => $response->classId,
            'readers' => [],
        ];
        
        if ($response) {
            if (!empty($result['users'])) {
                foreach ($result['users'] as $user) {
                    broadcast(new Alert("notification", $user, $sentNotification))->toOthers();
                }
            }
            
            if (!empty($result['roles']) && isset($result['roles'][0]['id'])) {
                foreach ($result['roles'] as $role) {
                    broadcast(new Alert("role", $role['id'], $sentNotification))->toOthers();
                }
            }
            
            if (!empty($result['teams']) && isset($result['teams'][0])) {
                foreach ($result['teams'] as $team) {
                    broadcast(new Alert("team", $team, $sentNotification))->toOthers();
                }
            }
        }
    }

    // Additional methods remain the same...
    public function getUserNotifications($userId, $roleId, $teamIds): array
    {
        $teamIds = array_filter((array) $teamIds, fn($id) => !is_null($id));
        $notifications = $this->repository->getByUserId($userId, $roleId, $teamIds);

        if ($notifications->isEmpty()) {
            return [
                'message' => 'No notifications found for this user.',
                'user_id' => $userId,
                'notifications' => []
            ];
        }
        
        return [
            'user_id' => $userId,
            'notifications' => $notifications
        ];
    }

    public function markAsRead($id, $request)
    {
        $userId = $request->input('user_id');
        return $this->repository->markAsRead($id, $userId);
    }

    public function markAllNotificationsAsRead(string $userId)
    {
        return $this->repository->markAllAsRead($userId);
    }
        public function sendDirectNotification(Request $request)
    {
        $channel = strtolower(trim($request->input('channel', 'both')));
        $message = $request->input('message');     // Notification content
        $subject = $request->input('subject');     // Email subject (optional)
        $userIds = $request->input('userIds', []);
        $roleIds = $request->input('roleIds', []);
        $teamIds = $request->input('teamIds', []);
        $departmentIds = $request->input('departmentIds', []);
        $jobIds = $request->input('jobIds', []);
        $type = $request->input('type', ''); // specific | all
        // \Log::info('$requestssssssssssssssssssssss', [$request->all()]);

        $usersThatWillReceiveNotification = $this->getUniqueUsers($type,$userIds, $teamIds, $roleIds, $departmentIds, $jobIds);
        $emailsFromUsers = array_map(function ($user) {
                return $user['email'];
            }, $usersThatWillReceiveNotification);
        // \Log::alert("emailsFromUsers", $emailsFromUsers);
        $usersThatWillReceiveNotificationIds = collect($usersThatWillReceiveNotification)->pluck('id')->all();
        $notification = [
            'description' => $message,
            'subject'     => $subject,
            'type'        => 'system',
            'action'      => $request->input('action', 'custom'),
            'class'       => $request->input('class', 'custom'),
            'user_to'     =>  $usersThatWillReceiveNotificationIds,
        ];

        // 1. Email notification
        if (in_array($channel, ['email', 'both'])) {

           $uniqueUsers = collect($usersThatWillReceiveNotification)
            ->unique('email') // keep first occurrence of each email
            ->values()        // reset array keys
            ->all();

            foreach ($uniqueUsers as $user) {
                $email = $user['email'] ?? null;
                if (!$email) {
                    continue; // Skip if no email
                }
                $this->sendEmailNotification($email, $message, $subject ?? 'Notification');
                }
        }
        // 2. System notification
        if (in_array($channel, ['system', 'both'])) {
            $response = $this->repository->create($notification);

            $sentNotification = [
                'id'          => $response->_id,
                'description' => $response->description,
                'created_at'  => $response->created_at,
                'type'        => 'system',
                'user_to'     => $response->user_to,
                'class'       => $response->class,
                // 'classId'     => $response->classId,
                'readers'     => [],
            ];
            // Broadcast to users
            foreach ($usersThatWillReceiveNotificationIds as $userId) {
                broadcast(new Alert("notification", $userId, $sentNotification))->toOthers();
            }
        }



        return response()->json(['message' => 'Notification sent successfully']);
    }
        /**
     * Fetch users from the user service based on various criteria
     *
     * @param array $userIds List of user IDs
     * @param array $teamIds List of team IDs
     * @param array $roleIds List of role IDs
     * @param array $departmentIds List of department IDs
     * @param array $jobIds List of job IDs
     * @return array Returns the list of users or empty array if request fails
     */
    public function getUniqueUsers($type,$userIds = [], $teamIds = [], $roleIds = [], $departmentIds = [], $jobIds = [])
    {
        try {
            $userApiUrl = env('USERSERVICE') . '/user/getUsersByFilters';
            $response = Http::withHeaders([
                'Authorization' => "Bearer " . request()->bearerToken(),
                'Accept' => 'application/json',
                'Content-Type' => 'application/json',
            ])->post($userApiUrl, [
                'type' => $type,
                'user_ids' => $userIds,
                'team_ids' => $teamIds,
                'role_ids' => $roleIds,
                'department_ids' => $departmentIds,
                'job_ids' => $jobIds
            ]);

            if ($response->successful()) {
                $users = $response->json();

                // Ensure we're working with an array
                if (!is_array($users)) {
                    return [];
                }

                // Convert to collection for easier manipulation
                return collect($users)
                    ->unique('id') // Remove duplicates based on id
                    ->values() // Reset array keys
                    ->all(); // Convert back to array
            }

            return [];
        } catch (\Exception $e) {
            return [];
        }
    }
}