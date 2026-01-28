<?php

namespace App\Models\Position;

use App\Models\ChangeRequest\ChangeRequest;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use MongoDB\Laravel\Eloquent\Model;
use MongoDB\Laravel\Eloquent\SoftDeletes;

class Position extends Model
{
    use SoftDeletes, HasFactory;
    protected $dates = ['deleted_at'];
     /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name','code','description','job_ids','emergency_requests'
    ];

    protected $casts = [
        'emergency_requests' => 'boolean'
    ];
    public function jobs()
    {
        return $this->hasMany(\App\Models\Job\Job::class);
    }

    public function job()
    {
        return $this->belongsTo(\App\Models\Job\Job::class, 'job_id');
    }

    public function departments()
    {
        return $this->hasMany(\App\Models\Department\Department::class, 'manager_id');
    }

    /*public function changeRequests() {
        return $this->hasMany(ChangeRequest::class,'position_id');
    }*/

}
