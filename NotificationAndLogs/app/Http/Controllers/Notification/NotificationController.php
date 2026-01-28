<?php

namespace App\Http\Controllers\Notification;

use App\Http\Controllers\Utils\BaseController;
use App\Models\Notification\Notification;
use App\Models\NotificationSetting\NotificationSetting;
use App\Services\Eloquent\Notification\NotificationService;
use App\Models\User\User;
use App\Notifications\genralNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * NotificationController Class
 *
 * This controller is responsible for handling all Notification-related actions, such as creating, reading, updating,
 * and deleting Notification records. It extends the BaseController to leverage generic CRUD functionality, ensuring
 * a consistent and maintainable code structure. The NotificationController relies on the NotificationService to manage
 * Notification-specific business logic and interactions with the data layer.
 *
 * By extending the BaseController, this class benefits from pre-defined methods for handling HTTP requests,
 * error handling, and standardized response formatting. This promotes reusability and reduces code duplication
 * across different controllers in the application.
 */
class NotificationController extends BaseController
{
    /**
     * Constructor for NotificationController.
     *
     * Initializes the BaseController with the specific NotificationService instance to ensure that
     * all Notification-related operations are routed through the appropriate service layer.
     *
     * @param NotificationService $service The service layer responsible for Notification-specific business logic.
     *
     */
    public function __construct(NotificationService $service)
    {
        // Pass the NotificationService instance to the parent constructor to initialize the base service.
        parent::__construct($service);

    }

        public function getUserNotifications(Request $request,$userId){
            $roleId = $request->input('role_id');
            $teamIds = $request->input('team_ids');
            $user = $this->baseService->getUserNotifications($userId , $roleId, $teamIds);
            return response()->json($user);
        }
        public function markAsRead(Request $request, $id)
        {
            $notification = $this->baseService->markAsRead($id , $request);

            if ($notification) {
                return response()->json(['message' => 'Notification marked as read'], 200);
            }

            return response()->json(['message' => 'Notification not found'], 404);
        }
        public function markAllAsRead(string $userId)
        {
            $success = $this->baseService->markAllNotificationsAsRead($userId);

            if ($success) {
                return response()->json([
                    'success' => true,
                    'message' => 'All notifications marked as read'
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Failed to mark notifications as read'
            ], 500);
        }

        public function getNotificationType(Request $request)
        {
            try {
                $item = $this->baseService->getNotificationType($request);
               return $this->success($item, 'Notifications and Logs subscribed successfully');
            } catch (\Exception $e) {
                // Return an error response if the deletion fails.
                return $this->error([$e->getMessage()]);
            }
        }

    public function sendDirectNotification(Request $request)
    {
        try {
            $item = $this->baseService->sendDirectNotification($request);
            return $this->success($item, 'sent successfully');
        } catch (\Exception $e) {
            // Return an error response if the deletion fails.
            return $this->error([$e->getMessage()]);
        }
    }



}
