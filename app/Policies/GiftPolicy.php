<?php

namespace App\Policies;

use App\Domain\Gifts\Enums\GiftStatus;
use App\Domain\Gifts\Models\Gift;
use App\Models\User;

class GiftPolicy
{
    public function view(User $user, Gift $gift): bool
    {
        return $gift->user_id === $user->id;
    }

    public function update(User $user, Gift $gift): bool
    {
        return $gift->user_id === $user->id
            && ! in_array($gift->statusEnum(), [GiftStatus::Disabled, GiftStatus::Expired], true);
    }

    public function viewAdmin(User $user, Gift $gift): bool
    {
        return $this->isStaff($user);
    }

    public function viewPublic(?User $user, Gift $gift): bool
    {
        return $gift->isPubliclyAccessible();
    }

    private function isStaff(User $user): bool
    {
        return $user->hasAnyRole(['admin', 'support']);
    }
}
