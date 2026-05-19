<?php

namespace App\Http\Controllers\Gifts;

use App\Domain\Analytics\Enums\AnalyticsEventName;
use App\Domain\Analytics\Services\AnalyticsTracker;
use App\Domain\Gifts\Enums\GiftStatus;
use App\Domain\Gifts\Models\Gift;
use App\Domain\Gifts\Services\GiftPublicationChecklist;
use App\Http\Controllers\Controller;
use App\Http\Resources\GiftPublicationReviewResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class GiftReviewController extends Controller
{
    public function __invoke(Request $request, Gift $gift, GiftPublicationChecklist $checklist, AnalyticsTracker $tracker): Response
    {
        Gate::forUser($request->user())->authorize('view', $gift);

        $gift->load([
            'pages',
            'mediaItems',
            'plan',
        ]);

        $checks = $checklist->evaluate(
            $request->user(),
            $gift,
            allowPublished: $gift->statusEnum() === GiftStatus::Published,
            allowPendingPayment: $gift->statusEnum() === GiftStatus::PendingPayment,
        );

        $tracker->track(AnalyticsEventName::ReviewOpened, [
            'request' => $request,
            'source' => 'server',
            'user' => $request->user(),
            'gift' => $gift,
        ], [
            'can_checkout' => $checklist->canPublish($checks),
            'failed_checks_count' => collect($checks)->filter(fn (mixed $check): bool => is_array($check) && ($check['passed'] ?? false) === false)->count(),
        ]);

        return Inertia::render('gifts/Review/GiftReview', [
            'gift' => (new GiftPublicationReviewResource($gift, $checks))->resolve($request),
        ]);
    }
}
