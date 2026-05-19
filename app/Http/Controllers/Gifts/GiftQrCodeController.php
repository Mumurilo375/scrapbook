<?php

namespace App\Http\Controllers\Gifts;

use App\Domain\Analytics\Enums\AnalyticsEventName;
use App\Domain\Analytics\Services\AnalyticsTracker;
use App\Domain\Gifts\Actions\GenerateGiftQrCode;
use App\Domain\Gifts\Models\Gift;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Gate;

class GiftQrCodeController extends Controller
{
    public function __invoke(
        Request $request,
        Gift $gift,
        GenerateGiftQrCode $generateQrCode,
        AnalyticsTracker $tracker,
    ): Response {
        Gate::forUser($request->user())->authorize('view', $gift);

        abort_unless($gift->isPubliclyAccessible(), 404, 'Publique o presente para gerar QR Code.');

        $qrCode = $generateQrCode->handle($gift);
        $disposition = $request->boolean('download') ? 'attachment' : 'inline';

        $tracker->track(
            $request->boolean('download') ? AnalyticsEventName::QrCodeDownloaded : AnalyticsEventName::QrCodeViewed,
            [
                'request' => $request,
                'source' => 'server',
                'user' => $request->user(),
                'gift' => $gift,
            ],
        );

        return response($qrCode->svg, 200, [
            'Cache-Control' => 'private, max-age=300',
            'Content-Disposition' => $disposition.'; filename="'.$qrCode->filename.'"',
            'Content-Security-Policy' => "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'",
            'Content-Type' => 'image/svg+xml; charset=UTF-8',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }
}
