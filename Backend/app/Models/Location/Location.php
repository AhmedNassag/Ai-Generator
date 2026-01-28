<?php

namespace App\Models\Location;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use MongoDB\Laravel\Eloquent\Model;
use MongoDB\Laravel\Eloquent\SoftDeletes;

class Location extends Model
{
    use SoftDeletes, HasFactory;
    protected $dates = ['deleted_at'];
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'risk_ids'
    ];

    /*public function risks()
    {
        return $this->belongsToMany(\App\Models\Risk\Risk::class, null, 'location_ids', 'risk_ids');
    }

    public function assets()
    {
        return $this->hasMany(\App\Models\Asset\Asset::class);
    }*/
}
