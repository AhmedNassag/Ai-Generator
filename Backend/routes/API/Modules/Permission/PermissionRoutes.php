<?php
use App\Http\Controllers\Permission\PermissionController;
use Illuminate\Support\Facades\Route;

// Route::middleware(['jwt.authentication'])->group(function () {
    Route::resource('/permission',  PermissionController::class);
    Route::get('/updatePermissions', [PermissionController::class, 'updatePermission'])->name('permission.update-permissions');
//});