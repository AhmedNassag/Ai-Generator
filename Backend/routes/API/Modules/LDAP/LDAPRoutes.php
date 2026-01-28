<?php

use App\Http\Controllers\LDAP\LDAPController;
use Illuminate\Support\Facades\Route;
//Route::middleware(['auth:api'])->group(function () {

Route::post('/ldap/test-connection', [LDAPController::class, 'TestConnection']);
Route::get('/ldap/get-users', [LDAPController::class, 'GetUsers']);
Route::get('/ldap/get-departments', [LDAPController::class, 'GetDepartments']);
Route::post('/ldap/import-users', [LDAPController::class, 'ImportUsers']);
Route::post('/ldap/import-departments', [LDAPController::class, 'ImportDepartments']);



Route::post('/ldap/updateOrCreate', [LDAPController::class, 'updateOrCreate']);

Route::resource('/ldap',  LDAPController::class);
//});

