<?php

namespace App\Services\Eloquent\User;

use App\Models\User\User;
use App\Repositories\Eloquent\User\UserRepository;
use App\Repositories\Eloquent\Role\RoleRepository;
use App\Repositories\Eloquent\Permission\PermissionRepository;
use App\Services\BaseService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Log;
use Tymon\JWTAuth\Facades\JWTAuth;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use Exception;
use App\Repositories\Eloquent\Job\JobRepository;

/**
 * UserService class
 *
 * This service class is responsible for managing all business logic
 * related to user operations. It acts as an intermediary between the
 * controllers and the data layer (repositories), ensuring that
 * user-related functionality is abstracted and reusable.
 *
 * Responsibilities:
 * - Process and validate business logic for users.
 * - Interact with the UserRepository to fetch, create, update, and delete users.
 * - Provide methods for user-specific operations, extending BaseService functionality.
 *
 * This class extends BaseService to inherit common service methods and overrides
 * or adds user-specific logic where necessary.
 */
class UserService extends BaseService
{
    /**
     * @var UserRepository The repository used for user data interactions.
     *
     * This repository handles direct communication with the data layer
     * (e.g., database) for CRUD operations and custom queries related to users.
     */
    protected $userRepository;
    protected $jobRepository;

    /**
     * UserService constructor.
     *
     * This constructor initializes the UserService by calling the parent
     * BaseService constructor and passing in a new instance of UserRepository.
     *
     */
    public function __construct(JobRepository $jobRepository)
    {
        $this->jobRepository = $jobRepository;
        parent::__construct(new UserRepository());
    }

    protected function validateData(Request $request, $type = 'store')
    {
        $validate = [
            'full_name' => 'required|string|max:255',
            // 'email' => 'required|email|unique:users',
            'phone' => 'nullable|string|max:15',
            // 'username' => 'required|string|max:255|unique:users',
            'password' => 'string|min:8|nullable',
            'department_id' => 'required|exists:departments,id',
            'job_id' => 'required|exists:jobs,id',
            'team_ids' => 'nullable',
        ];

        $store = [
            'full_name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'phone' => 'nullable|unique:users|string|max:15',
            'username' => 'required|string|max:255|unique:users',
            'password' => 'required|string|min:8',
            'department_id' => 'required|exists:departments,id',
            'job_id' => 'required|exists:jobs,id',
            'team_ids' => 'nullable',
        ];
        if ($type == 'store') {
            $request->validate($store);
        }
        if ($type == 'update') {
            $request->validate($validate);
        }

        // Check for roles with job_id and department_id
        if ($request->filled(['job_id', 'department_id'])) {
            $roleRepository = new RoleRepository(); // Assuming RoleRepository is properly injected or instantiated
            $rolesExist = $roleRepository->checkRolesByJobAndDepartment($request->job_id, $request->department_id);

            // if (!$rolesExist) {
            //     throw ValidationException::withMessages(['No roles found with the given job_id and department_id.']);
            // }
        }
        return $request->all();
    }


       public function create(Request $request)
    {
        $this->validateManagerJobAssignment($request->job_id, $request->department_id);
        return parent::create($request);
    }

    public function update($id, Request $request)
    {
        $this->validateManagerJobAssignment($request->job_id, $request->department_id, $id);
        return parent::update($id, $request);
    }


    private function validateManagerJobAssignment($jobId, $departmentId, $userId = null)
    {
        // Load job with departments and users
        $job = $this->jobRepository->show($jobId, ['departments.users']);
        
        if ($job->is_manager == 'true' || $job->is_manager == true) {
            // Check each department
            if ($job->departments) {
                foreach ($job->departments as $department) {
                    // Only check the target department
                    if ($department->id == $departmentId) {
                        // Get users in this department with this job
                        $usersCount = $department->users()
                            ->where('job_id', $jobId)
                            ->when($userId, function ($query) use ($userId) {
                                // Exclude current user when updating
                                return $query->where('_id', '!=', $userId);
                            })
                            ->count();
                        
                        // If there are already 1 or more users (excluding current), can't add another
                        if ($usersCount >= 1) {
                            throw ValidationException::withMessages([
                                'job_id' => 'Cannot assign manager job. There is already a user with this manager job in this department.'
                            ]);
                        }
                    }
                }
            }
        }
    }

    public function activeDeactive($id)
    {
        $user = $this->repository->activeDeactive($id);
        if ($user) {
            return $user;
        }
        return null;
    }

    // public function userInformation()
    // {
    //     $user = JWTAuth::parseToken()->authenticate();
    //     $data['user'] = $this->repository->userInformation($user->id);
    //     $data['role'] = $user->role;
    //     if ($data) {
    //         return $data;
    //     }
    //     return null;
    // }


