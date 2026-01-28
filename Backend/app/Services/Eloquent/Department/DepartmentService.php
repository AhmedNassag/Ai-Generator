<?php

namespace App\Services\Eloquent\Department;

use App\Services\BaseService;
use Illuminate\Http\Request;
use App\Repositories\Eloquent\Department\DepartmentRepository;
use App\Repositories\Eloquent\Job\JobRepository;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

/**
 * Class DepartmentService
 * Handles department-related business logic.
 */
class DepartmentService extends BaseService
{
    protected $departmentRepository;
    protected $jobRepository;

    public function __construct(DepartmentRepository $departmentRepository, JobRepository $jobRepository)
    {
        $this->jobRepository = $jobRepository;
        $this->departmentRepository = $departmentRepository;

        parent::__construct(new DepartmentRepository());
    }
  /**
     * Validate department data before processing.
     */
    protected function validateData(Request $request, $type = 'store')
    {
        if($request->has('job_ids') && ($request->job_ids == null || $request->job_ids == [null])){
            $request->merge(['job_ids' => []]);
        }
        $commonRules = [
            'color_id' => 'nullable|exists:colors,_id',
            'parent_id' => 'nullable|exists:departments,_id',
            'manager_id' => 'nullable|exists:positions,_id',
            'number_of_employees' => 'nullable|numeric|min:1|max:10000',
            'vision' => 'nullable|string|max:10000',
            'message' => 'nullable|string|max:10000',
            'mission' => 'nullable|string|max:10000',
            'objectives' => 'nullable|string|max:10000',
            'responsibilities' => 'nullable|string|max:10000',
            'job_ids' => 'nullable|array',
            'job_ids.*' => 'exists:jobs,_id',
        ];

        $storeRules = [
            'name' => 'required|min:1|max:255|unique:departments,name',
            'code' => 'required|min:1|max:255|unique:departments,code',
            'type' => 'nullable|string|in:GRC,LDAP',
        ];

        $updateRules = [
            'name' => ['required', 'min:1', 'max:255', Rule::unique('departments')->ignore($request->id)],
            'code' => ['required', 'min:1', 'max:255', Rule::unique('departments')->ignore($request->id)],
        ];

        $rules = array_merge($commonRules, $type === 'store' ? $storeRules : $updateRules);
        $request->validate($rules);

        return $request->all();
    }

    public function create(Request $request)
    {
        $jobs = $this->getJobsByIds($request->job_ids ?? []);
        $hasMultiJobManagers = $this->hasMultiJobManagedUsers($jobs);
        if($hasMultiJobManagers){
            throw ValidationException::withMessages(['is_manager' => 'Cannot assign multiple manager jobs to the same department.']);
        }
        if($jobs){
            foreach($jobs as $job){
                if($job->is_manager){
                   $request->merge(['manager_id' => $job->position_id]);
                }
            }
        }
        return parent::create($request);
    }

    public function update($id, Request $request)
    {
        $jobs = $this->getJobsByIds($request->job_ids ?? []);
        $hasMultiJobManagers = $this->hasMultiJobManagedUsers($jobs);
        if($hasMultiJobManagers){
            throw ValidationException::withMessages(['is_manager' => 'Cannot assign multiple manager jobs to the same department.']);
        }
        if($jobs){
            foreach($jobs as $job){
                if($job->is_manager){
                   $request->merge(['manager_id' => $job->position_id]);
                }
            }
        }
        return parent::update($id, $request);
    }

  

    public function departmentManagers($id)
    {
        return $this->repository->departmentManagers($id);
    }
    /**
     * Create department from CSV files.
     */
    public function createWithCsvFiles(Request $request)
    {
        $request->validate(['file' => 'required|mimes:csv,txt|max:2048']);

        $filePath = $request->file('file')->getRealPath();
        $data = array_map('str_getcsv', file($filePath));
        $header = array_shift($data);
        $formattedData = [];

        foreach ($data as $row) {
            $record = array_combine($header, $row);
            if (!empty($record['name']) && !empty($record['code'])) {
                $formattedData[] = ['name' => $record['name'], 'code' => $record['code'], 'type' => 'GRC'];
            }
        }

        if (!empty($formattedData)) {
            return $this->repository->saveMany($formattedData);
        }

        throw ValidationException::withMessages(['message' => 'No valid data found in file.']);
    }

    public function getProfileSepartment($id)
    {
        // Fetch the department with related data
        $department = $this->repository->show($id, ["departments", "manager", "employees", "employees.job", "employees.managees", "color", "jobs","parent"]);

        if ($department) {
            // Fetch the job names based on job_ids
            $jobNames = [];
            if (!empty($department->job_ids)) {
                $jobs = $this->jobRepository->getJob($department->job_ids);
                foreach ($jobs as $job) {
                    $jobNames[] = $job->name;
                }
            }
            // Add the job names to the department data
            $department->job_names = $jobNames;
            return $department;
        }

        return null;
    }

    public function assignLeader(Request $request)
    {
        $request->validate([
            'department_id' => 'required',
            'user_id' => 'required|exists:users,_id',
            'leader_for' => 'required|string',
        ]);

        $department = $this->repository->show($request->department_id);
        return $this->repository->assignLeader($department, $request);
    }

    public function allDepartmentManagersIds()
    {
        return $this->repository->allDepartmentManagersIds();
    }

    public function departmentEmployees($id)
    {
        return $this->repository->departmentEmployees($id);
    }

    /**
     * Get jobs by list of job IDs
     * 
     * @param array $jobsList
     * @return array|null Array of job objects or null
     */
    private function getJobsByIds($jobsList)
    {
        if (!is_array($jobsList) || count($jobsList) === 0) {
            return null;
        }

        $filterIn = "id|" . implode(",", $jobsList);
        $request = new Request([
            'filterIn' => $filterIn,
        ]);
        
        $jobs = $this->jobRepository->get($request);
        
        return $jobs ? $jobs : null;
    }

    /**
     * Check if multiple manager jobs exist in the given jobs list
     * 
     * @param array $jobsList
     * @return bool True if multiple manager jobs found, false otherwise
     */
    private function hasMultiJobManagedUsers($jobs)
    {
        
        if (!$jobs) {
            return false;
        }

        $managerCount = 0;
        foreach ($jobs as $job) {
            if ($job->is_manager) {
                $managerCount++;
                
                if ($managerCount > 1) {
                    return true;
                }
            }
        }
        
        return false;
    }
}