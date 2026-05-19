<?php

namespace App\Http\Controllers\Gifts;

use App\Domain\Analytics\Enums\AnalyticsEventName;
use App\Domain\Analytics\Services\AnalyticsTracker;
use App\Domain\Assets\Services\RendererAssetCatalog;
use App\Domain\Editor\CanvasSecurity;
use App\Domain\Gifts\Actions\CreateGiftFromTemplate;
use App\Domain\Gifts\Models\Gift;
use App\Domain\Gifts\Services\PublicGiftResolver;
use App\Domain\Media\Enums\MediaStatus;
use App\Domain\Media\Enums\MediaType;
use App\Domain\Payments\Enums\OrderStatus;
use App\Domain\Payments\Models\Order;
use App\Domain\Payments\Models\Plan;
use App\Domain\Templates\Models\TemplateVersion;
use App\Domain\Themes\Enums\ThemeVersionStatus;
use App\Domain\Themes\Models\ThemeVersion;
use App\Domain\Themes\ThemeConfig;
use App\Http\Controllers\Controller;
use App\Http\Requests\Gifts\StoreGiftFromTemplateRequest;
use App\Http\Requests\Gifts\UpdateGiftRequest;
use App\Http\Resources\EditorAssetResource;
use App\Http\Resources\EditorMediaItemResource;
use BackedEnum;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class GiftController extends Controller
{
    public function store(
        StoreGiftFromTemplateRequest $request,
        CreateGiftFromTemplate $createGift,
        AnalyticsTracker $tracker,
    ): RedirectResponse {
        $templateVersion = $request->templateVersion();
        $themeVersion = $this->resolveThemeVersion($request, $templateVersion);
        $plan = $this->resolvePlan($request, $templateVersion);
        $data = $request->validated();

        $gift = $createGift->handle($request->user(), $templateVersion, $plan, [
            'theme_version_id' => $themeVersion->id,
            'title' => $data['title'] ?? null,
            'recipient_name' => $data['recipient_name'] ?? null,
            'sender_name' => $data['sender_name'] ?? null,
        ]);

        $tracker->track(AnalyticsEventName::TemplateSelected, [
            'request' => $request,
            'source' => 'server',
            'user' => $request->user(),
            'gift' => $gift,
            'template_version' => $templateVersion,
            'theme_version' => $themeVersion,
            'plan' => $plan,
        ], [
            'template_version_id' => $templateVersion->id,
            'theme_version_id' => $themeVersion->id,
            'plan_id' => $plan?->id,
        ]);

        $tracker->track(AnalyticsEventName::GiftDraftCreated, [
            'request' => $request,
            'source' => 'server',
            'user' => $request->user(),
            'gift' => $gift,
            'template_version' => $templateVersion,
            'theme_version' => $themeVersion,
            'plan' => $plan,
        ]);

        return redirect()
            ->route('app.gifts.edit', $gift)
            ->with('status', 'Rascunho criado.');
    }

    public function edit(Request $request, Gift $gift, CanvasSecurity $canvasSecurity, AnalyticsTracker $tracker): Response
    {
        Gate::forUser($request->user())->authorize('view', $gift);

        $gift->load([
            'occasion',
            'templateVersion.template',
            'themeVersion.theme',
            'pages',
            'orders' => fn ($query) => $query
                ->whereIn('status', [OrderStatus::Pending->value, OrderStatus::Paid->value])
                ->latest('updated_at'),
            'mediaItems' => fn ($query) => $query
                ->where('type', MediaType::Image->value)
                ->where('status', MediaStatus::Processed->value)
                ->latest(),
        ]);

        $tracker->track(AnalyticsEventName::EditorOpened, [
            'request' => $request,
            'source' => 'server',
            'user' => $request->user(),
            'gift' => $gift,
        ], [
            'pages_count' => $gift->pages->count(),
            'media_count' => $gift->mediaItems->count(),
        ]);

        return Inertia::render('gifts/Edit/GiftEdit', [
            'gift' => $this->giftPayload($gift),
            'debugEnabled' => app()->environment(['local', 'development', 'testing']),
            'assets' => EditorAssetResource::collection(app(RendererAssetCatalog::class)->assetsForGift($gift, includeHiddenElements: true))->resolve($request),
            'media' => EditorMediaItemResource::collection($gift->mediaItems)->resolve(),
            'pages' => $gift->pages->map(fn ($page): array => [
                'id' => $page->id,
                'name' => $page->name,
                'page_type' => $this->enumValue($page->page_type),
                'sort_order' => $page->sort_order,
                'canvas' => $page->canvas,
                'is_visible' => $page->is_visible,
                'locked' => $page->locked,
                'text_max_length' => $canvasSecurity->textMaxLengthForPage($page),
                'updated_at' => $page->updated_at?->toIso8601String(),
                'update_url' => route('app.gifts.pages.update', [$gift, $page]),
            ])->values(),
        ]);
    }

    public function update(UpdateGiftRequest $request, Gift $gift): RedirectResponse|JsonResponse
    {
        $data = $request->validated();

        $gift->forceFill([
            'title' => $data['title'] ?? $gift->title,
            'recipient_name' => array_key_exists('recipient_name', $data) ? $data['recipient_name'] : $gift->recipient_name,
            'sender_name' => array_key_exists('sender_name', $data) ? $data['sender_name'] : $gift->sender_name,
            'last_edited_at' => now(),
        ])->save();

        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'data' => [
                    'gift' => [
                        'id' => $gift->id,
                        'title' => $gift->title,
                        'recipient_name' => $gift->recipient_name,
                        'sender_name' => $gift->sender_name,
                        'last_edited_at' => $gift->last_edited_at?->toIso8601String(),
                    ],
                ],
                'message' => 'Rascunho salvo.',
            ]);
        }

        return back()->with('status', 'Rascunho salvo.');
    }

    private function resolveThemeVersion(StoreGiftFromTemplateRequest $request, TemplateVersion $templateVersion): ThemeVersion
    {
        if ($request->filled('theme_version_id')) {
            $themeVersion = ThemeVersion::query()
                ->with('theme')
                ->find($request->validated('theme_version_id'));
        } else {
            $templateVersion->loadMissing('themeVersion.theme');
            $themeVersion = $templateVersion->themeVersion;
        }

        if ($themeVersion instanceof ThemeVersion
            && $this->enumValue($themeVersion->status) === ThemeVersionStatus::Published->value
            && $themeVersion->theme?->is_active
        ) {
            return $themeVersion;
        }

        $fallback = ThemeVersion::query()
            ->where('status', ThemeVersionStatus::Published->value)
            ->whereHas('theme', fn ($query) => $query->where('is_active', true))
            ->with('theme')
            ->orderByDesc('published_at')
            ->orderByDesc('version_number')
            ->first();

        if ($fallback instanceof ThemeVersion) {
            return $fallback;
        }

        throw ValidationException::withMessages([
            'theme_version_id' => 'Nenhum tema publicado está disponível.',
        ]);
    }

    private function resolvePlan(StoreGiftFromTemplateRequest $request, TemplateVersion $templateVersion): ?Plan
    {
        if ($request->filled('plan_id')) {
            return Plan::query()
                ->whereKey($request->validated('plan_id'))
                ->where('is_active', true)
                ->firstOrFail();
        }

        $planId = data_get($templateVersion->default_config, 'plan_id');

        if (is_string($planId)) {
            $plan = Plan::query()
                ->whereKey($planId)
                ->where('is_active', true)
                ->first();

            if ($plan instanceof Plan) {
                return $plan;
            }
        }

        return Plan::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('price_cents')
            ->first();
    }

    private function giftPayload(Gift $gift): array
    {
        $publicUrl = null;
        $slugToken = app(PublicGiftResolver::class)->slugToken($gift);

        if ($slugToken !== null && $gift->isPubliclyAccessible()) {
            $publicUrl = route('public.gifts.show', $slugToken);
        }

        return [
            'id' => $gift->id,
            'title' => $gift->title,
            'status' => $this->enumValue($gift->status),
            'recipient_name' => $gift->recipient_name,
            'sender_name' => $gift->sender_name,
            'last_edited_at' => $gift->last_edited_at?->toIso8601String(),
            'occasion' => $gift->occasion ? [
                'id' => $gift->occasion->id,
                'name' => $gift->occasion->name,
                'slug' => $gift->occasion->slug,
            ] : null,
            'template' => $gift->templateVersion?->template ? [
                'id' => $gift->templateVersion->template->id,
                'name' => $gift->templateVersion->template->name,
                'slug' => $gift->templateVersion->template->slug,
            ] : null,
            'theme' => $gift->themeVersion?->theme ? [
                'id' => $gift->themeVersion->theme->id,
                'name' => $gift->themeVersion->theme->name,
                'config' => ThemeConfig::publicConfig($gift->themeVersion->config),
            ] : null,
            'update_url' => route('app.gifts.update', $gift),
            'preview_url' => route('app.gifts.preview', $gift),
            'review_url' => route('app.gifts.review', $gift),
            'checkout_url' => route('app.gifts.checkout', $gift),
            'order_url' => $this->latestOrderUrl($gift),
            'public_url' => $publicUrl,
            'share_url' => $publicUrl !== null ? route('app.gifts.share', $gift) : null,
            'assets_index_url' => route('app.gifts.assets.index', $gift),
            'page_backgrounds_index_url' => route('app.gifts.page-backgrounds.index', $gift),
            'media_index_url' => route('app.gifts.media.index', $gift),
            'media_store_url' => route('app.gifts.media.store', $gift),
            'dashboard_url' => route('app.gifts.index'),
        ];
    }

    private function enumValue(mixed $value): string
    {
        return $value instanceof BackedEnum ? $value->value : (string) $value;
    }

    private function latestOrderUrl(Gift $gift): ?string
    {
        $order = $gift->orders->first();

        return $order instanceof Order ? route('app.orders.show', $order) : null;
    }
}
