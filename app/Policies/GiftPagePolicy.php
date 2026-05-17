<?php

namespace App\Policies;

use App\Domain\Gifts\Enums\GiftStatus;
use App\Domain\Gifts\Models\GiftPage;
use App\Models\User;

class GiftPagePolicy
{
    public function update(User $user, GiftPage $giftPage): bool
    {
        $giftPage->loadMissing('gift');

        return $giftPage->gift->user_id === $user->id
            && $giftPage->gift->statusEnum() === GiftStatus::Draft;
    }
}
