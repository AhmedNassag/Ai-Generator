<?php

use App\Http\Controllers\Log\LogController;
use Illuminate\Support\Facades\Route;
// Route::middleware(['jwt.authentication'])->group(function () {
Route::apiResource('/log',  LogController::class)->only(['index', 'show', 'store']);
Route::get('/log/get/method',  [LogController::class, 'getMethod']);
//this route is for getting logs of a specific ITSM request
Route::get('/log/{modelName}/{recordId}',  [LogController::class, 'getModelLogs']);
Route::get('/log/multi/models/show',  [LogController::class, 'getLogMultiModels']);
// });
