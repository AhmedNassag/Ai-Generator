<?php

namespace App\Models\LDAP;


use MongoDB\Laravel\Eloquent\Model;
use MongoDB\Laravel\Eloquent\SoftDeletes;

class LDAP extends Model
{
    use SoftDeletes;
    protected $dates = ['deleted_at'];
     /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'hosts','port','base_dn','username','filter','version','password','timeout','follow','ssl','tls'
    ];

}
