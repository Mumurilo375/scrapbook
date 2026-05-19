<?php

namespace App\Domain\Templates\Actions;

use App\Domain\Assets\Models\Asset;
use App\Domain\Assets\Support\PageBackgroundAssets;
use App\Domain\Editor\CanvasNormalizer;
use App\Domain\Editor\CanvasSecurity;
use App\Domain\Gifts\Models\Gift;
use App\Domain\Gifts\Models\GiftPage;
use App\Domain\Templates\Enums\TemplateVersionStatus;
use App\Domain\Templates\Models\Occasion;
use App\Domain\Templates\Models\Template;
use App\Domain\Themes\Enums\ThemeVersionStatus;
use App\Domain\Themes\Models\ThemeVersion;
use App\Models\User;
use BackedEnum;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

final class CreateTemplateFromGift
{
    public function __construct(
        private readonly CanvasNormalizer $canvasNormalizer,
        private readonly CanvasSecurity $canvasSecurity,
    ) {}

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function handle(?User $actor, Gift $gift, array $attributes): Template
    {
        if (! $actor?->hasRole('admin')) {
            throw ValidationException::withMessages([
                'user' => 'Somente admin pode criar template global a partir de um gift.',
            ]);
        }

        $name = trim((string) ($attributes['name'] ?? ''));
        $slug = Str::slug(trim((string) ($attributes['slug'] ?? $name)));
        $status = $this->status($attributes['status'] ?? TemplateVersionStatus::Draft->value);
        $occasion = $this->occasion($attributes['occasion_id'] ?? $gift->occasion_id);
        $themeVersion = $this->themeVersion($attributes['theme_version_id'] ?? $gift->theme_version_id);
        $sortOrder = max(0, (int) ($attributes['sort_order'] ?? 0));

        if ($name === '') {
            throw ValidationException::withMessages([
                'name' => 'Informe um nome para o template.',
            ]);
        }

        if ($slug === '' || preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*$/', $slug) !== 1) {
            throw ValidationException::withMessages([
                'slug' => 'Use um slug com letras minúsculas, números e hífens.',
            ]);
        }

        if (Template::query()->where('slug', $slug)->exists()) {
            throw ValidationException::withMessages([
                'slug' => 'Já existe um template com este slug.',
            ]);
        }

        if ($status === TemplateVersionStatus::Published->value
            && ($this->enumValue($themeVersion->status) !== ThemeVersionStatus::Published->value || ! $themeVersion->theme?->is_active)
        ) {
            throw ValidationException::withMessages([
                'theme_version_id' => 'Para criar uma versão publicada, escolha uma ThemeVersion publicada de um tema ativo.',
            ]);
        }

        $gift->loadMissing(['pages']);

        if ($gift->pages->isEmpty()) {
            throw ValidationException::withMessages([
                'gift' => 'Este gift não possui páginas para virar template.',
            ]);
        }

        return DB::transaction(function () use ($attributes, $gift, $name, $occasion, $slug, $sortOrder, $status, $themeVersion): Template {
            $template = Template::query()->create([
                'occasion_id' => $occasion->id,
                'name' => $name,
                'slug' => $slug,
                'description' => blank($attributes['description'] ?? null) ? null : (string) $attributes['description'],
                'is_active' => true,
                'sort_order' => $sortOrder,
                'metadata' => [
                    'schemaVersion' => 1,
                    'creationFlow' => 'gift_to_template',
                    'personalMediaSanitized' => true,
                    'textsCopiedAsDefaults' => true,
                ],
            ]);

            $templateVersion = $template->versions()->create([
                'theme_version_id' => $themeVersion->id,
                'version_number' => 1,
                'status' => $status,
                'name' => $name.' v1',
                'preview_config' => [
                    'schemaVersion' => 1,
                    'source' => 'gift_to_template',
                ],
                'default_config' => [
                    'schemaVersion' => 1,
                    'createdFromVisualGift' => true,
                ],
                'published_at' => $status === TemplateVersionStatus::Published->value ? now() : null,
            ]);

            $gift->pages
                ->sortBy('sort_order')
                ->values()
                ->each(function (GiftPage $giftPage, int $index) use ($templateVersion, $themeVersion): void {
                    $canvas = $this->templateCanvas($giftPage, $themeVersion);

                    $templateVersion->pages()->create([
                        'page_type' => $this->enumValue($giftPage->page_type),
                        'name' => $giftPage->name,
                        'sort_order' => ($index + 1) * 10,
                        'canvas' => $canvas,
                        'editable_schema' => [
                            'schemaVersion' => 1,
                            'fields' => $this->editableFields($canvas),
                        ],
                        'constraints' => $this->constraints($giftPage),
                        'metadata' => [
                            'schemaVersion' => 1,
                            'createdFromGiftPage' => true,
                            'sourcePageWasVisible' => (bool) $giftPage->is_visible,
                            'sourcePageWasLocked' => (bool) $giftPage->locked,
                        ],
                    ]);
                });

            return $template->load(['versions.pages']);
        });
    }

