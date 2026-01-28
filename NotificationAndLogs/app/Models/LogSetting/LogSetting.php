<?php

namespace App\Models\LogSetting;


use MongoDB\Laravel\Eloquent\Model;

class LogSetting extends Model
{
    protected $fillable = [
        'action',
        'class',
        'status'
    ];

}
