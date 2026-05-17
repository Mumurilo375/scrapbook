<?php

namespace App\Domain\Gifts\Actions;

use App\Domain\Gifts\Enums\GiftStatus;
use App\Domain\Gifts\Models\Gift;

final class ExpireOldDrafts
{
    public function handle(int $days = 7): int
    {
        return Gift::query()
            ->where('status', GiftStatus::Draft->value)
            ->where(function ($query) use ($days): void {
                $query
                    ->where('last_edited_at', '<', now()->subDays($days))
                    ->orWhere(function ($query) use ($days): void {
                        $query->whereNull('last_edited_at')->where('created_at', '<', now()->subDays($days));
                    });
            })
            ->update([
                'status' => GiftStatus::Expired->value,
                'expires_at' => now(),
            ]);
    }
}
