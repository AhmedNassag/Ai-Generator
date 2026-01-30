<?php

namespace App\Models\Language;


use MongoDB\Laravel\Eloquent\Model;
use MongoDB\Laravel\Eloquent\SoftDeletes;

class Language extends Model
{
    use SoftDeletes;
    protected $dates = ['deleted_at'];
     /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'code','name','order','rtl', 'flag' 
    ];
   
}
