<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Gifts\CreateGiftFlowController;
use App\Http\Controllers\Gifts\GiftController;
use App\Http\Controllers\Gifts\GiftPageController;
use App\Http\Controllers\Gifts\UserGiftDashboardController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Home');
})->name('home');

Route::get('/demo', function () {
    return Inertia::render('Demo');
})->name('demo');

Route::middleware('guest')->group(function (): void {
    Route::get('/login', [AuthenticatedSessionController::class, 'create'])->name('login');
    Route::post('/login', [AuthenticatedSessionController::class, 'store'])
        ->middleware('throttle:login')
        ->name('login.store');

    Route::get('/cadastro', [RegisteredUserController::class, 'create'])->name('register');
    Route::post('/cadastro', [RegisteredUserController::class, 'store'])
        ->middleware('throttle:register')
        ->name('register.store');
});

Route::get('/criar', [CreateGiftFlowController::class, 'index'])->name('create.index');
Route::get('/criar/{occasion:slug}', [CreateGiftFlowController::class, 'templates'])->name('create.occasion');
Route::get('/criar/{occasion:slug}/{template:slug}', [CreateGiftFlowController::class, 'show'])->name('create.template.show');

Route::post('/gifts', [GiftController::class, 'store'])
    ->middleware('auth')
    ->name('gifts.store');

Route::middleware('auth')->group(function (): void {
    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');

    Route::get('/app/gifts', UserGiftDashboardController::class)->name('app.gifts.index');
    Route::get('/app/gifts/{gift}/edit', [GiftController::class, 'edit'])->name('app.gifts.edit');
    Route::patch('/app/gifts/{gift}', [GiftController::class, 'update'])->name('app.gifts.update');
    Route::patch('/app/gifts/{gift}/pages/{giftPage}', [GiftPageController::class, 'update'])->name('app.gifts.pages.update');
});
