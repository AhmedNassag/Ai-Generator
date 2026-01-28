<?php

namespace App\Repositories\Eloquent\NotificationSetting;

use App\Models\NotificationSetting\NotificationSetting;
use App\Repositories\BaseRepository;
use Illuminate\Database\Eloquent\Model;


 /**
 * NotificationSettingRepository
 *
 * This class is responsible for handling the data operations related to the NotificationSetting model.
 * It extends the BaseRepository class, leveraging the shared repository functionality,
 * such as CRUD operations, and specifies the NotificationSetting model as its target entity.
 */
class NotificationSettingRepository extends BaseRepository
{
    /**
     * NotificationSettingRepository constructor.
     *
     * Initializes the repository by passing an instance of the NotificationSetting model to the parent BaseRepository.
     * This setup allows the BaseRepository methods to work specifically with NotificationSetting data.
     */
    public function __construct()
    {
        // Pass a new instance of the NotificationSetting model to the parent BaseRepository constructor
        parent::__construct(new NotificationSetting());
    }

    public function insert($data)
    {
        NotificationSetting::truncate();
        $notificationSettings[] = [
            "type" => "system",
            "class" => "Comment",
            "action" => "create",
            "status" => false
        ];
        $notificationSettings[] = [
            "type" => "auto",
            "class" => "Comment",
            "action" => "create",
            "status" => false
        ];
        $notificationSettings[] = [
            "type" => "email",
            "class" => "Comment",
            "action" => "create",
            "status" => false
        ];
        NotificationSetting::insert($notificationSettings);
        return NotificationSetting::insert($data);
    }
}
