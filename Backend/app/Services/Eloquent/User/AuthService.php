<?php

namespace App\Services\Eloquent\User;

use App\Models\Role\Role;
use App\Models\User\User;
use App\Repositories\Eloquent\User\UserRepository;
use App\Repositories\Eloquent\Role\RoleRepository;
use App\Repositories\Eloquent\Permission\PermissionRepository;
use App\Repositories\Eloquent\User\AuthRepository;
use App\Services\BaseService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Password;
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
class AuthService extends BaseService
{
    protected $authRepository;

    public function __construct()
    {
        parent::__construct(new AuthRepository());
    }

    public function login(array $credentials)
    {
        $fieldType = filter_var($credentials['login'], FILTER_VALIDATE_EMAIL) ? 'email' : 'username';
        $user = $this->repository->findByField($fieldType, $credentials['login']);

        if (!$user) {
            return ['status' => 0]; // Invalid credentials
        }

        if (!$user->status) {
            return ['status' => 4]; // User is not active
        }

        if (isset($user->lock_until) && $user->lock_until > now()) {
            $lockDuration = $user->lock_until->diffInMinutes(now());
            return ['status' => 1, 'lock_duration' => $lockDuration]; // Account locked
        }

        if (!Hash::check($credentials['password'], $user->password)) {
            $failedAttempts = $user->failed_attempts + 1;
            $updateData = ['failed_attempts' => $failedAttempts, 'last_failed_attempt' => now()];
            if ($failedAttempts >= 5) {
                $updateData['is_locked'] = true;
                $updateData['lock_until'] = now()->addMinutes(15);
            }
            $this->repository->update($user->id, $updateData);
            return ['status' => 2, 'failed_attempts' => $failedAttempts]; // Incorrect password
        }

        $this->repository->update($user->id, [
            'is_locked' => false,
            'failed_attempts' => 0,
            'lock_until' => null
        ]);

        if ($user && Hash::check($credentials['password'], $user->password)) {
            $rememberMe = $credentials['remember_me'] ?? false;
            $expiration = $rememberMe ? 60 * 24 * 30 : config('jwt.ttl'); // 30 days
            JWTAuth::factory()->setTTL($expiration);


            /** permissions data **/
            $role = Role::where('job_id', $user->job_id)
            ->where('type','=','colon')
            ->where('department_ids', $user->department_id)
            ->first();

            if (!$role){
                $role = Role::where('job_id', $user->job_id)
                ->where('type','=','update')
                ->first();
            }
            \Log::info("role of user ", [$role]);

            $customClaims = $user->getJWTCustomClaims($role->permissions ?? []);
            $token = JWTAuth::claims($customClaims)->fromUser($user);
            /*** end permissions  */

            $userData = $user->toArray();
            $userData['expires_in'] = JWTAuth::factory()->getTTL() * 60;
            $userData['token'] = $token;
            $userData['permissions'] = $role->permissions ?? [];

            return ['status' => 3, 'data' => $userData]; // Successful login
        }
        return null;
    }

    public function sendOTP(array $credentials)
    {
        $otp = rand(1000, 9999);
        $credentials['otp'] = $otp;
        $user = $this->repository->findByField('email', $credentials['email']);
        if($user->type != "GRC"){
            return false;
        }

        $status = $this->repository->sendOTP(['email' => $credentials['email'],'otp' => $credentials['otp']]);
        if($status){
            $result = Mail::raw("Your OTP for password reset is: $otp", function ($message) use ($credentials) {
                $message->to($credentials['email'])
                        ->subject('Password Reset OTP');
            });
            return $result;
        }
        return false;
    }

    public function resetPassword(array $data)
    {
        // Verify OTP and email
        $resetEntry = $this->repository->verifyOtp($data['email'], (int) $data['otp']);
        if (!$resetEntry) {
            return ['message' => 'Invalid OTP or email.', 'status' => 400];
        }

        // Check if OTP is expired (valid for 15 minutes)
        if (now()->diffInMinutes($resetEntry->created_at) > 15) {
            return ['message' => 'OTP expired.', 'status' => 400];
        }
        $this->repository->updatePassword($data);
        $this->repository->deleteOtpEntry($data['email']);

        return ['message' => 'Password has been reset successfully.', 'status' => 200];
    }

}
