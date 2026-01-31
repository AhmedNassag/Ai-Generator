<?php

use App\Http\Controllers\Usee\UseeController;
use Illuminate\Support\Facades\Route;

Route::middleware(['jwt.authentication'])->group(function () {
    Route::resource('/usee',  UseeController::class);
});