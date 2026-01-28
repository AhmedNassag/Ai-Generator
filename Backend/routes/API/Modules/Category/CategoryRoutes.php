<?php

use App\Http\Controllers\Category\CategoryController;
use Illuminate\Support\Facades\Route;

Route::middleware(['jwt.authentication'])->group(function () {
    Route::resource('/category',  CategoryController::class);
});