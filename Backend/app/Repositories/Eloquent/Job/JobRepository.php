<?php

namespace App\Repositories\Eloquent\Job;

use App\Models\Job\Job;
use App\Models\User\User;
use App\Repositories\BaseRepository;

/**
 * JobRepository
 *
 * This class is responsible for handling the data operations related to the Job model.
 * It extends the BaseRepository class, leveraging the shared repository functionality,
 * such as CRUD operations, and specifies the Job model as its target entity.
 */
class JobRepository extends BaseRepository
{
    /**
     * JobRepository constructor.
     *
     * Initializes the repository by passing an instance of the Job model to the parent BaseRepository.
     * This setup allows the BaseRepository methods to work specifically with Job data.
     */
    public function __construct()
    {
        // Pass a new instance of the Job model to the parent BaseRepository constructor
        parent::__construct(new Job());
    }

    public function isJobAssigned($id)
    {
        // Find the job by ID
        $job = $this->model->find($id);

        if (!$job) {
            return false; // Job not found
        }

        // Check if any of the required fields are populated
        $hasDepartmentIds = !empty($job['department_ids']); // Check if department_ids is a non-empty array
        // $hasPositionId = !empty($job['position_id']); // Check if position_id is not null or empty
        $hasUserIds = $this->model->where('id', $id)->whereHas('users')->exists(); // Check if user_ids is a non-empty array

        // Return true if any of the fields are populated
        return $hasDepartmentIds || $hasUserIds;
    }

    public function update($id, $data = null)
    {
        $job = parent::update($id, $data);
        if (isset($data['department_ids'])) {
            $departmentIds = count($data['department_ids']) > 0 ? $data['department_ids'] : [];

            $job->departments()->detach();
            $job->departments()->attach($departmentIds);
        }
        return $job;
    }

    public function create($data = null)
    {
        $job = parent::create($data);
        if (!isset($data['department_ids'])) {
            $data['department_ids'] = [];
        }
        $job->departments()->attach($data['department_ids']);
        return $job;

    }
    public function getJob($job_ids)
    {
        return Job::whereIn('_id', $job_ids)->get();
    }

}
