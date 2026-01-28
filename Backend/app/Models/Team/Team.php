<?php

namespace App\Models\Team;

use App\Models\Asset\Asset;
use App\Models\User\User;
use App\Models\Vulnerability\Vulnerability;
use MongoDB\Laravel\Eloquent\Model;
use MongoDB\Laravel\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Team extends Model
{
    use SoftDeletes;
    protected $dates = ['deleted_at'];
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'user_ids',
        'vulnerability_ids', // relation with vulnerability
        'asset_ids', // relation with asset
        'risk_ids',
        'mitigation_risk_ids',
        'document_ids',
    ];

    /**
     * Get all users that belong to the team.
     */
    public function users()
    {
        return $this->belongsToMany(User::class, null, 'team_ids', 'user_ids');
    }
}