    private function status(mixed $status): string
    {
        $status = $status instanceof BackedEnum ? $status->value : (string) $status;

        return in_array($status, [
            TemplateVersionStatus::Draft->value,
            TemplateVersionStatus::Published->value,
        ], true) ? $status : TemplateVersionStatus::Draft->value;
    }

    private function occasion(mixed $occasionId): Occasion
    {
        $occasion = (is_string($occasionId) || is_int($occasionId))
            ? Occasion::query()->find((string) $occasionId)
            : null;

        if (! $occasion instanceof Occasion) {
            throw ValidationException::withMessages([
                'occasion_id' => 'Escolha uma ocasião válida para o template.',
            ]);
        }

        return $occasion;
    }

    private function themeVersion(mixed $themeVersionId): ThemeVersion
    {
        $themeVersion = (is_string($themeVersionId) || is_int($themeVersionId))
            ? ThemeVersion::query()->with('theme')->find((string) $themeVersionId)
            : null;

        if (! $themeVersion instanceof ThemeVersion) {
            throw ValidationException::withMessages([
                'theme_version_id' => 'Escolha uma versão de tema válida para o template.',
            ]);
        }

        return $themeVersion;
    }

    /**
     * @return array<string, mixed>
     */
    private function templateCanvas(GiftPage $giftPage, ThemeVersion $themeVersion): array
    {
        $canvas = is_array($giftPage->canvas) ? $giftPage->canvas : [];
        $canvas = $this->canvasNormalizer->normalize($canvas);
        $canvas = $this->sanitizePageBackground($canvas, $themeVersion);
        $elements = is_array($canvas['elements'] ?? null) ? $canvas['elements'] : [];
        $imageIndex = 0;

        foreach ($elements as $index => $element) {
            if (! is_array($element)) {
                continue;
            }

            $element = $this->removeUnsafeTemplateFields($element);
            $type = $element['type'] ?? null;

            if ($type === 'image') {
                $hadPersonalMedia = $this->hadPersonalMedia($elements[$index]);
                $element = $this->sanitizeImageElement($element, $imageIndex, $hadPersonalMedia);
                $imageIndex++;
            }

            if ($type === 'sticker') {
                $element = $this->sanitizeStickerElement($element, $themeVersion);
            }

            if ($type === 'flip_polaroid') {
                $element = $this->sanitizeFlipPolaroidElement($element, $imageIndex);
                $imageIndex++;
            }

            $elements[$index] = $element;
        }

        $canvas['elements'] = $elements;

        return $this->canvasSecurity->sanitizeAndValidate($canvas);
    }

