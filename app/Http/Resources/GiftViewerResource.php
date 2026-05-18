<?php

namespace App\Http\Resources;

use App\Domain\Gifts\Models\Gift;
use App\Domain\Gifts\Services\PublicGiftResolver;
use App\Domain\Gifts\Services\ViewerMediaUrlResolver;
use BackedEnum;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

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
        return [
            'id' => $this->viewerContext === ViewerMediaUrlResolver::CONTEXT_PREVIEW ? $this->id : null,
            'title' => $this->title,
            'recipient_name' => $this->recipient_name,
            'sender_name' => $this->sender_name,
            'status' => $this->viewerContext === ViewerMediaUrlResolver::CONTEXT_PREVIEW
                ? $this->enumValue($this->status)
                : 'published',
            'published_at' => $this->published_at?->toIso8601String(),
            'expires_at' => $this->viewerContext === ViewerMediaUrlResolver::CONTEXT_PREVIEW
                ? $this->expires_at?->toIso8601String()
                : null,
            'theme' => $this->themeSummary(),
            'pages' => $this->pages
                ->map(fn ($page): array => (new GiftPageViewerResource($page, $this->resource, $this->viewerContext))->resolve($request))
                ->values()
                ->all(),
            'urls' => $this->urls(),
        ];
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
                'public' => $publicUrl,
                'create' => route('create.index', [], false),
            ];
        }

        return [
            'edit' => null,
            'preview' => null,
            'public' => null,
            'create' => route('create.index', [], false),
        ];
    }

    private function enumValue(mixed $value): string
    {
        return $value instanceof BackedEnum ? $value->value : (string) $value;
    }
}
