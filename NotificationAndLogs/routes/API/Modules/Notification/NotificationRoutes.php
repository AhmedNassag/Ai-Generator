<?php

use App\Http\Controllers\Notification\NotificationController;
use Illuminate\Support\Facades\Route;
//Route::middleware(['auth:api'])->group(function () {
Route::resource('/notification',  NotificationController::class);
Route::get('/get/notification/type', [NotificationController::class, 'getNotificationType']);
Route::get('/get/user/notification/{userId}', [NotificationController::class, 'getUserNotifications']);
Route::post('mark-notification-read/{id}', [NotificationController::class, 'markAsRead']);
Route::post('mark-all-notifications-read/{userId}', [NotificationController::class, 'markAllAsRead']);
Route::post('/send/direct/notification', [NotificationController::class, 'sendDirectNotification']);
//});

