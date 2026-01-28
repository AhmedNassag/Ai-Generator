<?php

namespace App\Repositories\Eloquent\User;

use App\Models\User\User;
use App\Repositories\BaseRepository;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;

/**
 * UserRepository
 *
 * This class is responsible for handling the data operations related to the User model.
 * It extends the BaseRepository class, leveraging the shared repository functionality,
 * such as CRUD operations, and specifies the User model as its target entity.
 */
class AuthRepository extends BaseRepository
{
    protected $resetPasswordRepository;

    public function __construct()
    {
        parent::__construct(new User());
        $this->resetPasswordRepository = new ResetPasswordRepository();
    }

    public function findByField(string $field, string $value)
    {
        return $this->model
            ->with(["department", "role", "job", "manager", "teams"]) // Load the relationships
            ->where($field, $value)->first();
    }

    public function sendOTP(array $credentials)
    {
        return $this->resetPasswordRepository->sendOTP($credentials);
    }

    public function verifyOtp($email, $otp)
    {
        return $this->resetPasswordRepository->verifyOtp($email, $otp);
    }

    public function updatePassword(array $data)
    {
        $this->model->where('email', $data['email'])->update(['password' => Hash::make($data['password'])]);
    }
    public function deleteOtpEntry($email)
    {
        $this->resetPasswordRepository->deleteOtpEntry($email);
    }
}
