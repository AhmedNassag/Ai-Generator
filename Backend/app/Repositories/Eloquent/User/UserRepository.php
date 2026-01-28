<?php

namespace App\Repositories\Eloquent\User;

use App\Models\User\User;
use App\Models\Role\Role;
use App\Repositories\BaseRepository;
use Illuminate\Validation\ValidationException;
use Illuminate\Database\Eloquent\Model;
/**
 * UserRepository
 *
 * This class is responsible for handling the data operations related to the User model.
 * It extends the BaseRepository class, leveraging the shared repository functionality,
 * such as CRUD operations, and specifies the User model as its target entity.
 */
class UserRepository extends BaseRepository
{
    /**
     * UserRepository constructor.
     *
     * Initializes the repository by passing an instance of the User model to the parent BaseRepository.
     * This setup allows the BaseRepository methods to work specifically with User data.
     */
    public function __construct()
    {
        // Pass a new instance of the User model to the parent BaseRepository constructor
        parent::__construct(new User());
    }

    public function create($data = null)
    {
        $data['department_joining_date'] = now(); // Set to current timestamp
        $data['password'] = bcrypt($data['password']);
        $data['type'] = 'GRC';
        $data['is_locked'] = false;
        $data['status'] = true;
        // $data['role_id'] = $this->
        $user = parent::create($data);
        $user->teams()->attach($data['team_ids'] ?? []);
    }

    public function update($id, $data = null)
    {
        if (array_key_exists('password', $data)) {
            $data['password'] = bcrypt($data['password']);
        }

        // Load the user first to check current state
        $user = User::find($id);
        $originalDepartment = $user->department_id;

        // Perform the update
        $user = parent::update($id, $data);

        // Check if department was changed
        if ($originalDepartment != $user->department_id) {
            $user->department_joining_date = now();
            $user->save();
        }

        // Fix issue of assign teams
        $user->teams()->detach();
        $user->teams()->attach($data['team_ids'] ?? []);

        return $user;
    }

    public function delete($id)
    {
        $recordIds = request()->input('recordIds', []);
        $id = $recordIds[0] ?? $id;
        $user = $this->show($id, ['department', 'teams', 'job', 'role']);

        if ($user->managees()->exists()) {
            throw ValidationException::withMessages(['User' => 'User is Manager for other users.']);
        }

        if ($user->teams()->exists()) {
            throw ValidationException::withMessages(['User' => 'User has assigned Teams.']);
        }

        if ($user->risks()->exists()) {
            throw ValidationException::withMessages(['User' => 'User has assigned risks.']);
        }

        if ($user->role()->exists()) {
            throw ValidationException::withMessages(['User' => 'User has assigned Role.']);
        }

        if ($user->documents()->exists()) {
            throw ValidationException::withMessages(['User' => 'User has assigned Documents.']);
        }

        if ($user->kpis()->exists()) {
            throw ValidationException::withMessages(['User' => 'User has assigned KPIS.']);
        }

        return parent::delete($id);
    }

    public function activeDeactive($id)
    {
        $user = $this->model->find($id);
        if ($user) {
            parent::update($id, ['status' => !$user->status]);
            return $user;
        }
        return false;
    }

    // public function userInformation($id)
    // {
    //     $user = $this->model->find($id);
    //     if($user){
    //         return $user;
    //     }
    //     return false;
    // }


    public function findUser($id)
    {
        return $this->model->find($id);
    }

    public function updatePssword($credentials, $id)
    {
        $user = $this->model->find($id);
        if ($user) {
            $data['password'] = bcrypt($credentials['password']);
            parent::update($id, $data);
            return $user;
        }
        return null;
    }

    public function unassignFromTeam(User $user, $teamId)
    {
        // Remove the user_id from the team
        $user->teams()->detach($teamId);

        // Remove the team ID from the team_ids array in the user collection
        $teamIds = $user->team_ids;
        if (($key = array_search($teamId, $teamIds)) !== false) {
            unset($teamIds[$key]);
        }
        $user->team_ids = array_values($teamIds); // Re-index the array
        $user->save();

        return $user;
    }

    public function getEmployeeCountByDepartment($departmentId)
    {
        return User::where('department_id', $departmentId)->count();
    }


    public function getUser($id)
    {
        return User::find(substr($id, 1));
    }

        public function getUsersByFilters(
            string $type = 'specific', // specific | all
            array $userIds = [],
            array $teamIds = [],
            array $departmentIds = [],
            array $jobIds = [],
            array $roleIds = []
        ) {
            // ✅ If type is all → skip filters and return all users
            if ($type === 'all_system') {
                return User::all();
            }

            $query = User::query();
            $hasFilter = false;

            // User IDs
            if (!empty($userIds)) {
                $query->whereIn('id', $userIds);
                $hasFilter = true;
            }

            // Departments
            if (!empty($departmentIds)) {
                $query->whereIn('department_id', $departmentIds);
                $hasFilter = true;
            }

            // Jobs
            if (!empty($jobIds)) {
                $query->whereIn('job_id', $jobIds);
                $hasFilter = true;
            }

            // Teams
            if (!empty($teamIds)) {
                $query->whereHas('teams', function ($q) use ($teamIds) {
                    $q->whereIn('teams.id', $teamIds);
                });
                $hasFilter = true;
            }

            // Roles → expand to job + department
            if (!empty($roleIds)) {
                $roles = Role::whereIn('id', $roleIds)->get();

                $query->where(function ($outer) use ($roles) {
                    foreach ($roles as $role) {
                        $jobId = $role->job_id;
                        $departments = (array) $role->department_ids;

                        if ($jobId && !empty($departments)) {
                            $outer->orWhere(function ($sub) use ($jobId, $departments) {
                                $sub->where('job_id', $jobId)
                                    ->whereIn('department_id', $departments);
                            });
                        }
                    }
                });
                $hasFilter = true;
            }

            // ❌ If no filters and not type=all → return empty
            if (!$hasFilter) {
                return collect([]);
            }

            return $query->get();
        }



       public function getFillable(Model $model): array
    {
        return $model->getFillable();

    }
}
