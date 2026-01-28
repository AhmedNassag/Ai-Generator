<?php

use App\Http\Controllers\Team\TeamController;
use App\Http\Controllers\User\UserController;
use Illuminate\Support\Facades\Route;
//Route::middleware(['auth:api'])->group(function () {
Route::resource('/team',  TeamController::class);
Route::get('/user/{user}/team/{teamId}', [UserController::class, 'unassignFromTeam']);
//});

