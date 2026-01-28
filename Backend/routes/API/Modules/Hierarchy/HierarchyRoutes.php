<?php

use App\Http\Controllers\Hierarchy\HierarchyController;
use Illuminate\Support\Facades\Route;
Route::middleware(['jwt.authentication'])->group(function () {
Route::apiResource('/hierarchy',  HierarchyController::class);
Route::get('/employee/hierarchy', [HierarchyController::class, 'ajaxGetList']);
Route::post('/drag-and-drop', [HierarchyController::class, 'dragAndDrop']);

});

