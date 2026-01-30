<?php
use App\Http\Controllers\Role\RoleController;
use Illuminate\Support\Facades\Route;

// Route::middleware(['jwt.authentication'])->group(function () {
    Route::resource('/role',  RoleController::class);
    Route::get('getRoleJobWithDepartment/{jobId}/{departmentId}', [RoleController::class, 'getRoleJobWithDepartment']);
    Route::post('/role/save/colon', [RoleController::class, 'save']);
    Route::post('/role/apply/to/all/departments/', [RoleController::class, 'applyToAllDepartments']);
//});

