<?php

use App\Http\Controllers\Color\ColorController;
use Illuminate\Support\Facades\Route;
//Route::middleware(['auth:api'])->group(function () {
Route::resource('/color',  ColorController::class);
//});

