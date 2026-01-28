<?php

use App\Http\Controllers\NotificationSetting\NotificationSettingController;
use Illuminate\Support\Facades\Route;
//Route::middleware(['auth:api'])->group(function () {
Route::resource('/notification-setting',  NotificationSettingController::class);
Route::post('/notification-setting/refresh/actions',  [NotificationSettingController::class, 'refreshActions']);
Route::get('/notification-setting/get/method',  [NotificationSettingController::class, 'getMethod']);
Route::get('/model-fillable/{modelName}', [NotificationSettingController::class, 'getFillable']);

//});

