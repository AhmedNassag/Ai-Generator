<?php

namespace App\Models\User;

use MongoDB\Laravel\Eloquent\Model;

class ResetPassword extends Model
{
    protected $table = 'password_reset_tokens';
    protected $guarded=[];
}
