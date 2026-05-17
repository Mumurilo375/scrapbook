<?php

namespace App\Domain\Gifts\Actions;

use App\Domain\Editor\CanvasSecurity;
use App\Domain\Gifts\Models\GiftPage;
use App\Domain\Media\Models\MediaItem;
use App\Models\User;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;

final class UpdateGiftPageCanvas
{
    public function __construct(private readonly CanvasSecurity $canvasSecurity) {}

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

        $canvas = $this->canvasSecurity->sanitizeAndValidate(
            $canvas,
            $this->canvasSecurity->textMaxLengthForPage($giftPage),
        );
        $canvas = $this->normalizeImageElements($user, $giftPage, $canvas);
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
     * @return array<string, mixed>
     */
    private function normalizeImageElements(User $user, GiftPage $giftPage, array $canvas): array
    {
        if (! isset($canvas['elements']) || ! is_array($canvas['elements'])) {
            return $canvas;
        }

        foreach ($canvas['elements'] as $index => $element) {
            if (! is_array($element) || ($element['type'] ?? null) !== 'image') {
                continue;
            }

            $mediaItemId = $element['mediaItemId'] ?? $element['media_item_id'] ?? null;
            $src = $element['src'] ?? null;
            $hasSrc = is_string($src) && trim($src) !== '';

            if ($mediaItemId === null || $mediaItemId === '') {
                if ($hasSrc) {
                    throw ValidationException::withMessages([
                        'canvas.media' => 'Imagens do canvas precisam usar uma mídia enviada para este presente.',
                    ]);
                }

                continue;
            }

            $mediaItem = $this->mediaItemForCanvas($mediaItemId);

            Gate::forUser($user)->authorize('attachToGift', [$mediaItem, $giftPage->gift]);

            $element['mediaItemId'] = $mediaItem->id;
            $element['src'] = route('app.gifts.media.show', [$giftPage->gift, $mediaItem], false);
            unset($element['media_item_id']);

            $canvas['elements'][$index] = $element;
        }

        return $canvas;
    }

    /**
     * @param  array<string, mixed>  $canvas
     */
    private function validateMediaReferences(User $user, GiftPage $giftPage, array $canvas): void
    {
        $mediaItemIds = [];
        $this->collectMediaItemIds($canvas, $mediaItemIds);

        foreach (array_unique($mediaItemIds) as $mediaItemId) {
            $mediaItem = $this->mediaItemForCanvas($mediaItemId);

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
            if (in_array($key, ['mediaItemId', 'media_item_id'], true) && (is_string($child) || is_int($child))) {
                $mediaItemIds[] = (string) $child;
            }

            $this->collectMediaItemIds($child, $mediaItemIds);
        }
    }

    private function mediaItemForCanvas(mixed $mediaItemId): MediaItem
    {
        if (! is_string($mediaItemId) && ! is_int($mediaItemId)) {
            throw ValidationException::withMessages([
                'canvas.media' => 'O canvas referencia uma mídia inválida.',
            ]);
        }

        $mediaItemId = trim((string) $mediaItemId);

        if ($mediaItemId === '') {
            throw ValidationException::withMessages([
                'canvas.media' => 'O canvas referencia uma mídia inválida.',
            ]);
        }

        $mediaItem = MediaItem::query()->find($mediaItemId);

        if ($mediaItem === null) {
            throw ValidationException::withMessages([
                'canvas.media' => 'O canvas referencia uma mídia indisponível.',
            ]);
        }

        return $mediaItem;
    }
}
