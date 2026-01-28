<?php

namespace App\Repositories\Eloquent\LogSetting;

use App\Models\LogSetting\LogSetting;
use App\Repositories\BaseRepository;

/**
 * LogSettingRepository
 *
 * This class is responsible for handling the data operations related to the LogSetting model.
 * It extends the BaseRepository class, leveraging the shared repository functionality,
 * such as CRUD operations, and specifies the LogSetting model as its target entity.
 */
class LogSettingRepository extends BaseRepository
{
    /**
     * LogSettingRepository constructor.
     *
     * Initializes the repository by passing an instance of the LogSetting model to the parent BaseRepository.
     * This setup allows the BaseRepository methods to work specifically with LogSetting data.
     */
    public function __construct()
    {
        // Pass a new instance of the LogSetting model to the parent BaseRepository constructor
        parent::__construct(new LogSetting());
    }

    public function insert($data)
    {
        LogSetting::truncate();
        $logSettings[] = [
            "class" => "Comment",
            "action" => "create",
            "status" => "active"
        ];
        LogSetting::insert($logSettings);
        return LogSetting::insert($data);
    }
}
