<?php

namespace App\Domain\Gifts\Actions;

use App\Domain\Assets\Models\Asset;
use App\Domain\Assets\Services\EditorAssetCatalog;
use App\Domain\Editor\CanvasNormalizer;
use App\Domain\Editor\CanvasSecurity;
use App\Domain\Gifts\Models\GiftPage;
use App\Domain\Media\Models\MediaItem;
use App\Models\User;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;

final class UpdateGiftPageCanvas
{
    public function __construct(
        private readonly CanvasSecurity $canvasSecurity,
        private readonly CanvasNormalizer $canvasNormalizer,
        private readonly EditorAssetCatalog $assetCatalog,
    ) {}

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
        $this->ensureLockedElementsWereNotMutated($giftPage, $canvas);
        $canvas = $this->normalizePageBackground($giftPage, $canvas);
        $canvas = $this->normalizeStickerElements($giftPage, $canvas);
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
     */
    private function ensureLockedElementsWereNotMutated(GiftPage $giftPage, array $canvas): void
    {
        $currentCanvas = is_array($giftPage->canvas) ? $giftPage->canvas : [];
        $currentCanvas = $this->canvasNormalizer->normalizeForPersistence($currentCanvas);
        $currentElements = is_array($currentCanvas['elements'] ?? null) ? $currentCanvas['elements'] : [];
        $nextElements = is_array($canvas['elements'] ?? null) ? $canvas['elements'] : [];
        $nextById = [];

        foreach ($nextElements as $element) {
            if (is_array($element) && is_string($element['id'] ?? null)) {
                $nextById[$element['id']] = $element;
            }
        }

        foreach ($currentElements as $element) {
            if (! is_array($element) || ($element['locked'] ?? false) !== true) {
                continue;
            }

            $elementId = $element['id'] ?? null;

            if (! is_string($elementId) || $elementId === '') {
                continue;
            }

            $nextElement = $nextById[$elementId] ?? null;

            if (! is_array($nextElement)) {
                throw ValidationException::withMessages([
                    'canvas.locked' => 'Elementos bloqueados não podem ser deletados.',
                ]);
            }

            if ($this->lockedElementComparable($element) !== $this->lockedElementComparable($nextElement)) {
                throw ValidationException::withMessages([
                    'canvas.locked' => 'Elementos bloqueados não podem ser transformados ou editados.',
                ]);
            }
        }
    }

    /**
     * @param  array<string, mixed>  $element
     * @return array<string, mixed>
     */
    private function lockedElementComparable(array $element): array
    {
        unset($element['locked'], $element['hidden'], $element['name'], $element['z']);

        return $this->canonicalize($element);
    }

    /**
     * @param  array<string, mixed>  $value
     * @return array<string, mixed>
     */
    private function canonicalize(array $value): array
    {
        foreach ($value as $key => $child) {
            if (is_array($child)) {
                $value[$key] = $this->canonicalize($child);
            }
        }

        ksort($value);

        return $value;
    }

    /**
     * @param  array<string, mixed>  $canvas
     * @return array<string, mixed>
     */
    private function normalizePageBackground(GiftPage $giftPage, array $canvas): array
    {
        $background = data_get($canvas, 'artboard.background');

        if (! is_array($background) || ($background['type'] ?? null) !== 'asset') {
            data_set($canvas, 'artboard.background', ['type' => 'theme']);

            return $canvas;
        }

        $asset = $this->assetForCanvas($background['assetId'] ?? $background['asset_id'] ?? null);

        if (! $this->assetCatalog->assetIsAllowedPageBackgroundForGift($giftPage->gift, $asset)) {
            throw ValidationException::withMessages([
                'canvas.artboard.background.assetId' => 'O papel da página precisa ser um asset ativo e permitido como fundo de página.',
            ]);
        }

        data_set($canvas, 'artboard.background', [
            'type' => 'asset',
            'assetId' => $asset->id,
            'fit' => in_array($background['fit'] ?? null, ['cover', 'contain'], true) ? $background['fit'] : 'cover',
            'opacity' => is_numeric($background['opacity'] ?? null) ? max(0, min(1, $background['opacity'] + 0)) : 1,
        ]);

        return $canvas;
    }

    /**
     * @param  array<string, mixed>  $canvas
     * @return array<string, mixed>
     */
    private function normalizeStickerElements(GiftPage $giftPage, array $canvas): array
    {
        if (! isset($canvas['elements']) || ! is_array($canvas['elements'])) {
            return $canvas;
        }

        foreach ($canvas['elements'] as $index => $element) {
            if (! is_array($element) || ($element['type'] ?? null) !== 'sticker') {
                continue;
            }

            $this->rejectStickerUrlFields($element);

            $assetId = $element['assetId'] ?? $element['asset_id'] ?? null;

            if ($assetId === null || $assetId === '') {
                unset($element['assetId'], $element['asset_id']);
                $canvas['elements'][$index] = $element;

                continue;
            }

            $asset = $this->assetForCanvas($assetId);

            if (! $this->assetCatalog->assetIsAllowedForGift($giftPage->gift, $asset)) {
                throw ValidationException::withMessages([
                    'canvas.assets' => 'O canvas referencia um asset indisponível para este tema.',
                ]);
            }

            if (! $this->assetCatalog->assetIsAllowedDecorativeForGift($giftPage->gift, $asset)) {
                throw ValidationException::withMessages([
                    'canvas.assets' => 'Papéis e texturas de página devem ser usados como fundo da página, não como adesivos.',
                ]);
            }

            $element['assetId'] = $asset->id;
            unset($element['asset_id'], $element['asset'], $element['assetUrl'], $element['asset_url'], $element['previewUrl'], $element['preview_url'], $element['renderMode']);

            $canvas['elements'][$index] = $element;
        }

        return $canvas;
    }

    /**
     * @param  array<string, mixed>  $element
     */
    private function rejectStickerUrlFields(array $element): void
    {
        foreach (['src', 'url', 'publicUrl', 'public_url', 'previewUrl', 'preview_url', 'assetUrl', 'asset_url', 'storage_path', 'storagePath'] as $key) {
            if (filled($element[$key] ?? null)) {
                throw ValidationException::withMessages([
                    'canvas.assets' => 'Stickers do canvas precisam usar assetId, não URLs ou paths manuais.',
                ]);
            }
        }
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

    private function assetForCanvas(mixed $assetId): Asset
    {
        if (! is_string($assetId) && ! is_int($assetId)) {
            throw ValidationException::withMessages([
                'canvas.assets' => 'O canvas referencia um asset inválido.',
            ]);
        }

        $assetId = trim((string) $assetId);

        if ($assetId === '') {
            throw ValidationException::withMessages([
                'canvas.assets' => 'O canvas referencia um asset inválido.',
            ]);
        }

        $asset = Asset::query()->find($assetId);

        if (! $asset instanceof Asset) {
            throw ValidationException::withMessages([
                'canvas.assets' => 'O canvas referencia um asset indisponível.',
            ]);
        }

        return $asset;
    }
}
