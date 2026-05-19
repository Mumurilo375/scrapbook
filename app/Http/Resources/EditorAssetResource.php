<?php

namespace App\Http\Resources;

use App\Domain\Assets\Models\Asset;
use App\Domain\Assets\Services\AssetUrlResolver;
use App\Domain\Assets\Support\AssetMetadata;
use BackedEnum;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Asset
 */
class EditorAssetResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $renderMode = $this->renderMode();
        $source = $this->getAttribute('editor_source') === 'theme' ? 'theme' : 'global';

        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'type' => $this->enumValue($this->type),
            'category' => $this->categorySummary(),
            'previewUrl' => $renderMode === 'image' ? app(AssetUrlResolver::class)->previewUrl($this->resource) : null,
            'renderMode' => $renderMode,
            'renderStyle' => $this->renderStyle(),
            'physical' => $this->physicalConfig(),
            'defaultTransform' => $this->defaultTransform(),
            'config' => $this->editorConfig(),
            'source' => $source,
            'role' => $source === 'theme' ? $this->getAttribute('editor_role') : null,
            'isThemeAsset' => $source === 'theme',
        ];
    }

    /**
     * @return array{id: string, name: string, slug: string}|null
     */
    private function categorySummary(): ?array
    {
        if (! $this->relationLoaded('category') || ! $this->category?->is_active) {
            return null;
        }

        return [
            'id' => $this->category->id,
            'name' => $this->category->name,
            'slug' => $this->category->slug,
        ];
    }

    private function renderMode(): string
    {
        $renderMode = data_get($this->metadata, 'editor.renderMode');

        return in_array($renderMode, ['image', 'svg', 'shape'], true) ? $renderMode : 'image';
    }

    private function renderStyle(): ?string
    {
        $renderStyle = data_get($this->metadata, 'renderStyle');

        if (is_string($renderStyle) && $renderStyle !== '') {
            return $renderStyle;
        }

        return AssetMetadata::renderStyleForType($this->enumValue($this->type));
    }

    /**
     * @return array<string, mixed>|null
     */
    private function physicalConfig(): ?array
    {
        $physical = data_get($this->metadata, 'physical');

        return is_array($physical) ? $physical : null;
    }

    /**
     * @return array<string, mixed>|null
     */
    private function defaultTransform(): ?array
    {
        $defaultTransform = data_get($this->metadata, 'defaultTransform');

        return is_array($defaultTransform) ? $defaultTransform : null;
    }

    /**
     * @return array<string, mixed>
     */
    private function editorConfig(): array
    {
        $editor = data_get($this->metadata, 'editor', []);

        if (! is_array($editor)) {
            return [];
        }

        $config = [];

        foreach (['shape', 'colors', 'defaultSize', 'keywords'] as $key) {
            if (array_key_exists($key, $editor)) {
                $config[$key] = $editor[$key];
            }
        }

        foreach (['renderStyle', 'physical', 'defaultTransform'] as $key) {
            $value = data_get($this->metadata, $key);

            if ($value !== null) {
                $config[$key] = $value;
            }
        }

        $themeConfig = $this->getAttribute('editor_theme_config');

        if (is_array($themeConfig)) {
            $config['theme'] = $themeConfig;
        }

        return $config;
    }

    private function enumValue(mixed $value): string
    {
        return $value instanceof BackedEnum ? $value->value : (string) $value;
    }
}
