<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Artisan;

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


// Route::middleware(['HasPermission'])->group(function () {
    Route::post('/import-fetchFileData',[\App\Http\Controllers\Utils\BaseController::class,'fetchFileData'])->name('import.fetchFileData');
    Route::post('/import-storeFileData',[\App\Http\Controllers\Utils\BaseController::class,'storeFileData'])->name('import.storeFileData');
    
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

    @include("API/index.php");

// });


