<?php

namespace App\Policies;

use App\Domain\Gifts\Models\Gift;
use App\Domain\Media\Models\MediaItem;
use App\Models\User;

class MediaItemPolicy
{
    public function view(User $user, MediaItem $mediaItem): bool
    {
        return $mediaItem->user_id === $user->id
            || $mediaItem->gift()->where('user_id', $user->id)->exists();
    }

    public function useMedia(User $user, MediaItem $mediaItem): bool
    {
        return $this->view($user, $mediaItem);
    }

    public function attachToGift(User $user, MediaItem $mediaItem, Gift $gift): bool
    {
        if ($gift->user_id !== $user->id) {
            return false;
        }

        return $mediaItem->user_id === $user->id
            || $mediaItem->gift_id === $gift->id;
    }
}
