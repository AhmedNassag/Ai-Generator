<?php

use App\Http\Controllers\EmailConfig\EmailConfigController;
use Illuminate\Support\Facades\Route;
//Route::middleware(['auth:api'])->group(function () {
Route::apiResource('/email-config',  EmailConfigController::class);
Route::post('/send-email', [EmailConfigController::class, 'sendEmail'])->name('sendEmail');
    //});
