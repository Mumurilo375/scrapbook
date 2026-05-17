<?php

namespace App\Domain\Gifts\Actions;

use App\Domain\Gifts\Models\GiftPage;
use App\Domain\Media\Models\MediaItem;
use App\Models\User;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;

final class UpdateGiftPageCanvas
{
    /**
     * @param  array<string, mixed>  $canvas
     */
    public function handle(User $user, GiftPage $giftPage, array $canvas): GiftPage
    {
        $giftPage->loadMissing('gift');

        Gate::forUser($user)->authorize('update', $giftPage);

        if ($giftPage->locked) {
            throw ValidationException::withMessages([
                'page' => 'Locked gift pages cannot be edited.',
            ]);
        }

        $this->validateCanvasShape($canvas);
        $this->validateMediaReferences($user, $giftPage, $canvas);

        $giftPage->forceFill([
            'canvas' => $canvas,
        ])->save();

        $giftPage->gift->forceFill([
            'last_edited_at' => now(),
        ])->save();

        return $giftPage->refresh();
    }

    /**
     * @param  array<string, mixed>  $canvas
     */
    private function validateCanvasShape(array $canvas): void
    {
        if (! isset($canvas['schemaVersion']) || ! is_int($canvas['schemaVersion'])) {
            throw ValidationException::withMessages([
                'canvas.schemaVersion' => 'Canvas schemaVersion is required.',
            ]);
        }

        if (! isset($canvas['elements']) || ! is_array($canvas['elements'])) {
            throw ValidationException::withMessages([
                'canvas.elements' => 'Canvas elements must be an array.',
            ]);
        }
    }

    /**
     * @param  array<string, mixed>  $canvas
     */
    private function validateMediaReferences(User $user, GiftPage $giftPage, array $canvas): void
    {
        $mediaItemIds = [];
        $this->collectMediaItemIds($canvas, $mediaItemIds);

        foreach (array_unique($mediaItemIds) as $mediaItemId) {
            $mediaItem = MediaItem::query()->find($mediaItemId);

            if ($mediaItem === null) {
                throw ValidationException::withMessages([
                    'canvas.media' => 'Canvas references an unavailable media item.',
                ]);
            }

            Gate::forUser($user)->authorize('attachToGift', [$mediaItem, $giftPage->gift]);
        }
    }

    /**
     * @param  array<int, string>  $mediaItemIds
     */
    private function collectMediaItemIds(mixed $value, array &$mediaItemIds): void
    {
        if (! is_array($value)) {
            return;
        }

        foreach ($value as $key => $child) {
            if (in_array($key, ['mediaItemId', 'media_item_id'], true) && is_string($child)) {
                $mediaItemIds[] = $child;
            }

            $this->collectMediaItemIds($child, $mediaItemIds);
        }
    }
}
