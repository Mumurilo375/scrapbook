<?php

namespace App\Domain\Gifts\Actions;

use App\Domain\Gifts\Enums\GiftStatus;
use App\Domain\Gifts\Enums\GiftVisibility;
use App\Domain\Gifts\Models\Gift;
use App\Domain\Payments\Models\Plan;
use App\Models\User;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

final class PublishGift
{
    public function handle(User $user, Gift $gift): Gift
    {
        Gate::forUser($user)->authorize('update', $gift);

        if (in_array($gift->statusEnum(), [GiftStatus::Disabled, GiftStatus::Expired], true)) {
            throw ValidationException::withMessages([
                'gift' => 'Disabled or expired gifts cannot be published.',
            ]);
        }

        /** @var Plan|null $plan */
        $plan = $gift->plan()->first();
        $giftLifetimeDays = $plan instanceof Plan ? $plan->getAttribute('gift_lifetime_days') : null;
        $giftLifetimeDays = is_int($giftLifetimeDays) ? $giftLifetimeDays : 180;

        $gift->forceFill([
            'slug' => $gift->slug ?: (Str::slug($gift->title) ?: 'presente-digital'),
            'public_code' => $gift->public_code ?: $this->generatePublicCode(),
            'status' => GiftStatus::Published,
            'visibility' => GiftVisibility::PublicLink,
            'published_at' => $gift->published_at ?: now(),
            'expires_at' => $gift->expires_at ?: now()->addDays($giftLifetimeDays),
        ])->save();

        return $gift->refresh();
    }

    private function generatePublicCode(): string
    {
        do {
            $publicCode = Str::random(32);
        } while (Gift::query()->where('public_code', $publicCode)->exists());

        return $publicCode;
    }
}
