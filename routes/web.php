<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\ProgressController;
use App\Http\Controllers\Api\SinifController;
use App\Http\Controllers\Api\TennisController;
use App\Http\Controllers\Api\LeaderboardController;
use App\Http\Controllers\Api\YoneticiController;
use App\Http\Controllers\AppController;
use Illuminate\Support\Facades\Route;

Route::get('/', [AppController::class, 'index']);

Route::get('/api/csrf-token', function () {
    return response()->json(['token' => csrf_token()]);
});

Route::prefix('api')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::get('/user', [AuthController::class, 'user']);

    Route::middleware(['auth', 'not.banned'])->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::put('/profile', [AuthController::class, 'updateProfile']);
        Route::post('/profile', [AuthController::class, 'updateProfile']);
        Route::post('/profile/tennis-unlock', [AuthController::class, 'unlockTennis']);

        Route::get('/sinif/{kisaKod}', [SinifController::class, 'show']);
        Route::get('/sinif', [SinifController::class, 'mySinif']);
        Route::post('/sinif/{kisaKod}/join', [SinifController::class, 'join']);
        Route::get('/odevler', [SinifController::class, 'myOdevler']);
        Route::post('/sinif/odev', [SinifController::class, 'addOdev']);

        Route::get('/progress', [ProgressController::class, 'show']);
        Route::post('/progress/sync', [ProgressController::class, 'sync']);
        Route::get('/hoca/ogrenci-takip', [ProgressController::class, 'ogrenciTakip']);
        Route::get('/yonetici/takip', [YoneticiController::class, 'takip']);
        Route::get('/yonetici/overview', [YoneticiController::class, 'overview']);
        Route::get('/yonetici/users', [YoneticiController::class, 'users']);
        Route::post('/yonetici/users/{userId}/ban', [YoneticiController::class, 'banUser']);
        Route::post('/yonetici/users/{userId}/unban', [YoneticiController::class, 'unbanUser']);

        Route::get('/leaderboard', [LeaderboardController::class, 'index']);

        Route::get('/messages/contacts', [MessageController::class, 'contacts']);
        Route::get('/messages/unread-count', [MessageController::class, 'unreadCount']);
        Route::get('/messages/{partnerId}', [MessageController::class, 'thread']);
        Route::post('/messages', [MessageController::class, 'send']);

        Route::post('/tennis/rooms', [TennisController::class, 'create']);
        Route::post('/tennis/rooms/{code}/join', [TennisController::class, 'join']);
        Route::get('/tennis/rooms/{code}', [TennisController::class, 'state']);
        Route::post('/tennis/rooms/{code}/input', [TennisController::class, 'input']);
        Route::post('/tennis/rooms/{code}/sync', [TennisController::class, 'sync']);
        Route::post('/tennis/rooms/{code}/leave', [TennisController::class, 'leave']);
        Route::post('/tennis/rooms/{code}/invite', [TennisController::class, 'invite']);
    });
});
