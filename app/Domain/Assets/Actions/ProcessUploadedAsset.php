<?php

namespace App\Domain\Assets\Actions;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Throwable;

final class ProcessUploadedAsset
{
    /**
     * @return array{
     *     storage_disk: string,
     *     storage_path: string,
     *     public_url: null,
     *     mime_type: string,
     *     size_bytes: int,
     *     width: int,
     *     height: int
     * }
     */
    public function handle(UploadedFile $file): array
    {
        $source = $this->sourceImageData($file);
        $contents = $this->fileContents($file);
        $disk = (string) config('scrapbook.assets.disk', config('filesystems.default'));
        $extension = $this->extensionForMimeType($source['mime_type']);
        $storagePath = 'system/assets/'.((string) Str::ulid()).'/asset.'.$extension;

        try {
            if (! Storage::disk($disk)->put($storagePath, $contents, ['visibility' => 'private'])) {
                throw ValidationException::withMessages([
                    'asset_file' => 'Não foi possível salvar o arquivo do asset.',
                ]);
            }

            return [
                'storage_disk' => $disk,
                'storage_path' => $storagePath,
                'public_url' => null,
                'mime_type' => $source['mime_type'],
                'size_bytes' => strlen($contents),
                'width' => $source['width'],
                'height' => $source['height'],
            ];
        } catch (ValidationException $exception) {
            $this->deleteStoredFileQuietly($disk, $storagePath);

            throw $exception;
        } catch (Throwable $exception) {
            $this->deleteStoredFileQuietly($disk, $storagePath);

            report($exception);

            throw ValidationException::withMessages([
                'asset_file' => 'Não foi possível salvar o asset no storage configurado. Verifique se o storage está online e tente novamente.',
            ]);
        }
    }

    /**
     * @return array{mime_type: string, extension: string, width: int, height: int}
     */
    private function sourceImageData(UploadedFile $file): array
    {
        $path = $file->getRealPath();

        if (! is_string($path) || $path === '' || ! is_file($path)) {
            throw ValidationException::withMessages([
                'asset_file' => 'Não foi possível ler o arquivo enviado.',
            ]);
        }

        $fileSize = $file->getSize();
        $maxUploadBytes = max(1, (int) config('scrapbook.assets.max_upload_kb', 8192)) * 1024;

        if (is_int($fileSize) && $fileSize > $maxUploadBytes) {
            throw ValidationException::withMessages([
                'asset_file' => 'O asset excede o tamanho máximo permitido.',
            ]);
        }

        $imageSize = @getimagesize($path);

        if (! is_array($imageSize)) {
            throw ValidationException::withMessages([
                'asset_file' => 'O arquivo enviado não é uma imagem PNG, WebP ou JPG válida.',
            ]);
        }

        $mimeType = (string) ($imageSize['mime'] ?? $file->getMimeType());
        $extension = Str::lower($file->getClientOriginalExtension());
        $allowedMimeTypes = config('scrapbook.assets.allowed_mime_types', ['image/jpeg', 'image/png', 'image/webp']);
        $allowedExtensions = config('scrapbook.assets.allowed_extensions', ['jpg', 'jpeg', 'png', 'webp']);
        $mimeExtensions = config('scrapbook.assets.mime_extensions', [
            'image/jpeg' => ['jpg', 'jpeg'],
            'image/png' => ['png'],
            'image/webp' => ['webp'],
        ]);

        if (! in_array($mimeType, $allowedMimeTypes, true)
            || ! in_array($extension, $allowedExtensions, true)
            || ! in_array($extension, $mimeExtensions[$mimeType] ?? [], true)
        ) {
            throw ValidationException::withMessages([
                'asset_file' => 'Use um arquivo PNG, WebP ou JPG/JPEG válido. SVG está bloqueado nesta etapa.',
            ]);
        }

        $width = (int) ($imageSize[0] ?? 0);
        $height = (int) ($imageSize[1] ?? 0);
        $maxWidth = max(1, (int) config('scrapbook.assets.max_input_width', 6000));
        $maxHeight = max(1, (int) config('scrapbook.assets.max_input_height', 6000));

        if ($width <= 0 || $height <= 0 || $width > $maxWidth || $height > $maxHeight) {
            throw ValidationException::withMessages([
                'asset_file' => 'O asset excede as dimensões máximas permitidas.',
            ]);
        }

        return [
            'mime_type' => $mimeType,
            'extension' => $extension,
            'width' => $width,
            'height' => $height,
        ];
    }

    private function fileContents(UploadedFile $file): string
    {
        $path = $file->getRealPath();
        $contents = is_string($path) ? file_get_contents($path) : false;

        if (! is_string($contents) || $contents === '') {
            throw ValidationException::withMessages([
                'asset_file' => 'Não foi possível ler o conteúdo do asset.',
            ]);
        }

        return $contents;
    }

    private function extensionForMimeType(string $mimeType): string
    {
        return match ($mimeType) {
            'image/jpeg' => 'jpg',
            'image/png' => 'png',
            'image/webp' => 'webp',
            default => throw ValidationException::withMessages([
                'asset_file' => 'Tipo de asset não suportado.',
            ]),
        };
    }

    private function deleteStoredFileQuietly(string $disk, string $path): void
    {
        try {
            Storage::disk($disk)->delete($path);
        } catch (Throwable) {
            //
        }
    }
}
