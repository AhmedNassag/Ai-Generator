<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Artisan;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Firebase\JWT\SignatureInvalidException;
use Firebase\JWT\BeforeValidException;
use Firebase\JWT\ExpiredException;
/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/


Route::macro('FullResource', function (string $name, string $controller) {
    // Register the standard resource routes
    Route::resource($name, $controller);

    // Add the custom route for "publish"
    Route::get("{$name}-group", [$controller, 'group'])
        ->name("{$name}.group");

    // Add the custom route for "publish"
    Route::get("{$name}-fillable", [$controller, 'fillable'])
        ->name("{$name}.fillable");
    // Add the custom route for "publish"
    Route::get("{$name}-export-data", [$controller, 'exportDataToExcell'])
        ->name("{$name}.exportData");
});
@include("API/index.php");


// Route::middleware(['HasPermission'])->group(function () {
Route::middleware(['jwt.authentication'])->group(function () {
    Route::post('send/log/notification', [App\Http\Controllers\GeneralController::class, 'logAndSendNotification']);
    Route::post('send/internal-message', [App\Http\Controllers\GeneralController::class, 'sendNotificationAndEmail']);
});
use Illuminate\Support\Facades\Broadcast;

Route::post('/broadcasting/auth', function (Request $request) {
    $bearerToken = $request->bearerToken() ?? '';
    $key = config('jwt.secret');
    $role_id = $request->input('role_id');
    $team_ids = $request->input('team_ids');
    $teamIds = explode(',', $team_ids);
    if (!$bearerToken) {
        abort(401, 'Unauthorized: No token provided');
    }

    try {
        $payload = JWT::decode($bearerToken, new Key($key, 'HS256'));
        $userId = $payload->sub ?? null;

        if (!$userId) {
            abort(401, 'Invalid token: user id missing');
        }

        // Fixed: accept all 3 parameters and assign inside constructor
        $user = new class($userId, $role_id, $teamIds) {
            public $id;
            public $role_id;
            public $team_ids;
            public function __construct($id, $role_id, $team_ids) {
                $this->id = $id;
                $this->role_id = $role_id;
                $this->team_ids = $team_ids;
            }
        };

        $request->setUserResolver(fn () => $user);

        return Broadcast::auth($request);

    } catch (\Exception $e) {
        abort(401, 'Unauthorized: ' . $e->getMessage());
    }
});

    //run all seeders
    Route::get('/db-seed', function () {
        Artisan::call('db:seed');
        return response()->json("DataBase Seeder Done Successfully");
    })->name('db.seed');


    //run specific seeder
    Route::get('/db-seed/{seeder}', function ($seeder) {
        Artisan::call('db:seed', ['--class' => $seeder]);
        return response()->json(['message' => "Seeder {$seeder} Executed Successfully"]);
    })->name('db.specific.seed');
// });


