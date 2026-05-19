<?php

namespace App\Http\Controllers\Analytics;

use App\Domain\Analytics\Enums\AnalyticsEventName;
use App\Domain\Analytics\Models\GiftVisit;
use App\Domain\Analytics\Services\AnalyticsTracker;
use App\Domain\Gifts\Models\Gift;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

class AnalyticsEventController extends Controller
{
    public function __invoke(Request $request, AnalyticsTracker $tracker): JsonResponse
    {
        $data = $request->validate([
            'event_name' => ['required', 'string', Rule::in(array_keys(AnalyticsEventName::clientOptions()))],
            'event_uuid' => ['nullable', 'uuid'],
            'gift_id' => ['nullable', 'string', 'max:40'],
            'visit_uuid' => ['nullable', 'uuid'],
            'page_index' => ['nullable', 'integer', 'min:0', 'max:1000'],
            'page_id' => ['nullable', 'string', 'max:80'],
            'element_id' => ['nullable', 'string', 'max:120'],
            'element_type' => ['nullable', 'string', 'max:80'],
            'screen_size_bucket' => ['nullable', 'string', Rule::in(['small', 'medium', 'large', 'mobile', 'tablet', 'desktop'])],
            'payload' => ['nullable', 'array'],
            'metadata' => ['nullable', 'array'],
        ]);

        $eventName = AnalyticsEventName::from($data['event_name']);
        $giftVisit = $this->giftVisit($data['visit_uuid'] ?? null);
        $gift = $giftVisit?->gift ?? $this->authorizedGift($request, $data['gift_id'] ?? null);

        $context = [
            'request' => $request,
            'source' => 'client',
            'event_uuid' => $data['event_uuid'] ?? null,
            'gift_visit' => $giftVisit,
            'gift' => $gift,
            'page_index' => $data['page_index'] ?? null,
            'page_id' => $data['page_id'] ?? null,
            'element_id' => $data['element_id'] ?? null,
            'element_type' => $data['element_type'] ?? null,
            'metadata' => [
                'screen_size_bucket' => $data['screen_size_bucket'] ?? null,
                ...(is_array($data['metadata'] ?? null) ? $data['metadata'] : []),
            ],
        ];

        $tracker->track($eventName, $context, is_array($data['payload'] ?? null) ? $data['payload'] : []);

        return response()->json(['tracked' => true], 202);
    }

    private function giftVisit(mixed $visitUuid): ?GiftVisit
    {
        if (! is_string($visitUuid) || trim($visitUuid) === '') {
            return null;
        }

        return GiftVisit::query()
            ->with('gift')
            ->where('visit_uuid', $visitUuid)
            ->first();
    }

    private function authorizedGift(Request $request, mixed $giftId): ?Gift
    {
        if (! is_string($giftId) || trim($giftId) === '' || $request->user() === null) {
            return null;
        }

        $gift = Gift::query()->find($giftId);

        if (! $gift instanceof Gift || ! Gate::forUser($request->user())->allows('view', $gift)) {
            return null;
        }

        return $gift;
    }
}
