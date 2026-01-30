<?php
use App\Http\Controllers\Language\LanguageController;
use Illuminate\Support\Facades\Route;

// Route::middleware(['jwt.authentication'])->group(function () {
    Route::resource('/language',  LanguageController::class);
// });

