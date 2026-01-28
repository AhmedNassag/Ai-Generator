<?php

use App\Http\Controllers\LogSetting\LogSettingController;
use Illuminate\Support\Facades\Route;
//Route::middleware(['auth:api'])->group(function () {
Route::resource('/log-setting', LogSettingController::class);
//});

