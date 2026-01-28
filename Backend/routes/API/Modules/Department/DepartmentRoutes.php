<?php

use App\Http\Controllers\Department\DepartmentController;
use Illuminate\Support\Facades\Route;

// Route::middleware(['auth:api'])->group(function () {
Route::middleware(['jwt.authentication'])->group(function () {
Route::resource('/department',  DepartmentController::class);
Route::post('/department-csv',  [DepartmentController::class ,'createWithCsvFiles']);
Route::get('department/profile/{id}',  [DepartmentController::class,'getProfileSepartment']);
Route::post('assign-leader',  [DepartmentController::class,'assignLeader']);
Route::get('/department/Managers/{id}',  [DepartmentController::class,'departmentManagers']);
Route::get('/department/allManagersIds',  [DepartmentController::class,'allDepartmentManagersIds']);
Route::get('/department/employees/{id}',  [DepartmentController::class,'departmentEmployees']);
});
