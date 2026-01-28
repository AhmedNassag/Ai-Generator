<?php

namespace App\Models\Job;

use App\Models\Role\Role;
use App\Models\User\User;
use App\Models\Position\Position;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use MongoDB\Laravel\Eloquent\Model;
use MongoDB\Laravel\Eloquent\SoftDeletes;

class Job extends Model
{
    use SoftDeletes;
    use HasFactory;

    protected $dates = ['deleted_at'];
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'code',
        'description',
        'department_ids', // Add this to fillable
        'position_id', // Add this to fillable
        'role_id',
        'is_manager'
    ];

    protected $casts = [
        'is_manager' => 'boolean',
    ];

    public function departments(): BelongsToMany
    {
        return $this->belongsToMany(\App\Models\Department\Department::class, null, 'job_ids', 'department_ids');
    }


    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function position(): BelongsTo
    {
        return $this->belongsTo(Position::class, 'position_id');
    }

}
