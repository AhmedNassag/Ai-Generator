<?php

use App\Http\Controllers\Location\LocationController;
use Illuminate\Support\Facades\Route;
//Route::middleware(['auth:api'])->group(function () {
Route::resource('/location',  LocationController::class);
//});

