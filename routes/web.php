<?php

use App\Domain\Analytics\Enums\AnalyticsEventName;
use App\Domain\Analytics\Services\AnalyticsTracker;
use App\Http\Controllers\Analytics\AnalyticsEventController;
use App\Http\Controllers\Assets\AssetPreviewController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Gifts\CreateGiftFlowController;
use App\Http\Controllers\Gifts\GiftAnalyticsController;
use App\Http\Controllers\Gifts\GiftAssetController;
use App\Http\Controllers\Gifts\GiftController;
use App\Http\Controllers\Gifts\GiftMediaController;
use App\Http\Controllers\Gifts\GiftPageBackgroundController;
use App\Http\Controllers\Gifts\GiftPageController;
use App\Http\Controllers\Gifts\GiftPreviewController;
use App\Http\Controllers\Gifts\GiftPublicationController;
use App\Http\Controllers\Gifts\GiftQrCodeController;
use App\Http\Controllers\Gifts\GiftReviewController;
use App\Http\Controllers\Gifts\GiftShareCardController;
use App\Http\Controllers\Gifts\GiftShareController;
use App\Http\Controllers\Gifts\PublicGiftController;
use App\Http\Controllers\Gifts\PublicGiftMediaController;
use App\Http\Controllers\Gifts\UserGiftDashboardController;
use App\Http\Controllers\Payments\DevPaymentApprovalController;
use App\Http\Controllers\Payments\GiftCheckoutController;
use App\Http\Controllers\Payments\OrderStatusController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function (Request $request, AnalyticsTracker $tracker) {
    $tracker->track(AnalyticsEventName::LandingViewed, ['request' => $request, 'source' => 'server']);

    return Inertia::render('Home');
})->name('home');

Route::get('/demo', function () {
    return Inertia::render('Demo');
})->name('demo');

Route::post('/analytics/events', AnalyticsEventController::class)
    ->middleware('throttle:analytics-events')
    ->name('analytics.events');

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

Route::get('/assets/{asset}/preview', AssetPreviewController::class)->name('assets.preview');
Route::get('/p/{slugToken}/media/{mediaItem}/thumbnail', [PublicGiftMediaController::class, 'thumbnail'])->name('public.gifts.media.thumbnail');
Route::get('/p/{slugToken}/media/{mediaItem}', [PublicGiftMediaController::class, 'show'])->name('public.gifts.media.show');
Route::get('/p/{slugToken}', PublicGiftController::class)->name('public.gifts.show');

Route::post('/gifts', [GiftController::class, 'store'])
    ->middleware('auth')
    ->name('gifts.store');

Route::middleware('auth')->group(function (): void {
    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');

    Route::get('/app/gifts', UserGiftDashboardController::class)->name('app.gifts.index');
    Route::get('/app/gifts/{gift}/edit', [GiftController::class, 'edit'])->name('app.gifts.edit');
    Route::get('/app/gifts/{gift}/preview', GiftPreviewController::class)->name('app.gifts.preview');
    Route::get('/app/gifts/{gift}/review', GiftReviewController::class)->name('app.gifts.review');
    Route::get('/app/gifts/{gift}/share', GiftShareController::class)->name('app.gifts.share');
    Route::get('/app/gifts/{gift}/analytics', GiftAnalyticsController::class)->name('app.gifts.analytics');
    Route::get('/app/gifts/{gift}/qr-code', GiftQrCodeController::class)->name('app.gifts.qr-code');
    Route::get('/app/gifts/{gift}/share-card', GiftShareCardController::class)->name('app.gifts.share-card');
    Route::get('/app/gifts/{gift}/share-card/download', [GiftShareCardController::class, 'download'])->name('app.gifts.share-card.download');
    Route::get('/app/gifts/{gift}/checkout', [GiftCheckoutController::class, 'show'])->name('app.gifts.checkout');
    Route::post('/app/gifts/{gift}/checkout', [GiftCheckoutController::class, 'store'])->name('app.gifts.checkout.store');
    Route::post('/app/gifts/{gift}/publish', GiftPublicationController::class)->name('app.gifts.publish');
    Route::patch('/app/gifts/{gift}', [GiftController::class, 'update'])->name('app.gifts.update');
    Route::get('/app/gifts/{gift}/assets', [GiftAssetController::class, 'index'])->name('app.gifts.assets.index');
    Route::get('/app/gifts/{gift}/page-backgrounds', [GiftPageBackgroundController::class, 'index'])->name('app.gifts.page-backgrounds.index');
    Route::get('/app/gifts/{gift}/media', [GiftMediaController::class, 'index'])->name('app.gifts.media.index');
    Route::post('/app/gifts/{gift}/media', [GiftMediaController::class, 'store'])
        ->middleware('throttle:media-upload')
        ->name('app.gifts.media.store');
    Route::get('/app/gifts/{gift}/media/{mediaItem}/thumbnail', [GiftMediaController::class, 'thumbnail'])->name('app.gifts.media.thumbnail');
    Route::get('/app/gifts/{gift}/media/{mediaItem}', [GiftMediaController::class, 'show'])->name('app.gifts.media.show');
    Route::delete('/app/gifts/{gift}/media/{mediaItem}', [GiftMediaController::class, 'destroy'])->name('app.gifts.media.destroy');
    Route::patch('/app/gifts/{gift}/pages/{giftPage}', [GiftPageController::class, 'update'])->name('app.gifts.pages.update');
    Route::get('/app/orders/{order}', OrderStatusController::class)->name('app.orders.show');
    Route::post('/app/orders/{order}/dev-approve', DevPaymentApprovalController::class)->name('app.orders.dev-approve');
});

Route::fallback(function () {
    return Inertia::render('Errors/NotFound')
        ->toResponse(request())
        ->setStatusCode(404);
});
