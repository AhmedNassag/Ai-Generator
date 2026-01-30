<?php
use App\Http\Controllers\Color\ColorController;
use Illuminate\Support\Facades\Route;

Route::middleware(['jwt.authentication'])->group(function () {
    Route::resource('/color',  ColorController::class);
});