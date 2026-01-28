<?php

namespace App\Models\Notification;


use MongoDB\Laravel\Eloquent\Model;
use MongoDB\Laravel\Eloquent\SoftDeletes;

class Notification extends Model
{
    use SoftDeletes;
    protected $connection = 'mongodb'; // Ensure it's using MongoDB
    protected $collection = 'notifications';
    protected $dates = [
        'read_at',
        'created_at',
        'updated_at',];
     /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_from',
        'user_to',
        'type',
        'description',
        'read_at',
        'action',
        'class',
        'classId',
        'roles',
        'teams',
        'readers'
    ];


    public function notifiable()
    {
        return $this->morphTo();
    }

}
