<?php

namespace App\Http\Controllers\Gifts;

use App\Domain\Analytics\Services\AnalyticsMetrics;
use App\Domain\Gifts\Models\Gift;
use App\Http\Controllers\Controller;
use BackedEnum;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class GiftAnalyticsController extends Controller
{
    public function __invoke(Request $request, Gift $gift, AnalyticsMetrics $metrics): Response
    {
        Gate::forUser($request->user())->authorize('view', $gift);

        return Inertia::render('gifts/Analytics/GiftAnalytics', [
            'gift' => [
                'id' => $gift->id,
                'title' => $gift->title,
                'status' => $gift->status instanceof BackedEnum ? $gift->status->value : (string) $gift->status,
                'urls' => [
                    'dashboard' => route('app.gifts.index', [], false),
                    'edit' => route('app.gifts.edit', $gift, false),
                    'share' => route('app.gifts.share', $gift, false),
                ],
            ],
            'analytics' => $metrics->giftOwnerSummary($gift),
        ]);
    }
}
