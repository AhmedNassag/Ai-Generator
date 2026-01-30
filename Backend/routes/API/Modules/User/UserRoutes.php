<?php
use App\Http\Controllers\User\AuthController;
use App\Http\Controllers\User\ProfileController;
use App\Http\Controllers\User\UserController;
use App\Http\Middleware\CheckCanVisitAPI;
use App\Http\Middleware\JwtMiddleware;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Route;

Route::middleware(CheckCanVisitAPI::class)->group(function(){
    Route::post('/login', [AuthController::class, 'login'])->name('login');
    Route::post('forgot-password', [AuthController::class, 'sendOTP']);
    Route::post('reset-password', [AuthController::class, 'resetPassword']);

    Route::middleware(['jwt.authentication'])->group(function () {
        Route::get('user/export-data', [UserController::class, 'exportDataToExcell']);
        Route::apiResource('/user',  UserController::class);
        Route::get('user-info',  [UserController::class,'userInformation']);
        Route::get('user/activeDeactive/{id}',  [UserController::class,'activeDeactive']);
        Route::get('user/profile/{id}',  [ProfileController::class,'getProfile']);
        Route::post('user/profile/updatePssword/{id}',  [ProfileController::class,'updatePssword']);
    });

    /** just for test sending email */
    Route::get('/test-email', function () {
        Mail::raw('This is a test email.', function ($message) {
            $message->to('kh.abed@pksaudi.com')->subject('Test Email');
        });
        return 'Test email sent!';
    });

    Route::fallback(function () {
        return response()->json([
            'code'      => 404,
            'error'     => true,
            'message'   => "Route Not Found !",
            'payload'   => null,
            'status'    => false,
        ], 404);
    });
});

// Route::middleware(['auth:api'])->group(function () {
// Route::middleware(['checkPermission'])->group(function () {
    Route::resource('/user',  UserController::class);
    Route::post('user/getUsersByFilters',  [UserController::class,'getUsersByFilters']);
    Route::get('/model-fillable/{modelName}', [UserController::class, 'getFillable']);
// });
//});