<?php

namespace App\Repositories\Eloquent\Department;

use App\Models\Department\Department;
use App\Models\SystemSetting\SystemSetting;
use App\Repositories\BaseRepository;
use Illuminate\Validation\ValidationException;

/**
 * Class DepartmentRepository
 * Handles data operations related to the Department model.
 */
class DepartmentRepository extends BaseRepository
{
    /**
     * DepartmentRepository constructor.
     * Initializes with the Department model.
     */
    public function __construct()
    {
        parent::__construct(new Department());
    }

    /**
     * Bulk insert multiple department records.
     *
     * @param array $data
     * @return bool
     */
    public function saveMany(array $data)
    {
        return $this->model->insert($data);
    }


    public function getDepartments($id)
    {
        return Department::find(substr($id, 1));
    }

    /**
     * Create a new department and manage job relationships.
     *
     * @param array $data
     * @return Department
     */
    public function create($data = null)
    {
        $data['type'] = $data['type'] ?? 'GRC';

        $department = parent::create($data);
        $this->syncJobs($department, $data['job_ids'] ?? []);

        return $department;
    }

    /**
     * Update a department with validations.
     *
     * @param int $id
     * @param array $data
     * @return Department
     */
    public function update($id, $data = null)
    {
        $department = $this->show($id, ['children', 'jobs', 'users']);

        $this->validateJobAssignments($department, $data);

        $this->validateEmployeeCount($department, $data);

        if (!empty($data['parent_id'])) {
            $this->changeDepartmentParent($department, $data['parent_id']);
        }

        $updatedDepartment = parent::update($id, $data);
        $this->syncJobs($updatedDepartment, $data['job_ids'] ?? []);

        return $updatedDepartment;
    }

    /**
     * Ensure jobs being removed do not have assigned users.
     */
    private function validateJobAssignments($department, &$data)
    {
        $users = $department->users->pluck('job_id')->toArray();
        $jobIds = array_filter($data['job_ids'] ?? []);

        foreach ($department->jobs as $job) {
            if (!in_array($job->id, $jobIds) && in_array($job->id, $users)) {
                throw ValidationException::withMessages(['job_ids' => 'Cannot delete job with assigned users.']);
            }
        }

        $data['job_ids'] = $jobIds;
    }
    /**
     * Ensure new manager is not assigned to a job.
     */

    /**
     * Ensure new employee count is not less than current employees.
     */
    private function validateEmployeeCount($department, $data)
    {
        if (!empty($data['number_of_employees']) && $department->users->count() > $data['number_of_employees']) {
            throw ValidationException::withMessages([
                'number_of_employees' => 'Number of employees must be at least the current count.',
            ]);
        }
    }

    /**
     * Change department parent while avoiding cycles.
     */
    private function changeDepartmentParent($department, $newParentId)
    {
        if ($department->id == $newParentId) {
            throw ValidationException::withMessages(['parent_id' => 'A department cannot be its own parent.']);
        }

        $newParent = Department::findOrFail($newParentId);

        if ($this->isDescendant($newParent, $department->id)) {
            // Link new parent to old parent to maintain hierarchy
            $newParent->parent_id = $department->parent_id;
            $newParent->save();
            // throw ValidationException::withMessages(['parent_id' => 'Invalid move: Creates a hierarchy loop.']);
        }
    }

    /**
     * Check if a department is a descendant of another.
     */
    private function isDescendant($department, $targetId)
    {
        while ($department) {
            if ($department->id == $targetId) return true;
            $department = $department->parent;
        }
        return false;
    }

    /**
     * Sync job assignments for a department.
     */
    private function syncJobs($department, array $jobIds)
    {
        if (!empty($jobIds)) {
            $department->jobs()->detach();
            $department->jobs()->attach($jobIds);
        } else {
            $department->jobs()->detach();
        }
    }

    /**
     * Delete a department with dependency checks.
     */
    public function delete($id)
    {
        // Ensure $recordIds is properly retrieved
        $recordIds = request()->input('recordIds', []); // Default to an empty array if not present
        $id = $recordIds[0] ?? $id; // Safely get the first ID if it's an array, otherwise fallback
        $department = $this->show($id, ['children', 'jobs']);

        if ($department->children()->exists()) {
            throw ValidationException::withMessages(['department' => 'Department has child departments.']);
        }

        if ($department->users()->where('status', 'active')->exists()) {
            throw ValidationException::withMessages(['department' => 'Department has active employees.']);
        }

        if ($department->jobs()->exists()) {
            throw ValidationException::withMessages(['department' => 'Department has assigned jobs.']);
        }

        return parent::delete($id);
    }

    // Khaled
    public function getSetting($setting, $default = false)
    {
        return SystemSetting::where('type', $setting)->value('data') ?? $default;
    }

    public function changeRequestsResponsibleDepartmentId()
    {
        return $this->getSetting("change_requests_responsible_department_id");
    }

    public function changeRequestsResponsibleDepartmentManagerId()
    {
        $departmentId = $this->changeRequestsResponsibleDepartmentId();
        return $departmentId ? Department::where('_id', $departmentId)->value('manager_id') : null;
    }

    public function isDepartmentManager()
    {
        return Department::where('manager_id', auth()->guard('api')->id())->exists();
    }

    public function managerIds()
    {
        return Department::pluck('manager_id')->toArray();
    }

    public function getDepartmentsByManager($currentUserId)
    {
        return Department::where('manager_id', $currentUserId)->get();
    }

    public function assignLeader($department, $request)
    {
        // Get the leadership area from the request
        $leaderFor = $request->leader_for;

        // Set the user as a leader for the specified area
        // Use the string from $leaderFor as the property name
        $department->$leaderFor = $request->user_id;
         $department->save();
        return $department;
    }

    public function departmentManagers($department_id)
    {
        $department = \App\Models\Department\Department::where('_id', $department_id)->first();
        if ($department) {
            $position_id = $department->manager_id;
            $jobs = $department->jobs;

            // Fetch job_ids from the jobs table where position_id matches and department_ids contains the department's id
            $job_ids = $jobs->where('position_id', $position_id)->pluck('id');

            // Fetch user IDs (kpi_owners) where department_id matches and job_id is in the fetched job_ids
            $departmentManagers = \App\Models\User\User::where('department_id', $department->id)->whereIn('job_id', $job_ids)->get();

            return response()->json($departmentManagers);
        }
    }

    public function allDepartmentManagersIds()
    {
        $departments = Department::all();
        $allManagerIds = [];
        foreach ($departments as $department) {
            $position_id = $department->manager_id;
            $jobs = $department->jobs;
            $job_ids = $jobs->where('position_id', $position_id)->pluck('id');
            $managerIds = User::where('department_id', $department->id)
                ->whereIn('job_id', $job_ids)
                ->pluck('id');

            $allManagerIds = array_merge($allManagerIds, $managerIds->toArray());
        }

        return array_unique($allManagerIds);
    }

    public function departmentEmployees($department_id)
    {
        $department = Department::with('employees')->find($department_id);
        if($department){
            return $department->employees->pluck('id')->toArray();
        }
        return [];
    }
}
