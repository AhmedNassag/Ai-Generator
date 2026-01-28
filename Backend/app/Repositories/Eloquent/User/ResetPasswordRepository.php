<?php

namespace App\Repositories\Eloquent\User;

use App\Models\User\ResetPassword;
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
class ResetPasswordRepository extends BaseRepository
{

    public function __construct()
    {
        parent::__construct(new ResetPassword());
    }

    public function findByField(string $field, string $value)
    {
        return $this->model->where($field, $value)->first();
    }

    public function sendOTP(array $credentials)
    {
        return $this->model->updateOrInsert([
            'email' => $credentials['email'],
            'otp' => $credentials['otp'],
            'created_at' => now()
        ]);
        // return $this->model->update($credentials);
    }

    public function verifyOtp($email, $otp)
    {
        return $this->model->where('email', $email)->where('otp', $otp)->first();
    }

    public function updatePassword($data)
    {
        $this->model->where('email', $data['email'])->update(['password' => Hash::make($data['password'])]);
    }
    public function deleteOtpEntry($email)
    {
        $this->model->where('email', $email)->delete();
    }
}
