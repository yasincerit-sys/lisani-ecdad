<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\ProgressController;
use App\Http\Controllers\Api\SinifController;
use App\Http\Controllers\AppController;
use Illuminate\Support\Facades\Route;

Route::get('/', [AppController::class, 'index']);

Route::get('/api/csrf-token', function () {
    return response()->json(['token' => csrf_token()]);
});

Route::prefix('api')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    Route::middleware('auth')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/user', [AuthController::class, 'user']);
        Route::put('/profile', [AuthController::class, 'updateProfile']);
        Route::post('/profile', [AuthController::class, 'updateProfile']);

        Route::get('/sinif/{kisaKod}', [SinifController::class, 'show']);
        Route::get('/sinif', [SinifController::class, 'mySinif']);
        Route::post('/sinif/{kisaKod}/join', [SinifController::class, 'join']);
        Route::get('/odevler', [SinifController::class, 'myOdevler']);
        Route::post('/sinif/odev', [SinifController::class, 'addOdev']);

        Route::post('/progress/sync', [ProgressController::class, 'sync']);
        Route::get('/hoca/ogrenci-takip', [ProgressController::class, 'ogrenciTakip']);

        Route::get('/messages/contacts', [MessageController::class, 'contacts']);
        Route::get('/messages/unread-count', [MessageController::class, 'unreadCount']);
        Route::get('/messages/{partnerId}', [MessageController::class, 'thread']);
        Route::post('/messages', [MessageController::class, 'send']);
    });
});
