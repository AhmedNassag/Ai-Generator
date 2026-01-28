<?php

namespace App\Models\User;

// use Illuminate\Contracts\Auth\MustVerifyEmail;

use App\Models\ChangeRequest\ChangeRequest;
use App\Models\Department\Department;
use App\Models\Job\Job;
use App\Models\Role\Role;
use App\Models\Team\Team;
use App\Models\Permission\Permission;
use App\Models\PhishingGroup\PhishingGroup;
use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Contracts\Auth\CanResetPassword;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use MongoDB\Laravel\Eloquent\Model;
use Tymon\JWTAuth\Contracts\JWTSubject;
use MongoDB\Laravel\Eloquent\SoftDeletes;
class User extends Model implements Authenticatable, JWTSubject, CanResetPassword
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, SoftDeletes;
    // Implement JWTSubject methods

    public function getEmailForPasswordReset()
    {
        return $this->email;
    }

    public function sendPasswordResetNotification($token)
    {
        // Send the default Laravel password reset notification
        // $this->notify(new ResetPasswordNotification($token));
    }

    public function getAuthIdentifierName()
    {
        return '_id';  // This can be 'id', 'username', or any other unique column you use as the identifier.
    }

    // start here
    public function getAuthIdentifier()
    {
        return $this->getKey(); // Returns '_id' or whatever key is used for MongoDB documents
    }


    // Implement required method to handle remember token functionality
    public function getRememberToken()
    {
        return $this->remember_token;
    }

    // Implement required method to set the remember token
    public function setRememberToken($value)
    {
        $this->remember_token = $value;
    }

    // Implement missing method: Get the password column name
    public function getAuthPasswordName()
    {
        return 'password';  // Default is 'password'
    }
    public function getAuthPassword()
    {
        return $this->password; // Assuming your password column is named 'password'
    }


    // Implement missing method: Get the remember token column name
    public function getRememberTokenName()
    {
        return 'remember_token';  // Default is 'remember_token'
    }



    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'full_name',
        'email',
        'phone',
        'username',
        'password',
        'role_id',
        'CardNo',
        "active",
        'image',
        'code',
        "user_type", // [admin, student, faculty_member, team_work,online_admission_student]
        'department_id',
        'team_ids',
        'job_id',
        "status",
        "type",
        "is_locked",
        "failed_attempts",
        "last_failed_attempt",
        "lock_until",
        "manager_id",
        'document_ids',
        'kpi_ids',
        'super',
        'risk_ids',
        'phishing_group_ids',
        'campaign_ids',
        'department_joining_date'
    ];

    protected $appends = ['fullImagePath'];


    public function getFullImagePathAttribute()
    {
        $table = $this->getTable();
        if ($this->image == null || $this->image == '')
            return asset("storage/uploads/$table/image/default.png");

        return asset("storage/uploads/$table/image/" . $this->image);
        //default.jpg
    } //
    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    public function department()
    {
        return $this->belongsTo(Department::class, 'department_id');
    }

    public function manager()
    {
        return $this->belongsTo(User::class, 'manager_id');
    }

    public function teams()
    {
        return $this->belongsToMany(Team::class, 'team_ids', 'user_ids');
    }

    public function job()
    {
        return $this->belongsTo(Job::class, 'job_id');
    }

    public function role()
    {
        return $this->belongsTo(Role::class, 'job_id');
    }

    // public function permissions()
    // {
    //     return $this->hasManyThrough(Permission::class,Role::class);
    // }


    // Implement JWTSubject methods
    public function getJWTIdentifier()
    {
        return $this->getKey(); // Return the primary key
    }


    public function getJWTCustomClaims($permissions_model = [])
    {

        // $role_permissions = Job::find($this->job_id)->role()->first()->permission_ids;
        // foreach ($role_permissions as $permission_id) {
        //     $permission = Permission::find($permission_id);
        //     $controller = str_replace('/', '\\', $permission->controller);
        //     if(is_array($permission[$controller])) {
        //         $permissions[$controller][] =  $permission->method;
        //     } else {
        //         $permissions[$controller] =  [$permission->method];
        //     }
        // }
        // Retrieve permissions from the database or define static permissions

        // $permissions = [
        //     "User\\UserController" => ["index"],
        //     "Role\\RoleController" => ["index"],
        //     "Department\\DepartmentController" => ["index"],
        //     "Job\\JobController" => ["index"],
        //     "Permission\\PermissionController" => ["index"],
        //     "Team\\TeamController" => ["index"],
        //     "Position\\PositionController" => ["index"],
        // ];

        $permissions = [];
        // Convert model data into a permissions format
        foreach ($permissions_model as $permission) {
            foreach ($permission["controllers"] as $controller => $actions) {
                foreach ($actions as $action => $value) {
                    $formattedAction = $controller . '\\' . $controller . 'Controller\\' . $action;

                    // Check if the key exists, then append to the list instead of overwriting
                    if (isset($permissions[$permission["name"]])) {
                        $permissions[$permission["name"]][] = $formattedAction;
                    } else {
                        $permissions[$permission["name"]] = [$formattedAction];
                    }
                }
            }
        }
        $encryptedPermissions = [];

        // Loop through each permission and apply encryption logic
        foreach ($permissions as $permission => $actions) {
            foreach ($actions as $action) {
                // Get the formatted controller-method string (e.g. "PositionController\index")
                $permissionAction = $action;

                // Create hash for permission
                $hash = hash('sha256', $permissionAction);

                // Generate UUID from the hash
                $shortHash = substr($hash, 0, 16);
                $uuid = substr($shortHash, 0, 4) . '-' . substr($shortHash, 4, 4) . '-' . substr($shortHash, 8, 4) . '-' . substr($shortHash, 12, 4);

                // Encrypt the UUID for storage in the JWT
                $encryptedPermissions[] = $uuid;
            }
        }

        // Return the encrypted permissions as a custom claim
        return [
            'permission' => $encryptedPermissions,
            'super' => isset($this->super) && $this->super == "true" ? true : false

        ];
    }
    public function managees()
    {
        return $this->hasMany(User::class, 'manager_id');
    }

    /*public function risks(){
        return $this->belongsToMany(\App\Models\Risk\Risk::class, null, 'stakeholder_ids', 'risk_ids');
    }

    public function documents(): BelongsToMany
    {
        return $this->belongsToMany(\App\Models\Document\Document::class, null, 'stakeholder_ids', 'document_ids');
    }
    public function kpis(): BelongsToMany
    {
        return $this->belongsToMany(\App\Models\Kpi\Kpi::class, null, 'kpiOwner_ids', 'kpi_ids');
    }

    public function changeRequests() {
        return $this->hasMany(ChangeRequest::class,'created_by');
    }

    public function phishingGroups()
    {
        return $this->belongsToMany(
            PhishingGroup::class,
            null,
            'user_ids',
            'phishing_group_ids'
        );
    }


    public function campaigns(): BelongsToMany
    {
        return $this->belongsToMany(\App\Models\Campaign\Campaign::class, null, 'user_ids', 'campaign_ids');
    }*/

}
