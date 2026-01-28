<?php

namespace App\Models\Color;

use App\Models\Department\Department;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use MongoDB\Laravel\Eloquent\Model;
use MongoDB\Laravel\Eloquent\SoftDeletes;

class Color extends Model
{
    use SoftDeletes,HasFactory;
    protected $dates = ['deleted_at'];
     /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name','hexcolor'
    ];

    public function departments()
    {
        return $this->hasMany(Department::class);
    }
}
