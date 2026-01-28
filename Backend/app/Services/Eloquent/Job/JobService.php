<?php

namespace App\Services\Eloquent\Job;

use App\Models\Job\Job;
use App\Services\BaseService;
use Illuminate\Http\Request;
use App\Repositories\Eloquent\Job\JobRepository;
use Illuminate\Validation\ValidationException;

class JobService extends BaseService
{
    protected $jobRepository;

    public function __construct(JobRepository $jobRepository)
    {
        $this->jobRepository = $jobRepository;
        parent::__construct($jobRepository);
    }



    public function delete($id)
    {
        $ids = ($id == 0) ? request()->input('recordIds', []) : [$id];

        foreach ($ids as $id) {
            if ($this->jobRepository->isJobAssigned($id)) {
                return false;
            }
            $this->repository->delete($id);
            $deletedItem = $this->repository->show($id);

            $this->sendDataToPushNotification(substr(class_basename(static::class), 0, -strlen('Service')), 'delete', request()->bearerToken(), $deletedItem);
            return true;
        }


    }

    public function validateData(Request $request, $type = 'store')
    {
        if ($request->has('department_ids') && ($request->department_ids == null || $request->department_ids == [null])) {
            $request->merge(['department_ids' => []]);
        }
        $validate = [
            'name' => 'required|unique:jobs,name,' . $request->id . ',id,deleted_at,NULL',
            'code' => 'required|unique:jobs,code,' . $request->id . ',id,deleted_at,NULL',
            // 'description' => 'required',
            'department_ids' => 'nullable',
            'position_id' => 'nullable',
        ];
        $store = [...$validate];
        if ($type == 'store') {
            $request->validate($store);
        }
        if ($type == 'update') {
            $request->validate($validate);
        }
        return $request->all();
    }


    public function update($id, Request $request)
    {

        if ($request->is_manager == 'true' || $request->is_manager == true) {
            // Load departments without withCount since MongoDB doesn't support it
            $job = $this->repository->show($id, ['departments.users']);

            // Manually count users for each department if needed
            if ($job->departments) {
                $job->departments->each(function ($department) {
                    // same department can't have multiple users if job is manager
                    if ($department->users()->count() > 2) {
                        throw ValidationException::withMessages(['is_manager' => 'Cannot set as manager. There are multiple users assigned to this department.']);
                    }
                    if ($department->jobs()->where('is_manager', true)->where('id', '!=', $job->id)->exists()) {
                        throw ValidationException::withMessages(['is_manager' => 'Cannot set as manager. Another job is already assigned as manager for department: ' . $department->name]);
                    }
                });
            }

        }
        return parent::update($id, $request);
    }
}
