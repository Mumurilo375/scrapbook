<?php

namespace App\Http\Controllers\Gifts;

use App\Domain\Analytics\Enums\AnalyticsEventName;
use App\Domain\Analytics\Services\AnalyticsTracker;
use App\Domain\Gifts\Models\Gift;
use App\Domain\Gifts\Services\GiftShareCardData;
use App\Http\Controllers\Controller;
use BackedEnum;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class GiftShareCardController extends Controller
{
    public function __invoke(Request $request, Gift $gift, GiftShareCardData $shareCardData, AnalyticsTracker $tracker): Response
    {
        return $this->render($request, $gift, $shareCardData, $tracker, autoPrint: false);
    }

    public function download(Request $request, Gift $gift, GiftShareCardData $shareCardData, AnalyticsTracker $tracker): Response
    {
        return $this->render($request, $gift, $shareCardData, $tracker, autoPrint: true);
    }

    private function render(
        Request $request,
        Gift $gift,
        GiftShareCardData $shareCardData,
        AnalyticsTracker $tracker,
        bool $autoPrint,
    ): Response {
        Gate::forUser($request->user())->authorize('view', $gift);

        abort_unless($gift->isPubliclyAccessible(), 404, 'Publique o presente para gerar o cartão.');

        $tracker->track(
            $autoPrint ? AnalyticsEventName::ShareCardPrintClicked : AnalyticsEventName::ShareCardOpened,
            [
                'request' => $request,
                'source' => 'server',
                'user' => $request->user(),
                'gift' => $gift,
            ],
        );

        return Inertia::render('gifts/Share/ShareCard', [
            'gift' => [
                'id' => $gift->id,
                'title' => $gift->title,
                'status' => $this->enumValue($gift->status),
                'urls' => [
                    'dashboard' => route('app.gifts.index', [], false),
                    'share' => route('app.gifts.share', $gift, false),
                ],
            ],
            'card' => [
                ...$shareCardData->forGift($gift),
                'qr_code_url' => route('app.gifts.qr-code', $gift, false),
            ],
            'autoPrint' => $autoPrint,
        ]);
    }

    private function enumValue(mixed $value): string
    {
        return $value instanceof BackedEnum ? $value->value : (string) $value;
    }
}
