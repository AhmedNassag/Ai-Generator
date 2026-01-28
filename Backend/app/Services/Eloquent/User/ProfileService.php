<?php

namespace App\Services\Eloquent\User;

use App\Models\User\User;
use App\Repositories\Eloquent\User\UserRepository;
use App\Repositories\Eloquent\Role\RoleRepository;
use App\Repositories\Eloquent\Permission\PermissionRepository;
use App\Services\BaseService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Tymon\JWTAuth\Facades\JWTAuth;

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
class ProfileService extends BaseService
{
    /**
     * @var UserRepository The repository used for user data interactions.
     *
     * This repository handles direct communication with the data layer
     * (e.g., database) for CRUD operations and custom queries related to users.
     */
    protected $userRepository;

    /**
     * UserService constructor.
     *
     * This constructor initializes the UserService by calling the parent
     * BaseService constructor and passing in a new instance of UserRepository.
     *
    */
    public function __construct()
    {
        parent::__construct(new UserRepository());
    }

    public function getProfile($id)
    {
        $user = $this->repository->show($id,['department','job','teams','manager']);
        if ($user) {
            return $user;
        }
        return null;
    }

    public function updatePssword(array $credentials,$id)
    {
        $user = $this->repository->findUser($id);
        if (!$user || !Hash::check($credentials['old_password'],$user->password) || $user->type != "GRC") {
            return false;
        }
        $user = $this->repository->updatePssword($credentials,$id);
        if ($user) {
            return $user;
        }
        return false;
    }


}
