<?php

namespace App\Http\Controllers\Gifts;

use App\Domain\Gifts\Models\Gift;
use App\Domain\Gifts\Services\PublicGiftResolver;
use App\Domain\Gifts\Services\ViewerMediaUrlResolver;
use App\Domain\Media\Models\MediaItem;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PublicGiftMediaController extends Controller
{
    public function show(
        string $slugToken,
        MediaItem $mediaItem,
        PublicGiftResolver $publicGiftResolver,
        ViewerMediaUrlResolver $mediaUrlResolver,
    ): StreamedResponse {
        $gift = $publicGiftResolver->resolve($slugToken);

        abort_unless($gift instanceof Gift, 404);
        abort_unless($mediaUrlResolver->canRenderMedia($gift, $mediaItem), 404);

        return $this->storageResponse($mediaItem, $mediaItem->storage_path);
    }

    public function thumbnail(
        string $slugToken,
        MediaItem $mediaItem,
        PublicGiftResolver $publicGiftResolver,
        ViewerMediaUrlResolver $mediaUrlResolver,
    ): StreamedResponse {
        $gift = $publicGiftResolver->resolve($slugToken);

        abort_unless($gift instanceof Gift, 404);
        abort_unless($mediaUrlResolver->canRenderMedia($gift, $mediaItem), 404);

        $thumbnailPath = $mediaUrlResolver->thumbnailPath($mediaItem);

        abort_unless($thumbnailPath !== null, 404);

        return $this->storageResponse($mediaItem, $thumbnailPath);
    }

    private function storageResponse(MediaItem $mediaItem, string $path): StreamedResponse
    {
        $storage = Storage::disk($mediaItem->storage_disk);

        abort_unless($storage->exists($path), 404);

        return $storage->response($path, 'scrapbook-image.webp', [
            'Cache-Control' => 'public, max-age=3600',
            'Content-Type' => $mediaItem->mime_type ?: 'image/webp',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }
}
