<?php
use App\Http\Controllers\Position\PositionController;
use Illuminate\Support\Facades\Route;

Route::middleware(['jwt.authentication'])->group(function () {
    Route::resource('/position',  PositionController::class);
});