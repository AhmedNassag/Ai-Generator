<?php

use App\Http\Controllers\Position\PositionController;
use Illuminate\Support\Facades\Route;
//Route::middleware(['auth:api'])->group(function () {
Route::resource('/position',  PositionController::class);
//});