    /**
     * @param  array<string, mixed>  $canvas
     * @return array<string, mixed>
     */
    private function sanitizePageBackground(array $canvas, ThemeVersion $themeVersion): array
    {
        $background = data_get($canvas, 'artboard.background');

        if (! is_array($background) || ($background['type'] ?? null) !== 'asset') {
            data_set($canvas, 'artboard.background', ['type' => 'theme']);

            return $canvas;
        }

        $assetId = $background['assetId'] ?? $background['asset_id'] ?? null;
        $asset = (is_string($assetId) || is_int($assetId))
            ? Asset::query()->find(trim((string) $assetId))
            : null;

        if (! $asset instanceof Asset || ! $asset->is_active || ! $this->assetCanBeUsedByTheme($asset, $themeVersion)) {
            data_set($canvas, 'artboard.background', ['type' => 'theme']);

            return $canvas;
        }

        $role = $this->assetRoleForTheme($asset, $themeVersion);

        if (! PageBackgroundAssets::isPageBackground($asset, $role)) {
            data_set($canvas, 'artboard.background', ['type' => 'theme']);

            return $canvas;
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
     * @param  array<string, mixed>  $element
     * @return array<string, mixed>
     */
    private function removeUnsafeTemplateFields(array $element): array
    {
        foreach ($element as $key => $value) {
            if (is_array($value)) {
                $element[$key] = $this->removeUnsafeTemplateFields($value);
            }
        }

        foreach ([
            'mediaItemId',
            'media_item_id',
            'mediaId',
            'media_id',
            'media',
            'src',
            'url',
            'publicUrl',
            'public_url',
            'previewUrl',
            'preview_url',
            'thumbnailSrc',
            'thumbnail_url',
            'assetUrl',
            'asset_url',
            'storage_path',
            'storagePath',
            'renderMode',
        ] as $key) {
            unset($element[$key]);
        }

        return $element;
    }

    /**
     * @param  array<string, mixed>  $element
     */
    private function hadPersonalMedia(array $element): bool
    {
        foreach (['mediaItemId', 'media_item_id', 'mediaId', 'media_id', 'src', 'thumbnailSrc', 'thumbnail_url'] as $key) {
            if (filled($element[$key] ?? null)) {
                return true;
            }
        }

        return false;
    }

    /**
     * @param  array<string, mixed>  $element
     * @return array<string, mixed>
     */
    private function sanitizeImageElement(array $element, int $imageIndex, bool $hadPersonalMedia): array
    {
        if ($hadPersonalMedia || blank($element['placeholderLabel'] ?? null)) {
            $element['placeholderLabel'] = $this->placeholderLabel($imageIndex);
        }

        $element['alt'] = $element['placeholderLabel'];

        if (blank($element['slotKey'] ?? null)) {
            $element['slotKey'] = 'photo_'.($imageIndex + 1);
        }

        return $element;
    }

    /**
     * @param  array<string, mixed>  $element
     * @return array<string, mixed>
     */
    private function sanitizeStickerElement(array $element, ThemeVersion $themeVersion): array
    {
        $assetId = $element['assetId'] ?? $element['asset_id'] ?? null;

        if ($assetId === null || $assetId === '') {
            unset($element['assetId'], $element['asset_id']);

            return $element;
        }

        $asset = Asset::query()->find((string) $assetId);

        if (! $asset instanceof Asset || ! $asset->is_active) {
            throw ValidationException::withMessages([
                'canvas.assets' => 'O Gift contém um asset de sistema indisponível. Reative ou substitua o asset antes de criar o template.',
            ]);
        }

        if ($asset->themeVersions()->exists()
            && ! $asset->themeVersions()->whereKey($themeVersion->id)->exists()
        ) {
            throw ValidationException::withMessages([
                'canvas.assets' => 'O Gift contém um asset associado a outro tema. Use o mesmo tema do Gift ou associe o asset ao tema escolhido.',
            ]);
        }

        if (! PageBackgroundAssets::isDecorativeCanvasAsset($asset, $this->assetRoleForTheme($asset, $themeVersion))) {
            throw ValidationException::withMessages([
                'canvas.assets' => 'O Gift contém papel/textura usado como adesivo. Troque para fundo da página antes de criar o template.',
            ]);
        }

        $element['assetId'] = $asset->id;
        unset($element['asset_id']);

        return $element;
    }

    /**
     * @param  array<string, mixed>  $element
     * @return array<string, mixed>
     */
    private function sanitizeFlipPolaroidElement(array $element, int $imageIndex): array
    {
        $front = is_array($element['front'] ?? null) ? $element['front'] : [];
        $back = is_array($element['back'] ?? null) ? $element['back'] : [];

        if (blank($front['placeholderLabel'] ?? null)) {
            $front['placeholderLabel'] = $this->placeholderLabel($imageIndex);
        }

        if (blank($front['caption'] ?? null)) {
            $front['caption'] = 'Nosso momento';
        }

        if (blank($element['slotKey'] ?? null)) {
            $element['slotKey'] = 'interactive_photo_'.($imageIndex + 1);
        }

        $element['front'] = $front;
        $element['back'] = $back;

        return $element;
    }

    private function assetCanBeUsedByTheme(Asset $asset, ThemeVersion $themeVersion): bool
    {
        if (! $asset->themeVersions()->exists()) {
            return true;
        }

        return $asset->themeVersions()->whereKey($themeVersion->id)->exists();
    }

    private function assetRoleForTheme(Asset $asset, ThemeVersion $themeVersion): ?string
    {
        $themeAsset = $asset->themeVersions()->whereKey($themeVersion->id)->first();
        $role = $themeAsset?->pivot?->role;

        return is_string($role) && trim($role) !== '' ? trim($role) : null;
    }

    private function placeholderLabel(int $index): string
    {
        return match ($index) {
            0 => 'Foto principal',
            1 => 'Sua foto aqui',
            default => 'Memória especial',
        };
    }

    /**
     * @param  array<string, mixed>  $canvas
     * @return array<int, string>
     */
    private function editableFields(array $canvas): array
    {
        $elements = is_array($canvas['elements'] ?? null) ? $canvas['elements'] : [];

        return collect($elements)
            ->filter(fn (mixed $element): bool => is_array($element)
                && (in_array($element['type'] ?? null, ['text', 'image', 'interactive_envelope', 'flip_polaroid'], true) || ($element['editableText'] ?? false) === true))
            ->map(fn (array $element): string => (string) ($element['slotKey'] ?? $element['id']))
            ->filter(fn (string $value): bool => trim($value) !== '')
            ->values()
            ->all();
    }

    /**
     * @return array<string, mixed>
     */
    private function constraints(GiftPage $giftPage): array
    {
        $constraints = data_get($giftPage->settings, 'constraints');
        $constraints = is_array($constraints) ? $constraints : [];
        $constraints['schemaVersion'] = 1;

        if (! isset($constraints['maxTextLength'])) {
            $constraints['maxTextLength'] = CanvasSecurity::DEFAULT_TEXT_MAX_LENGTH;
        }

        return $constraints;
    }

    private function enumValue(mixed $value): string
    {
        return $value instanceof BackedEnum ? $value->value : (string) $value;
    }
}
