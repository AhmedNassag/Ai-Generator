<?php
use App\Http\Controllers\Job\JobController;
use Illuminate\Support\Facades\Route;

Route::middleware(['jwt.authentication'])->group(function () {
    Route::resource('/job',  JobController::class);
});