    public function unassignFromTeam(User $user, $teamId)
    {
        try {
            // Delegate to the repository
            $user = $this->repository->unassignFromTeam($user, $teamId);

            return [
                'success' => true,
                'message' => 'User unassigned from team successfully.',
                'user' => $user,
            ];
        } catch (\Exception $e) {
            // Log the error for debugging
            Log::error('Failed to unassign user from team: ' . $e->getMessage());

            return [
                'success' => false,
                'message' => 'Failed to unassign user from team.',
                'error' => $e->getMessage(),
            ];
        }
    }

































    // public function login(array $credentials)
    // {
    //     $fieldType = filter_var($credentials['login'], FILTER_VALIDATE_EMAIL) ? 'email' : 'username';
    //     $user = $this->userRepository->findByField($fieldType, $credentials['login']);
    //     if ($user && Hash::check($credentials['password'], $user->password)) {
    //         $token = JWTAuth::fromUser($user);
    //         $userData = $user->toArray();
    //         $userData['token'] = $token;
    //         return $userData;
    //     }
    //     return null;
    // }



    // // Login user and generate JWT token
    // public function login(array $data)
    // {
    //     $user = $this->userRepository->findByEmail($data['email']);

    //     if (!$user || !Hash::check($data['password'], $user->password)) {
    //         throw new \Exception('Invalid credentials');
    //     }

    //     // Create and return JWT token
    //     return JWTAuth::fromUser($user);
    // }

    // // Register a new user and assign a default role
    // public function register(array $data)
    // {
    //     $data['password'] = Hash::make($data['password']);
    //     $user = $this->userRepository->create($data);

    //     // Assign default role (can be customized)
    //     $defaultRole = $this->roleRepository->findByName('user'); // Assuming 'user' role exists
    //     $user->roles()->attach($defaultRole);

    //     return $user;
    // }

    // // Assign role to user
    // public function assignRoleToUser($userId, $roleId)
    // {
    //     $user = $this->userRepository->find($userId);
    //     $role = $this->roleRepository->find($roleId);

    //     if ($user && $role) {
    //         $user->roles()->attach($role);
    //         return $user;
    //     }

    //     throw new \Exception("User or Role not found.");
    // }

    // // Assign permission to role
    // public function assignPermissionToRole($roleId, $permissionId)
    // {
    //     $role = $this->roleRepository->find($roleId);
    //     $permission = $this->permissionRepository->find($permissionId);

    //     if ($role && $permission) {
    //         $role->permissions()->attach($permission);
    //         return $role;
    //     }

    //     throw new \Exception("Role or Permission not found.");
    // }

    // // Get roles for a specific user
    // public function getUserRoles($userId)
    // {
    //     $user = $this->userRepository->find($userId);
    //     return $user->roles;
    // }

    // // Get permissions for a specific role
    // public function getRolePermissions($roleId)
    // {
    //     $role = $this->roleRepository->find($roleId);
    //     return $role->permissions;
    // }

        public function getUsersByFilters(Request $request)
        {
            try {
                $type          = $request->input('type', ''); // specific | all
                $userIds       = $request->input('user_ids', []);
                $teamIds       = $request->input('team_ids', []);
                $departmentIds = $request->input('department_ids', []);
                $jobIds        = $request->input('job_ids', []);
                $roleIds       = $request->input('role_ids', []);
                return $this->repository->getUsersByFilters(
                    type: $type,
                    userIds: $userIds,
                    teamIds: $teamIds,
                    departmentIds: $departmentIds,
                    jobIds: $jobIds,
                    roleIds: $roleIds
                );
            } catch (\Exception $e) {
                \Log::error('Error fetching users by filters: ' . $e->getMessage());
                return collect([]);
            }
        }

          public function getFillableFields(string $modelName): array
        {
            // Convert model name to proper namespace
            $modelClass = 'App\\Models\\' . Str::studly($modelName) . '\\' . Str::studly($modelName);

            // Validate if the model class exists and is a valid model
            if (!class_exists($modelClass) || !is_subclass_of($modelClass, Model::class)) {
                throw new Exception('Model not found or invalid');
            }

            // Instantiate the model
            $model = new $modelClass();

            // Fetch fillable fields from the repository
            $fillableFields = $this->repository->getFillable($model);
            
            // Format response as plain array
            $result = [];
            foreach ($fillableFields as $field) {
                $result[] = [
                    'name' => $field,
                    'default' => true,
                    'hidden' => false,
                    'disabled' => false,
                    'required' => false,
                ];
            }

            return $result;
        }

}
