<?php

namespace App\Policies;

use App\Domain\Gifts\Models\GiftPage;
use App\Models\User;

class GiftPagePolicy
{
    public function update(User $user, GiftPage $giftPage): bool
    {
        return $giftPage->gift()->where('user_id', $user->id)->exists();
    }
}
