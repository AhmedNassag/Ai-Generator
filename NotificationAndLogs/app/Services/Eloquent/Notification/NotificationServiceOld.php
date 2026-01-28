<?php

namespace App\Services\Eloquent\Notification;

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

class NotificationService extends BaseService
{

    protected $emailConfigService;

    public function __construct()
    {
        parent::__construct(new NotificationRepository());
        $this->emailConfigService = new EmailConfigService();
    }

    protected function validateData(Request $request, $type = 'store')
    {
        $validate = [
            // 'user_to' => 'required',
            // 'types' => 'required|in:system,email,auto',
            // 'description' => 'required|string',
        ];
        $store = [...$validate];
        if ($type == 'store') {
            $request->validate($store);
        }

        if ($type == 'update') {
            $request->validate($validate);
        }
        if ($type == 'updateOrCreate') {
            $request->validate($validate);
        }
        return $request->all();
    }

    public function getUserNotifications($userId, $roleId, $teamIds): array
    {
        // $payload = JWTAuth::setToken($token)->getPayload();
        // $userId = $payload->get('sub'); // 'sub' is usually the user ID
        // filter the teamsIds from any null values
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

    public function parseMessage($data, $fillable, $message)
    {
        if (!is_array($data)) {
            return strip_tags(html_entity_decode($message));
        }

        // If $fillable is not provided or empty, skip replacement
        if (!is_array($fillable) || empty($fillable)) {
            return strip_tags(html_entity_decode($message));
        }

        // Replace placeholders
        foreach ($fillable as $field) {
            if (array_key_exists($field, $data)) {
                // Ensure value is a string
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


    public function getNotificationType(Request $request)
    {
        $class = $request->input('class');
        $action = $request->input('action');
        $data = $request->input('data', []);
        $users = $request->input('users'); // Get users from request if any

        // Fetch notification
        $notifies = $this->repository->find($class, $action);

        if (empty($notifies)) {
            return response()->json(['message' => 'Notification not found'], 404);
        }

        $userApiUrl = env('USERSERVICE', 'http://82.29.175.67:6161/api') . '/user';
        $teamApiUrl = env('USERSERVICE', 'http://82.29.175.67:6161/api') . '/team';

        $userData = [];
        $teamData = [];

        if ($userApiUrl) {
            $response = Http::withHeaders([
                'Authorization' => "Bearer " . request()->bearerToken(),
            ])->get($userApiUrl);

            if ($response->successful()) {
                $userData = $response->json();
            }
        }

        if ($teamApiUrl) {
            $response = Http::withHeaders([
                'Authorization' => "Bearer " . request()->bearerToken(),
            ])->get($teamApiUrl);

            if ($response->successful()) {
                $teamData = $response->json();
            }
        }

        foreach ($notifies as $notify) {
            // Format notification data
            $result = [
                'id' => $notify->id,
                'type' => $notify->type,
                'class' => $notify->class,
                'action' => $notify->action,
                'status' => $notify->status,
                'subject' => $notify->subject,
                'fillable' => $notify->fillable,
                'message' => $notify->message,
                'roles' => $notify->roles,
                'users' => is_array($notify->users) ? $notify->users : [],
                'classId' => $data ? $data['id'] : "",
                'roles' => [],
                'teams' => []
            ];

            $relatedFields = $notify['related_users'] ?? [];

            $allUsers = [];
            $allTeams = [];

            if (!empty($relatedFields) && is_array($relatedFields)) {
                foreach ($relatedFields as $field) {
                    if (isset($data[$field])) {
                        if (is_array($data[$field])) {
                            foreach ($data[$field] as $item) {
                                if (is_array($item) && isset($item['id'])) {
                                    $allUsers[] = $item['id'];
                                    $allTeams[] = $item['id'];
                                } elseif (is_object($item) && isset($item->id)) {
                                    $allUsers[] = $item->id;
                                    $allTeams[] = $item->id;
                                } else {
                                    $allUsers[] = $item;
                                    $allTeams[] = $item;
                                }
                            }
                        } elseif (is_object($data[$field]) && isset($data[$field]->id)) {
                            $allUsers[] = $data[$field]->id;
                            $allTeams[] = $data[$field]->id;
                        } else {
                            $allUsers[] = $data[$field];
                            $allTeams[] = $data[$field];
                        }
                    }
                }
            }

            if (!empty($notify['users']) && is_array($notify['users'])) {
                $allUsers = array_merge($allUsers, $notify['users']);
            }

            $uniqueUsers = array_values(array_unique($allUsers));
            $roles = $notify['roles'] ?? [];

            $usersData = collect($userData)
                ->filter(function ($user) use ($uniqueUsers) {
                    return is_array($uniqueUsers) && isset($user['id']) && in_array($user['id'], $uniqueUsers);
                })
                ->unique('id')
                ->values();

            $usersWithoutRoleOrTeam = [];
            if (!empty($roles) && !empty($allTeams)) {
                $usersWithoutRoleOrTeam = $this->usersWithoutRoleOrTeam($usersData, $roles, $allTeams);
            }

            $usersIds = $usersWithoutRoleOrTeam
                ? $usersWithoutRoleOrTeam->pluck('id')->all()
                : $uniqueUsers;

            // Parse the message with dynamic values
            $formattedMessage = $this->parseMessage($data, $notify->fillable, $notify->message);
            $formattedMessage = is_array($formattedMessage) ? implode(' ', $formattedMessage) : $formattedMessage;

            $result['roles'] = $roles;
            $result['teams'] = $allTeams;

            // Notification type handling
            if ($notify->type == 'system') {
                $result['users'] = $usersIds;
                $this->sendSystemNotification($result, $formattedMessage);
            } elseif ($notify->type == 'auto' && !empty($usersIds)) {
                $result['users'] = $usersIds;
                $this->sendAutoNotification($result, $formattedMessage);
            } elseif ($notify->type == 'email') {
                // Ensure correct data format before sending
                $usersList = isset($userData['data']) && is_array($userData['data'])
                    ? $userData['data']
                    : (is_array($userData) ? $userData : []);

                foreach ($usersList as $user) {
                    if (
                        isset($user['id'], $user['email']) &&
                        in_array($user['id'], $usersIds)
                    ) {
                        $this->sendEmailNotification($user['email'], $formattedMessage, $notify->subject);
                    }
                }
            } else {
                return response()->json(['message' => 'Unknown notification type'], 400);
            }
        }

        return response()->json(['message' => 'Notification sent'], 200);
    }

    public function getUserIdsFromTeams(array $teamsData, array $teamIds): array
    {
        $userIdsFromTeams = [];

        foreach ($teamsData as $team) {
            if (in_array($team['id'], $teamIds)) {
                foreach ($team['user_ids'] as $userId) {
                    $userIdsFromTeams[] = $userId;
                }
            }
        }

        // Remove duplicates and re-index
        return array_values(array_unique($userIdsFromTeams));
    }

    public function usersWithoutRoleOrTeam($userData, $roles, $allTeams)
    {
        $usersWithoutRoleOrTeam = collect($userData)->filter(function ($user) use ($roles, $allTeams) {
            // Check if user has one of the specified roles
            $hasRole = false;
            if (!empty($roles) && is_array($roles)) {
                $hasRole = collect($roles)->contains(function ($role) use ($user) {
                    return isset($role['job_id'], $role['department_ids']) &&
                        $user['job_id'] === $role['job_id'] &&
                        in_array($user['department_id'], $role['department_ids']);
                });
            }

            // Check if user is in any of the specified team IDs
            $hasTeam = false;
            if (!empty($allTeams) && is_array($user['team_ids'] ?? [])) {
                $hasTeam = !empty(array_intersect($allTeams, $user['team_ids']));
            }

            // Return only users that have NO matching role AND NO matching team
            return !$hasRole && !$hasTeam;
        })->values();

        return  $usersWithoutRoleOrTeam;
    }
    // Send Email Notification
    public function sendEmailNotification($user, $notification, $subject)
    {
        $data['subject'] = $subject;
        $data['body'] = $notification;
        $data['email'] = $user;
        $this->emailConfigService->sendEmailService($data);
    }

    // Send System Notification
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
            if (!empty($result['teams']) && $result['teams'][0] != null) {
                foreach ($result['teams'] as $team) {
                    broadcast(new Alert("team", $team, $sentNotification))->toOthers();
                }
            }
        }
    }

    // Send Auto Notification
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
            if (!empty($result['teams']) && isset($result['roles'][0]['id'])) {
                foreach ($result['teams'] as $team) {
                    broadcast(new Alert("team", $team, $sentNotification))->toOthers();
                }
            }
        }
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
