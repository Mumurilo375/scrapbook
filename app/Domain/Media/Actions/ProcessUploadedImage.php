<?php

namespace App\Domain\Media\Actions;

use App\Domain\Gifts\Enums\GiftStatus;
use App\Domain\Gifts\Models\Gift;
use App\Domain\Media\Enums\MediaStatus;
use App\Domain\Media\Enums\MediaType;
use App\Domain\Media\Models\MediaItem;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Intervention\Image\Encoders\WebpEncoder;
use Intervention\Image\ImageManager;
use Throwable;

final class ProcessUploadedImage
{
    public function handle(User $user, Gift $gift, UploadedFile $file): MediaItem
    {
        $gift->loadMissing('plan');

        $this->validateGift($user, $gift);
        $this->validateLimits($gift, $file);

        $source = $this->sourceImageData($file);
        $disk = (string) config('scrapbook.media.disk', config('filesystems.default'));
        $baseName = (string) Str::ulid();
        $processedPath = "media/gifts/{$gift->id}/{$baseName}.webp";
        $thumbnailPath = "media/gifts/{$gift->id}/thumbnails/{$baseName}.webp";

        try {
            $manager = $this->imageManager();

            $image = $manager->decodePath($file->getRealPath());
            $image->scaleDown(
                width: max(1, (int) config('scrapbook.media.processed_max_dimension', 2200)),
                height: max(1, (int) config('scrapbook.media.processed_max_dimension', 2200)),
            );

            $processed = $image->encode(new WebpEncoder(
                quality: $this->quality('scrapbook.media.webp_quality', 82),
                strip: true,
            ));

            $thumbnail = $manager->decodePath($file->getRealPath());
            $thumbnail->scaleDown(
                width: max(1, (int) config('scrapbook.media.thumbnail_max_dimension', 420)),
                height: max(1, (int) config('scrapbook.media.thumbnail_max_dimension', 420)),
            );

            $encodedThumbnail = $thumbnail->encode(new WebpEncoder(
                quality: $this->quality('scrapbook.media.thumbnail_quality', 72),
                strip: true,
            ));

            $storage = Storage::disk($disk);

            if (! $storage->put($processedPath, $processed->toString(), ['visibility' => 'private'])) {
                throw ValidationException::withMessages([
                    'image' => 'Não foi possível salvar a imagem processada.',
                ]);
            }

            if (! $storage->put($thumbnailPath, $encodedThumbnail->toString(), ['visibility' => 'private'])) {
                throw ValidationException::withMessages([
                    'image' => 'Não foi possível salvar a miniatura da imagem.',
                ]);
            }

            return MediaItem::query()->create([
                'user_id' => $user->id,
                'gift_id' => $gift->id,
                'type' => MediaType::Image,
                'original_filename' => $this->safeOriginalFilename($file),
                'storage_disk' => $disk,
                'storage_path' => $processedPath,
                'mime_type' => 'image/webp',
                'size_bytes' => $processed->size(),
                'width' => $image->width(),
                'height' => $image->height(),
                'variants' => [
                    'thumbnail' => [
                        'storage_path' => $thumbnailPath,
                        'mime_type' => 'image/webp',
                        'size_bytes' => $encodedThumbnail->size(),
                        'width' => $thumbnail->width(),
                        'height' => $thumbnail->height(),
                    ],
                ],
                'metadata' => [
                    'source_mime_type' => $source['mime_type'],
                    'source_extension' => $source['extension'],
                    'source_size_bytes' => is_int($file->getSize()) ? $file->getSize() : null,
                    'processed_at' => now()->toIso8601String(),
                ],
                'status' => MediaStatus::Processed,
            ]);
        } catch (Throwable $exception) {
            Storage::disk($disk)->delete([$processedPath, $thumbnailPath]);

            throw $exception;
        }
    }

    private function validateGift(User $user, Gift $gift): void
    {
        if ($gift->user_id !== $user->id || $gift->statusEnum() !== GiftStatus::Draft) {
            throw ValidationException::withMessages([
                'gift' => 'Somente rascunhos próprios podem receber imagens nesta etapa.',
            ]);
        }
    }

