<?php

namespace App\Domain\Gifts\Services;

use App\Domain\Gifts\Models\Gift;
use App\Domain\Media\Enums\MediaStatus;
use App\Domain\Media\Enums\MediaType;
use App\Domain\Media\Models\MediaItem;

final class ViewerMediaUrlResolver
{
    public const CONTEXT_PREVIEW = 'preview';

    public const CONTEXT_PUBLIC = 'public';

    public function __construct(private readonly PublicGiftResolver $publicGiftResolver) {}

    public function mediaUrl(Gift $gift, MediaItem $mediaItem, string $context): ?string
    {
        if (! $this->canRenderMedia($gift, $mediaItem)) {
            return null;
        }

        if ($context === self::CONTEXT_PREVIEW) {
            return route('app.gifts.media.show', [$gift, $mediaItem], false);
        }

        if ($context === self::CONTEXT_PUBLIC) {
            $slugToken = $this->publicGiftResolver->slugToken($gift);

            return $slugToken === null
                ? null
                : route('public.gifts.media.show', [$slugToken, $mediaItem], false);
        }

        return null;
    }

    public function thumbnailUrl(Gift $gift, MediaItem $mediaItem, string $context): ?string
    {
        if (! $this->hasThumbnail($mediaItem) || ! $this->canRenderMedia($gift, $mediaItem)) {
            return null;
        }

        if ($context === self::CONTEXT_PREVIEW) {
            return route('app.gifts.media.thumbnail', [$gift, $mediaItem], false);
        }

        if ($context === self::CONTEXT_PUBLIC) {
            $slugToken = $this->publicGiftResolver->slugToken($gift);

            return $slugToken === null
                ? null
                : route('public.gifts.media.thumbnail', [$slugToken, $mediaItem], false);
        }

        return null;
    }

    public function canRenderMedia(Gift $gift, MediaItem $mediaItem): bool
    {
        return $mediaItem->gift_id === $gift->id
            && $mediaItem->deleted_at === null
            && $mediaItem->type === MediaType::Image
            && $mediaItem->status === MediaStatus::Processed;
    }

    public function hasThumbnail(MediaItem $mediaItem): bool
    {
        $thumbnail = data_get($mediaItem->variants, 'thumbnail.storage_path')
            ?? data_get($mediaItem->variants, 'thumbnail');

        return is_string($thumbnail) && $thumbnail !== '';
    }

    public function thumbnailPath(MediaItem $mediaItem): ?string
    {
        $thumbnail = data_get($mediaItem->variants, 'thumbnail.storage_path')
            ?? data_get($mediaItem->variants, 'thumbnail');

        return is_string($thumbnail) && $thumbnail !== '' ? $thumbnail : null;
    }
}
