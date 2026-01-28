<?php

namespace App\Models\EmailConfig;


use MongoDB\Laravel\Eloquent\Model;
use MongoDB\Laravel\Eloquent\SoftDeletes;

class EmailConfig extends Model
{
    use SoftDeletes;
    protected $dates = ['deleted_at'];
     /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'email_type','smtp_server','smtp_port','smtp_username','smtp_password','smtp_from_username','ssl_tls' 
    ];
   
}
