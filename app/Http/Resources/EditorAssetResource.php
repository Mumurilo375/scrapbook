<?php

namespace App\Http\Resources;

use App\Domain\Assets\Models\Asset;
use App\Domain\Assets\Services\AssetUrlResolver;
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
