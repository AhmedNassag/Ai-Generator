<?php
use App\Http\Controllers\Translate\TranslateController;
use Illuminate\Support\Facades\Route;

// Route::middleware(['jwt.authentication'])->group(function () {
    Route::resource('/translate',  TranslateController::class);
// });

