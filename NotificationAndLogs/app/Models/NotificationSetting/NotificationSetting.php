<?php

namespace App\Models\NotificationSetting;


use MongoDB\Laravel\Eloquent\Model;
use MongoDB\Laravel\Eloquent\SoftDeletes;

class NotificationSetting extends Model
{
    use SoftDeletes;
    protected $dates = ['deleted_at'];
     /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'type','class','action','status','subject','message','users','roles','fillable','related_users'
    ];

}
