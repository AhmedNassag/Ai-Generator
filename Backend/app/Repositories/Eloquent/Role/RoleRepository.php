<?php

namespace App\Repositories\Eloquent\Role;

use App\Models\Role\Role;
use App\Repositories\BaseRepository;
use App\Repositories\Eloquent\Department\DepartmentRepository;
use App\Repositories\Eloquent\Job\JobRepository;
use Illuminate\Validation\ValidationException;

class RoleRepository extends BaseRepository
{
    protected $departmentRepository;
    protected $jobRepository;

    /**
     * RoleRepository constructor.
     * Injects dependencies for DepartmentRepository and JobRepository.
     */
    public function __construct()
    {
        $this->departmentRepository = new DepartmentRepository();
        $this->jobRepository = new JobRepository();
        // Pass a new instance of the Role model to the parent BaseRepository constructor
        parent::__construct(new Role());
    }

    /**
     * Creates or updates a role based on provided data.
     *
     * @param array $data
     * @return mixed
     */
    public function create($data = null)
    {
        // Ensure job belongs to the specified department
        $permissions = $data['permissions'];
        // Handle different role creation types
        if ($data['type'] === 'colon') {
            $role = $this->handleColonRole($data['job_id'], $data['department_id']);
            if($role){
                $role->update(['permissions' => $permissions]);
                return $role;
            }
            else
                return $this->createRole($job, [$department->id], $permissions, 'colon');
        }

        if ($data['type'] === 'update') {
            return $this->handleUpdateRole($job, $department, $permissions);
        }
    }

    //save
    public function save($data= [])
    {
                // Ensure job belongs to the specified department
        $permissions = $data['permissions'];

        $role = $this->handleColonRole($data['job_id'], $data['department_id']);
        // return[$job, $department,$role];
        if($role){
            $role->update(['permissions' => $permissions]);
            return $role;
        }
        else{
            $job = $this->jobRepository->show($data['job_id']);
            return $this->createRole($job, [$data['department_id']], $permissions, 'colon');

        }

        
    }

    public function applyToAllDepartments($data= []){
        // first get current default role
        $oldDefaultRole = $this->model->where('job_id', $data['job_id'])->where('type', 'update')->first();
        $job = $this->jobRepository->show($data['job_id']);
        $roleForSelectedDepartment = $this->getRoleJobWithDepartment($data['job_id'], $data['department_id']);
        if($roleForSelectedDepartment && $roleForSelectedDepartment->type == 'colon'){
            $roleForSelectedDepartment->forceDelete();
        }
        // make $data['unselected_department]  if is array and not null make every element colon role
        $customRoles = [];
        if(isset($data['unselected_department']) && is_array($data['unselected_department']) && $data['unselected_department'] != [null]){
            foreach($data['unselected_department'] as $departmentId){
                // Skip if departmentId is null or empty
                if(empty($departmentId)) continue;
                $customRoles[] = [
                    'name' => $job->name,
                    'type' =>   'colon',
                    'department_ids' =>  [$departmentId],
                    'job_id' => $job->id,
                    'permissions' =>$defaultRole?->permissions ?? [],
                ];
            }
            $this->model->insert($customRoles);
        }
        
        // Update default role with new permissions and department_ids
        if($oldDefaultRole){
            $oldDefaultRole->permissions = $data['permissions'];
            $oldDefaultRole->department_ids = $data['department_ids'];
            $oldDefaultRole->save();
            return $oldDefaultRole;
        }
        else{
            // create new default role
            return $this->createRole($job, $data['department_ids'], $data['permissions'],'update');
        }
        return $data['unselected_department'];
    }

    /**
     * Handles the 'colon' role type by reassigning department roles.
     *
     * @param $job
     * @param $department
     */
    private function handleColonRole($jobId, $departmentId)
    {
        $oldRole = $this->getRoleJobWithDepartment($jobId, $departmentId);
        if ($oldRole && $oldRole->type == 'update') {
            // Remove department from the old role
            $departmentIds = [];
            foreach ($oldRole->department_ids  as $departmentId) {
                if ($departmentId != $departmentId) {
                    $departmentIds[] = $departmentId;
                }
            }
            $oldRole->update(['department_ids' => $departmentIds]);

            return false;
        }
        else if ($oldRole && $oldRole->type == 'colon') {
            return $oldRole;
        }
        return false;

    }

    /**
     * Handles the 'update' role type by modifying existing role permissions.
     *
     * @param $job
     * @param $department
     * @param array $permissions
     * @return mixed
     */
    private function handleUpdateRole($job, $department, $permissions)
    {
        $role = $this->getRoleJobWithDepartment($job->id, $department->id);
        // colon role deleted
        if ($role && $role->type == 'colon') {
            $role->forceDelete();
        }
        // return department to default role
        $defaultRole = $this->model->where('type', 'update')->where('job_id', $job->id)->first();
        if ($defaultRole) {
            // Ensure department is part of role and update permissions
            $departmentIds = [];
            if(!in_array($department->id, $defaultRole->department_ids)){
                foreach ($defaultRole->department_ids  as $departmentId) {
                    $departmentIds[] = $departmentId;
                }
            }
            $departmentIds[] = $department->id;
            $defaultRole->update(['department_ids' => $departmentIds, 'permissions' => $permissions]);
            return $defaultRole;
        }

        // If role does not exist, create a new one
        return $this->createRole($job, $job->department_ids, $permissions,'update');
    }

    /**
     * Creates a new role with the specified job, departments, and permissions.
     *
     * @param $job
     * @param array $departmentIds
     * @param array $permissions
     * @return mixed
     */
    private function createRole($job, $departmentIds, $permissions, $type)
    {
        $role = parent::create([
            'name' => $job->name,
            'type' =>   $type,
            'department_ids' =>  $departmentIds,
            'job_id' => $job->id,
            'permissions' => $permissions,
        ]);
        return $role;
    }

    /**
     * Retrieves a role associated with a specific job and department.
     *
     * @param int $jobId
     * @param int $departmentId
     * @return mixed|null
     */
    public function getRoleJobWithDepartment($jobId, $departmentId)
    {
        $roles = $this->model->where('job_id', $jobId)->get();

        foreach ($roles as $role) {
            if (in_array($departmentId, $role->department_ids)) {
                return $role;
            }
        }
        $role = $this->model->where('job_id', $jobId)->where('type', 'update')->first();


        return $role;
    }

    public function getRolesByJobAndDepartment($jobId, $departmentId)
    {
        return $this->model
            ->where('job_id', $jobId)
            // ->where('department_ids', $departmentId)
            ->get();
    }

    public function checkRolesByJobAndDepartment($jobId, $departmentId)
    {
        return $this->model
            ->where('job_id', $jobId)
            // ->where('department_ids', $departmentId)
            ->exists();
    }
}
