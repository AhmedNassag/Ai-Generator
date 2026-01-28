<?php

namespace App\Models\Log;


use MongoDB\Laravel\Eloquent\Model;

class Log extends Model
{
    protected $fillable = [
        'action', // type of operation [create, update, delete]
        'token', // request token
        'user_id', // login user id
        'service_name', // name of micro service
        'ip_address', // request ip_address
        'browser', // request browser
        'operating_system', // login user operating_system
        'class', // namespace of controller
        'query',
        'old_data',
        'data',
    ];
}
