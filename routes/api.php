<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ShipmentController;
use App\Http\Controllers\Api\V1\BookingController;
use App\Http\Controllers\Api\V1\PublicContentController;
use App\Http\Controllers\Api\Admin\AuthController;
use App\Http\Controllers\Api\Admin\BookingsController as AdminBookingsController;
use App\Http\Controllers\Api\Admin\RatesController as AdminRatesController;
use App\Http\Controllers\Api\Admin\SiteContentController;
use App\Http\Controllers\Api\Admin\SeoSettingsController;
use App\Http\Controllers\Api\Admin\SlackSettingsController;
use App\Http\Controllers\Api\Admin\AnalyticsController;
use App\Http\Controllers\Api\Admin\UsersController;
use App\Http\Controllers\Api\Admin\MediaController;

// ─────────────────── Public v1 API ───────────────────
Route::prefix('v1')->group(function () {
    Route::get('/stats', [ShipmentController::class, 'stats']);
    Route::get('/track/{trackingId}', [ShipmentController::class, 'track']);
    Route::get('/districts', [ShipmentController::class, 'districts']);
    Route::post('/ping', [ShipmentController::class, 'ping']);
    Route::post('/bookings', [BookingController::class, 'store']);

    // Public content + SEO reads (admin edits surface here without auth)
    Route::get('/content/{page}', [PublicContentController::class, 'content']);
    Route::get('/seo/{page}',     [PublicContentController::class, 'seo']);
    Route::get('/rates',          [PublicContentController::class, 'rates']);
});

// ─────────────────── Admin auth ───────────────────
Route::prefix('admin')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/verify-email', [AuthController::class, 'verifyEmail']);
    Route::post('/resend-verification', [AuthController::class, 'resendVerification']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);

    Route::middleware(['auth:sanctum', 'is_admin'])->group(function () {
        Route::get('/me',     [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);

        // Bookings
        Route::get('/bookings', [AdminBookingsController::class, 'index']);
        Route::patch('/bookings/{booking}', [AdminBookingsController::class, 'update']);
        Route::delete('/bookings/{booking}', [AdminBookingsController::class, 'destroy']);

        // Rates
        Route::get('/rates', [AdminRatesController::class, 'index']);
        Route::post('/rates', [AdminRatesController::class, 'store']);
        Route::patch('/rates/{rate}', [AdminRatesController::class, 'update']);
        Route::delete('/rates/{rate}', [AdminRatesController::class, 'destroy']);
        Route::post('/rates/upload', [AdminRatesController::class, 'bulkUpload']);

        // Site content
        Route::get('/content', [SiteContentController::class, 'index']);
        Route::post('/content', [SiteContentController::class, 'store']);
        Route::patch('/content/{content}', [SiteContentController::class, 'update']);
        Route::delete('/content/{content}', [SiteContentController::class, 'destroy']);

        // SEO
        Route::get('/seo', [SeoSettingsController::class, 'index']);
        Route::get('/seo/{page_slug}', [SeoSettingsController::class, 'show']);
        Route::post('/seo', [SeoSettingsController::class, 'upsert']);
        Route::delete('/seo/{page_slug}', [SeoSettingsController::class, 'destroy']);

        // Slack
        Route::get('/slack', [SlackSettingsController::class, 'show']);
        Route::patch('/slack', [SlackSettingsController::class, 'update']);
        Route::post('/slack/test', [SlackSettingsController::class, 'test']);

        // Users
        Route::get('/users', [UsersController::class, 'index']);
        Route::post('/users', [UsersController::class, 'store']);
        Route::patch('/users/{user}', [UsersController::class, 'update']);
        Route::delete('/users/{user}', [UsersController::class, 'destroy']);

        // Media (image uploads)
        Route::get('/media', [MediaController::class, 'index']);
        Route::post('/media', [MediaController::class, 'store']);
        Route::delete('/media', [MediaController::class, 'destroy']);

        // Analytics
        Route::get('/analytics/dashboard', [AnalyticsController::class, 'dashboard']);
    });
});
