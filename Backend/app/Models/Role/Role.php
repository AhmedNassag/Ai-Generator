<?php

namespace App\Models\Role;

use App\Models\Department\Department;
use App\Models\Job\Job;
use MongoDB\Laravel\Eloquent\Model;
use MongoDB\Laravel\Eloquent\SoftDeletes;

class Role extends Model
{
    use SoftDeletes;
    protected $dates = ['deleted_at'];
     /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name','type','job_id', 'department_ids','permissions'
    ];
    // protected $casts = [
    //     'department_ids' => 'array'
    // ];



    public function job()
    {
        return $this->belongsTo(Job::class, "_id");
    }

    // public function permissions()
    // {
    //     return $this->belongsToMany(\App\Models\Permission\Permission::class);
    // }



    // hasManyThrough relationship to departments with jobs
    public function departments(){
        return $this->hasManyThrough(
            Department::class,
            Job::class,
            'job_id',
            'department_ids',
            '_id',
            '_id'

        );
    }



}
