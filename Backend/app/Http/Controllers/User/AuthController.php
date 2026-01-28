<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Utils\BaseController;
use App\Services\Eloquent\User\AuthService;
use App\Services\Eloquent\User\UserService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

/**
 * UserController Class
 *
 * This controller is responsible for handling all user-related actions, such as creating, reading, updating,
 * and deleting user records. It extends the BaseController to leverage generic CRUD functionality, ensuring
 * a consistent and maintainable code structure. The UserController relies on the UserService to manage
 * user-specific business logic and interactions with the data layer.
 *
 * By extending the BaseController, this class benefits from pre-defined methods for handling HTTP requests,
 * error handling, and standardized response formatting. This promotes reusability and reduces code duplication
 * across different controllers in the application.
 */
class AuthController extends BaseController
{
    public function __construct(AuthService $service)
    {
        // Pass the UserService instance to the parent constructor to initialize the base service.
        parent::__construct($service);
    }

    public function login(Request $request)
    {
        try {
            $validate = [
                'login' => 'required',
                'password' => 'required',
                'remember_me' => 'nullable|boolean',
            ];
            $store = [...$validate];
            $request->validate($store);
            $response  = $this->baseService->login($request->only('login', 'password','remember_me'));
            switch ($response['status']) {
                case 0:
                    return $this->error(['Invalid credentials.']);
                case 1:
                    $lockDuration = ceil($response['lock_duration'] ?? 0);
                    return $this->error(["Account is locked. Try again in {$lockDuration} minutes."]);
                case 2:
                    $failedAttempts = $response['failed_attempts'] ?? 0;
                    return $this->error(["Invalid credentials. Failed attempts: {$failedAttempts}."]);
                case 3:
                    return $this->success($response['data']);
                case 4:
                    return $this->error(['You are not Active !']);
                default:
                    return $this->error(['An unknown error occurred.']);
            }
        } catch (\Exception $e) {
            return $this->error([$e->getMessage()]);
        }

    }

    public function sendOTP(Request $request)
    {
        try {
            $validate = [
                'email' => 'required|email|exists:users,email',
            ];
            $store = [...$validate];
            $request->validate($store);
            $result = $this->baseService->sendOTP($request->only('email'));
            if ($result){
                return $this->success($result);
            }else{
                return $this->error(["User type may not a grc "]);
            }
        } catch (\Exception $e) {
            return $this->error([$e->getMessage()]);
        }
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'otp' => 'required|digits:4',
            'password' => 'required|min:8|confirmed',
        ]);

        $response = $this->baseService->resetPassword($request->only('email', 'otp', 'password'));
        return response()->json($response['message'], $response['status']);
    }


}