    private function validateLimits(Gift $gift, UploadedFile $file): void
    {
        $maxUploadBytes = max(1, (int) config('scrapbook.media.max_upload_kb', 5120)) * 1024;
        $fileSize = $file->getSize();

        if (is_int($fileSize) && $fileSize > $maxUploadBytes) {
            throw ValidationException::withMessages([
                'image' => 'A imagem excede o tamanho máximo permitido.',
            ]);
        }

        $currentImageCount = $gift->mediaItems()
            ->where('type', MediaType::Image->value)
            ->where('status', '!=', MediaStatus::Deleted->value)
            ->count();

        $maxImages = $this->giftLimit($gift, 'max_photos', 'scrapbook.media.max_images_per_gift');

        if ($maxImages > 0 && $currentImageCount >= $maxImages) {
            throw ValidationException::withMessages([
                'image' => 'Este presente atingiu o limite de imagens.',
            ]);
        }

        $maxStorageMb = $this->giftLimit($gift, 'max_storage_mb', 'scrapbook.media.max_storage_mb');

        if ($maxStorageMb <= 0 || ! is_int($fileSize)) {
            return;
        }

        $currentStorageBytes = (int) $gift->mediaItems()
            ->where('status', '!=', MediaStatus::Deleted->value)
            ->sum('size_bytes');

        if ($currentStorageBytes + $fileSize > $maxStorageMb * 1024 * 1024) {
            throw ValidationException::withMessages([
                'image' => 'Este presente atingiu o limite de armazenamento de imagens.',
            ]);
        }
    }

    /**
     * @return array{mime_type: string, extension: string, width: int, height: int}
     */
    private function sourceImageData(UploadedFile $file): array
    {
        $path = $file->getRealPath();

        if (! is_string($path) || $path === '') {
            throw ValidationException::withMessages([
                'image' => 'Não foi possível ler o arquivo enviado.',
            ]);
        }

        $imageSize = @getimagesize($path);

        if (! is_array($imageSize)) {
            throw ValidationException::withMessages([
                'image' => 'O arquivo enviado não é uma imagem válida.',
            ]);
        }

        $mimeType = (string) ($imageSize['mime'] ?? $file->getMimeType());
        $extension = Str::lower($file->getClientOriginalExtension());

        $allowedMimeTypes = config('scrapbook.media.allowed_mime_types', ['image/jpeg', 'image/png', 'image/webp']);
        $allowedExtensions = config('scrapbook.media.allowed_extensions', ['jpg', 'jpeg', 'png', 'webp']);
        $mimeExtensions = config('scrapbook.media.mime_extensions', []);

        if (! in_array($mimeType, $allowedMimeTypes, true)
            || ! in_array($extension, $allowedExtensions, true)
            || ! in_array($extension, $mimeExtensions[$mimeType] ?? [], true)
        ) {
            throw ValidationException::withMessages([
                'image' => 'Use uma imagem JPG, PNG ou WebP válida.',
            ]);
        }

        $width = (int) ($imageSize[0] ?? 0);
        $height = (int) ($imageSize[1] ?? 0);
        $maxWidth = max(1, (int) config('scrapbook.media.max_input_width', 6000));
        $maxHeight = max(1, (int) config('scrapbook.media.max_input_height', 6000));

        if ($width <= 0 || $height <= 0 || $width > $maxWidth || $height > $maxHeight) {
            throw ValidationException::withMessages([
                'image' => 'A imagem excede as dimensões máximas permitidas.',
            ]);
        }

        return [
            'mime_type' => $mimeType,
            'extension' => $extension,
            'width' => $width,
            'height' => $height,
        ];
    }

    private function imageManager(): ImageManager
    {
        return new ImageManager(
            driver: config('image.driver'),
            autoOrientation: true,
            decodeAnimation: false,
            backgroundColor: config('image.options.backgroundColor', 'ffffff'),
            strip: true,
        );
    }

    private function quality(string $key, int $default): int
    {
        return max(1, min(100, (int) config($key, $default)));
    }

    private function giftLimit(Gift $gift, string $key, string $configKey): int
    {
        $limit = data_get($gift->limits_snapshot, $key)
            ?? $gift->plan?->{$key}
            ?? config($configKey);

        return is_numeric($limit) ? max(0, (int) $limit) : 0;
    }

    private function safeOriginalFilename(UploadedFile $file): ?string
    {
        $filename = str_replace("\0", '', basename(str_replace('\\', '/', $file->getClientOriginalName())));
        $filename = trim($filename);

        return $filename === '' ? null : Str::limit($filename, 180, '');
    }
}
