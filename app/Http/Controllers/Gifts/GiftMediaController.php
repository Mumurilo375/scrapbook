<?php

namespace App\Http\Controllers\Gifts;

use App\Domain\Gifts\Enums\GiftStatus;
use App\Domain\Gifts\Models\Gift;
use App\Domain\Media\Actions\ProcessUploadedImage;
use App\Domain\Media\Enums\MediaStatus;
use App\Domain\Media\Enums\MediaType;
use App\Domain\Media\Models\MediaItem;
use App\Http\Controllers\Controller;
use App\Http\Requests\Gifts\StoreGiftMediaRequest;
use App\Http\Resources\EditorMediaItemResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class GiftMediaController extends Controller
{
    public function index(Request $request, Gift $gift): JsonResponse
    {
        Gate::forUser($request->user())->authorize('view', $gift);
        abort_unless($gift->statusEnum() === GiftStatus::Draft, 403);

        $mediaItems = $gift->mediaItems()
            ->where('type', MediaType::Image->value)
            ->where('status', MediaStatus::Processed->value)
            ->latest()
            ->get();

        return response()->json([
            'data' => EditorMediaItemResource::collection($mediaItems)->resolve(),
        ]);
    }

    public function store(
        StoreGiftMediaRequest $request,
        Gift $gift,
        ProcessUploadedImage $processUploadedImage,
    ): JsonResponse {
        $mediaItem = $processUploadedImage->handle($request->user(), $gift, $request->file('image'));

        return response()->json([
            'data' => EditorMediaItemResource::make($mediaItem)->resolve(),
        ], 201);
    }

    public function show(Request $request, Gift $gift, MediaItem $mediaItem): StreamedResponse
    {
        $this->authorizeMediaForGift($request, $gift, $mediaItem);

        return $this->storageResponse($mediaItem, $mediaItem->storage_path);
    }

    public function thumbnail(Request $request, Gift $gift, MediaItem $mediaItem): StreamedResponse
    {
        $this->authorizeMediaForGift($request, $gift, $mediaItem);

        $thumbnailPath = data_get($mediaItem->variants, 'thumbnail.storage_path')
            ?? data_get($mediaItem->variants, 'thumbnail');

        abort_unless(is_string($thumbnailPath) && $thumbnailPath !== '', 404);

        return $this->storageResponse($mediaItem, $thumbnailPath);
    }

    public function destroy(Request $request, Gift $gift, MediaItem $mediaItem): JsonResponse
    {
        $this->authorizeMediaForGift($request, $gift, $mediaItem);
        Gate::forUser($request->user())->authorize('delete', $mediaItem);

        $mediaItem->forceFill([
            'status' => MediaStatus::Deleted,
        ])->save();

        $mediaItem->delete();

        return response()->json(['deleted' => true]);
    }

    private function authorizeMediaForGift(Request $request, Gift $gift, MediaItem $mediaItem): void
    {
        abort_unless($mediaItem->gift_id === $gift->id, 404);
        abort_unless($mediaItem->status === MediaStatus::Processed, 404);

        Gate::forUser($request->user())->authorize('view', $gift);
        abort_unless($gift->statusEnum() === GiftStatus::Draft, 403);
        Gate::forUser($request->user())->authorize('view', $mediaItem);
    }

    private function storageResponse(MediaItem $mediaItem, string $path): StreamedResponse
    {
        $disk = $mediaItem->storage_disk;
        $storage = Storage::disk($disk);

        abort_unless($storage->exists($path), 404);

        return $storage->response($path, 'scrapbook-image.webp', [
            'Cache-Control' => 'private, max-age=3600',
            'Content-Type' => 'image/webp',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }
}
