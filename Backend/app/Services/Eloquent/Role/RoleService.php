<?php

namespace App\Services\Eloquent\Role;

use App\Repositories\Eloquent\Role\RoleRepository;
use App\Services\BaseService;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class RoleService extends BaseService
{
    protected $roleRepository;

    /**
     * RoleService constructor.
     * Injects the RoleRepository dependency.
     */
    public function __construct()
    {
        parent::__construct(new RoleRepository());
    }

    /**
     * Validates request data based on the operation type (store or update).
     *
     * @param Request $request
     * @param string $type (store|update)
     * @return array
     * @throws ValidationException
     */
    protected function validateData(Request $request, $type = 'store')
    {
        \Log::info('Validating role data', ['request' => $request->all()]);
        $rules = [
            'department_id' => 'required|exists:departments,id',
            'type' => 'required|in:colon,update',
            'job_id' => 'required|exists:jobs,id',
            'permissions' => 'required|array|min:1',
        ];

        $request->validate($rules);

        // Ensure permissions array is not empty or null
        if ($type === 'store' && $request->permissions === [null]) {
            throw ValidationException::withMessages(['permissions' => 'Permissions not selected']);
        }

        return $request->all();
    }

    /**
     * Processes the permissions data and creates a new role.
     *
     * @param Request $request
     * @return mixed
     */
    public function create(Request $request)
    {
        $data = json_decode($request->data, true);
        $request->merge($data);
        // return [$request->all()];
        $permissions = $this->formatPermissions($request->permissions);

        // Attach formatted permissions to the request object
        $request->merge(['permissions' => $permissions]);

        return parent::create($request);
    }

    //save
    public function save(Request $request)
    {
        $data = json_decode($request->data, true);
        $request->merge($data);

        $permissions = $this->formatPermissions($request->permissions);
        // Attach formatted permissions to the request object
        $request->merge(['permissions' => $permissions]);

        return $this->repository->save($request->all());
    }
    public function applyToAllDepartments(Request $request)
    {
        $data = json_decode($request->data, true);
        $request->merge($data);

        $permissions = $this->formatPermissions($request->permissions);

        // return $request->all();
        // Attach formatted permissions to the request object
        $request->merge(['permissions' => $permissions]);

        return $this->repository->applyToAllDepartments($request);
    }


    /**
     * Formats permissions into a structured array.
     *
     * @param array $permissions
     * @return array
     */
    private function formatPermissions(array $permissions)
    {
        $formattedPermissions = [];

        foreach ($permissions as $row) {
            // Ensure $row is an array and has required keys
            if (!is_array($row) || !array_key_exists('name', $row) || !array_key_exists('controller', $row)) {
                // Skip invalid rows
                continue;
            }
            
            $name = $row['name'];
            $controller = $row['controller'];
            
            // Skip if name or controller is null/empty
            if (empty($name) || empty($controller)) {
                continue;
            }

            // Group permissions by name and controller
            if (!isset($formattedPermissions[$name])) {
                $formattedPermissions[$name] = ['name' => $name, 'controllers' => []];
            }

            if (!isset($formattedPermissions[$name]['controllers'][$controller])) {
                $formattedPermissions[$name]['controllers'][$controller] = [];
            }

            // Assign specific permission values
            foreach ($row as $key => $value) {
                if (!in_array($key, ['name', 'controller'])) {
                    $formattedPermissions[$name]['controllers'][$controller][$key] = $value;
                }
            }
        }

        return array_values($formattedPermissions);
    }

    /**
     * Fetches a role based on job and department IDs.
     *
     * @param int $jobId
     * @param int $departmentId
     * @return mixed
     */
    public function getRoleJobWithDepartment($jobId, $departmentId)
    {
        return $this->repository->getRoleJobWithDepartment($jobId, $departmentId);
    }
}