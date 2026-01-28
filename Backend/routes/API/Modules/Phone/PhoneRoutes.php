<?php

use App\Http\Controllers\Phone\PhoneController;
use Illuminate\Support\Facades\Route;

Route::middleware(['jwt.authentication'])->group(function () {
    Route::resource('/phone',  PhoneController::class);
});