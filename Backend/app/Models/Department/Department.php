<?php

namespace App\Models\Department;

use App\Models\ChangeRequest\ChangeRequest;
use App\Models\User\User;
use MongoDB\Laravel\Eloquent\Model;
use MongoDB\Laravel\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Department extends Model
{
     /** @use HasFactory<\Database\Factories\UserFactory> */
    use SoftDeletes ,HasFactory;
    protected $collection = 'jobs';
    protected $dates = ['deleted_at'];
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'code',
        'color_id',
        'parent_id',
        'manager_id', // Job ID who is the manager of the department
        'job_ids',
        'number_of_employees',
        'vision',
        'message',
        'mission',
        'objectives',
        'responsibilities',
        'children',
        'type', // data came from GRC or LDAP
        'ola_leader',
    ];

    // children relationship
    // Relationship to get the parent department
    public function parent()
    {
        return $this->belongsTo(Department::class, 'parent_id');
    }

    // Relationship to get the children departments
    public function children()
    {
        return $this->hasMany(Department::class, 'parent_id');
    }
    public function color()
    {
        return $this->hasOne(\App\Models\Color\Color::class, '_id', 'color_id');
    }

    // Relationship to get the manager of the department
    public function manager()
    {
        return $this->belongsTo(\App\Models\Position\Position::class, 'manager_id');
    }

    // Relationship to get the jobs of the department
    public function jobs()
    {
        return $this->belongsToMany(\App\Models\Job\Job::class, null, 'department_ids', 'job_ids');
    }

    // hasManyThrough relationship to get the users of the department
    public function users()
    {
        return $this->hasMany(
            \App\Models\User\User::class,
            'department_id',
            '_id'
        );
    }

    public function roles()
    {
        return $this->hasMany(\App\Models\Role\Role::class);
    }

    public function employees()
    {
        return $this->hasMany(User::class, 'department_id');
    }

    public function departments()
    {
        return $this->hasMany(Department::class, 'parent_id')->with('departments');
    }

    /*public function changeRequests() {
        return $this->hasMany(ChangeRequest::class,'department_id');
    }*/
}
