<?php

namespace App\Filament\Resources\Assets\Pages\Concerns;

use App\Domain\Assets\Actions\ProcessUploadedAsset;
use App\Domain\Assets\Enums\AssetType;
use App\Domain\Assets\Models\Asset;
use App\Domain\Assets\Support\AssetMetadata;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

trait HandlesAssetUploads
{
    /**
     * @var array{disk: string, path: string}|null
     */
    protected ?array $storedAssetFileToDelete = null;

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    protected function prepareAssetData(array $data, ?Asset $record = null): array
    {
        $file = $this->uploadedAssetFile($data['asset_file'] ?? null);

        unset($data['asset_file']);

        if (isset($data['slug']) && trim((string) $data['slug']) === '') {
            $data['slug'] = null;
        }

        if ($file instanceof UploadedFile) {
            if ($record instanceof Asset && filled($record->storage_path)) {
                $this->storedAssetFileToDelete = [
                    'disk' => $record->storage_disk ?: (string) config('scrapbook.assets.disk', config('filesystems.default')),
                    'path' => $record->storage_path,
                ];
            }

            $data = [
                ...$data,
                ...app(ProcessUploadedAsset::class)->handle($file),
            ];
        } elseif (! $record instanceof Asset && blank($data['storage_path'] ?? null)) {
            throw ValidationException::withMessages([
                'asset_file' => 'Envie um arquivo PNG, WebP ou JPG/JPEG para criar o asset.',
            ]);
        }

        $type = $data['type'] ?? $record?->type ?? AssetType::Sticker->value;
        $width = $data['width'] ?? $record?->width;
        $height = $data['height'] ?? $record?->height;
        $metadata = $data['metadata'] ?? $record?->metadata ?? null;

        $data['metadata'] = AssetMetadata::normalizeForVisualAsset(
            is_array($metadata) ? $metadata : null,
            $type,
            $width,
            $height,
            forceImageRenderMode: $file instanceof UploadedFile,
        );

        return $data;
    }

    protected function deleteReplacedAssetFile(): void
    {
        if ($this->storedAssetFileToDelete === null) {
            return;
        }

        $disk = $this->storedAssetFileToDelete['disk'];
        $path = $this->storedAssetFileToDelete['path'];

        if (filled($path)) {
            Storage::disk($disk)->delete($path);
        }

        $this->storedAssetFileToDelete = null;
    }

    private function uploadedAssetFile(mixed $value): ?UploadedFile
    {
        if ($value instanceof UploadedFile) {
            return $value;
        }

        if (! is_array($value)) {
            return null;
        }

        foreach ($value as $item) {
            if ($item instanceof UploadedFile) {
                return $item;
            }
        }

        return null;
    }
}
