<?php

namespace App\Http\Resources;

use App\Domain\Assets\Models\Asset;
use App\Domain\Assets\Services\RendererAssetCatalog;
use App\Domain\Gifts\Models\Gift;
use App\Domain\Gifts\Services\PublicGiftResolver;
use App\Domain\Gifts\Services\ViewerMediaUrlResolver;
use App\Domain\Themes\ThemeConfig;
use BackedEnum;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Collection;

/**
 * @mixin Gift
 */
class GiftViewerResource extends JsonResource
{
    public function __construct(
        Gift $resource,
        private readonly string $viewerContext,
    ) {
        parent::__construct($resource);
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $payload = [
            'title' => $this->title,
            'recipient_name' => $this->recipient_name,
            'sender_name' => $this->sender_name,
            'theme' => $this->themeSummary(),
            'pages' => $this->pages
                ->map(fn ($page): array => (new GiftPageViewerResource($page, $this->resource, $this->viewerContext))->resolve($request))
                ->values()
                ->all(),
            'assets' => EditorAssetResource::collection($this->viewerAssets())->resolve($request),
            'urls' => $this->urls(),
        ];

        if ($this->viewerContext === ViewerMediaUrlResolver::CONTEXT_PREVIEW) {
            $payload = [
                'id' => $this->id,
                'status' => $this->enumValue($this->status),
                'published_at' => $this->published_at?->toIso8601String(),
                'expires_at' => $this->expires_at?->toIso8601String(),
                ...$payload,
            ];
        }

        return $payload;
    }

    /**
     * @return Collection<int, Asset>
     */
    private function viewerAssets(): Collection
    {
        return app(RendererAssetCatalog::class)->assetsForGift($this->resource);
    }

    /**
     * @return array<string, mixed>|null
     */
    private function themeSummary(): ?array
    {
        if (! $this->themeVersion?->theme) {
            return null;
        }

        return [
            'name' => $this->themeVersion->theme->name,
            'config' => ThemeConfig::publicConfig($this->themeVersion->config),
        ];
    }

    /**
     * @return array<string, string|null>
     */
    private function urls(): array
    {
        if ($this->viewerContext === ViewerMediaUrlResolver::CONTEXT_PREVIEW) {
            $publicUrl = null;
            $slugToken = app(PublicGiftResolver::class)->slugToken($this->resource);

            if ($slugToken !== null && $this->resource->isPubliclyAccessible()) {
                $publicUrl = route('public.gifts.show', $slugToken, false);
            }

            return [
                'edit' => route('app.gifts.edit', $this->resource, false),
                'preview' => route('app.gifts.preview', $this->resource, false),
                'review' => route('app.gifts.review', $this->resource, false),
                'share' => $publicUrl !== null ? route('app.gifts.share', $this->resource, false) : null,
                'public' => $publicUrl,
                'create' => route('create.index', [], false),
            ];
        }

        return [
            'create' => route('create.index', [], false),
        ];
    }

    private function enumValue(mixed $value): string
    {
        return $value instanceof BackedEnum ? $value->value : (string) $value;
    }
}
