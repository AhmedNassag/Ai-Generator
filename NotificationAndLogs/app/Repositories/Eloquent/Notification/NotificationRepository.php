<?php

namespace App\Repositories\Eloquent\Notification;

use App\Models\Notification\Notification;
use App\Models\NotificationSetting\NotificationSetting;
use App\Repositories\BaseRepository;
use MongoDB\BSON\ObjectId;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use MongoDB\BSON\UTCDateTime;

/**
 * NotificationRepository
 *
 * This class is responsible for handling the data operations related to the Notification model.
 * It extends the BaseRepository class, leveraging the shared repository functionality,
 * such as CRUD operations, and specifies the Notification model as its target entity.
 */
class NotificationRepository extends BaseRepository
{
    /**
     * NotificationRepository constructor.
     *
     * Initializes the repository by passing an instance of the Notification model to the parent BaseRepository.
     * This setup allows the BaseRepository methods to work specifically with Notification data.
     */
    public function __construct()
    {
        // Pass a new instance of the Notification model to the parent BaseRepository constructor
        parent::__construct(new Notification());

    }
    public function getByUserId($userId , $roleId, $teamIds)
    {
        // return $this->model
        // ->where('user_to',$userId)
        // ->get();
          return $this->model
            ->where(function ($query) use ($userId, $roleId, $teamIds) {
                $query->where('user_to', $userId)
                    ->orWhere('roles.id', $roleId)
                    ->orWhereIn('teams', $teamIds);
            })
            ->orderBy('created_at', 'desc')
            ->get();

    }

    /**
     * Create a new notification.
     *
     * @param array $data The data for the notification.
     * @return Notification
     */
    public function create($data = null): Notification
    {
        return $this->model->create($data);
    }


        public function markAsRead($id,$userId)
        {
            $result = Notification::raw()->updateOne(
                ['_id' => new ObjectId($id)],
                ['$addToSet' => ['readers' => $userId]] // avoids duplicates
            );
            if ($result->getModifiedCount()) {
                return response()->json(['message' => 'Notification marked as read']);
            } else {
                return response()->json(['message' => 'Notification not found or not updated'], 404);
            }

        }

    public function markAllAsRead(string $userId)
    {
        $now = new UTCDateTime(Carbon::now()->getTimestamp() * 1000);
        try{
        $result = Notification::raw()->updateMany(
            ['readers' => ['$ne' => $userId]], // Only where userId not already in readers
            ['$addToSet' => ['readers' => $userId]] // Add userId, avoid duplicates
        );
        return response()->json(['message' => 'All notifications marked as read']);

       }catch (\Exception $e) {
        return response()->json(['message' => 'Notifications marked as read']);
        }
    }
    public function find($class, $action)
    {
        $actions = [$action];

        if ($action === 'delete') {
            $actions[] = 'destroy'; // also include 'destroy' when action is 'delete'
        }
        if ($action === 'edit') {
            $actions[] = 'update'; // also include 'destroy' when action is 'delete'
        }

        $response =  NotificationSetting::whereIn('action', $actions)->where('class', $class)
            ->where('status', "true")
            ->get();

        \Log::info("Notification settings found: ", [$response]);
        return $response;
    }
}
