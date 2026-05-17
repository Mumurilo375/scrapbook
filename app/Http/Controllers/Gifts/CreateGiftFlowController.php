<?php

namespace App\Http\Controllers\Gifts;

use App\Domain\Payments\Models\Plan;
use App\Domain\Templates\Enums\TemplateVersionStatus;
use App\Domain\Templates\Models\Occasion;
use App\Domain\Templates\Models\Template;
use App\Domain\Templates\Models\TemplateVersion;
use App\Domain\Themes\Enums\ThemeVersionStatus;
use App\Domain\Themes\Models\ThemeVersion;
use App\Http\Controllers\Controller;
use BackedEnum;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CreateGiftFlowController extends Controller
{
    public function index(): Response
    {
        $occasions = Occasion::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get()
            ->map(fn (Occasion $occasion): array => [
                'id' => $occasion->id,
                'name' => $occasion->name,
                'slug' => $occasion->slug,
                'description' => $occasion->description,
                'sort_order' => $occasion->sort_order,
                'url' => route('create.occasion', $occasion->slug),
            ])
            ->values();

        return Inertia::render('gifts/Create/OccasionIndex', [
            'occasions' => $occasions,
        ]);
    }

    public function templates(Occasion $occasion): Response
    {
        abort_unless($occasion->is_active, 404);

        $templates = Template::query()
            ->whereBelongsTo($occasion)
            ->where('is_active', true)
            ->whereHas('versions', function ($query): void {
                $query->where('status', TemplateVersionStatus::Published->value);
            })
            ->with(['versions' => function ($query): void {
                $query
                    ->where('status', TemplateVersionStatus::Published->value)
                    ->with(['themeVersion.theme'])
                    ->withCount('pages')
                    ->orderByDesc('published_at')
                    ->orderByDesc('version_number');
            }])
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get()
            ->map(fn (Template $template): ?array => $this->templateSummary($occasion, $template))
            ->filter(fn (?array $template): bool => $template !== null)
            ->values();

        return Inertia::render('gifts/Create/TemplateIndex', [
            'occasion' => $this->occasionSummary($occasion),
            'templates' => $templates,
        ]);
    }

    public function show(Request $request, Occasion $occasion, Template $template): Response
    {
        abort_unless($occasion->is_active && $template->is_active && $template->occasion_id === $occasion->id, 404);

        $templateVersion = $this->publishedTemplateVersion($template);
        abort_unless($templateVersion instanceof TemplateVersion, 404);

        $themeVersion = $this->publishedThemeVersion($templateVersion);
        abort_unless($themeVersion instanceof ThemeVersion, 404);

        $plan = $this->defaultPlan($templateVersion);
        $returnTo = route('create.template.show', [$occasion->slug, $template->slug]);

        return Inertia::render('gifts/Create/TemplateShow', [
            'occasion' => $this->occasionSummary($occasion),
            'template' => [
                'id' => $template->id,
                'name' => $template->name,
                'slug' => $template->slug,
                'description' => $template->description,
            ],
            'templateVersion' => $this->templateVersionSummary($templateVersion),
            'theme' => $this->themeVersionSummary($themeVersion),
            'plan' => $plan instanceof Plan ? $this->planSummary($plan) : null,
            'createUrl' => route('gifts.store'),
            'loginUrl' => route('login', ['return_to' => $returnTo]),
            'isAuthenticated' => $request->user() !== null,
        ]);
    }

    private function templateSummary(Occasion $occasion, Template $template): ?array
    {
        $templateVersion = $template->versions->first();

        if (! $templateVersion instanceof TemplateVersion) {
            return null;
        }

        return [
            'id' => $template->id,
            'name' => $template->name,
            'slug' => $template->slug,
            'description' => $template->description,
            'preview_config' => $templateVersion->preview_config,
            'page_count' => $templateVersion->pages_count,
            'template_version' => $this->templateVersionSummary($templateVersion),
            'theme' => $templateVersion->themeVersion instanceof ThemeVersion
                ? $this->themeVersionSummary($templateVersion->themeVersion)
                : null,
            'url' => route('create.template.show', [$occasion->slug, $template->slug]),
        ];
    }

    private function publishedTemplateVersion(Template $template): ?TemplateVersion
    {
        return $template->versions()
            ->where('status', TemplateVersionStatus::Published->value)
            ->with(['pages', 'themeVersion.theme'])
            ->withCount('pages')
            ->orderByDesc('published_at')
            ->orderByDesc('version_number')
            ->first();
    }

    private function publishedThemeVersion(TemplateVersion $templateVersion): ?ThemeVersion
    {
        $templateVersion->loadMissing('themeVersion.theme');
        $themeVersion = $templateVersion->themeVersion;

        if ($themeVersion instanceof ThemeVersion
            && $this->enumValue($themeVersion->status) === ThemeVersionStatus::Published->value
            && $themeVersion->theme?->is_active
        ) {
            return $themeVersion;
        }

        return ThemeVersion::query()
            ->where('status', ThemeVersionStatus::Published->value)
            ->whereHas('theme', fn ($query) => $query->where('is_active', true))
            ->with('theme')
            ->orderByDesc('published_at')
            ->orderByDesc('version_number')
            ->first();
    }

    private function defaultPlan(TemplateVersion $templateVersion): ?Plan
    {
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

    private function occasionSummary(Occasion $occasion): array
    {
        return [
            'id' => $occasion->id,
            'name' => $occasion->name,
            'slug' => $occasion->slug,
            'description' => $occasion->description,
        ];
    }

    private function templateVersionSummary(TemplateVersion $templateVersion): array
    {
        return [
            'id' => $templateVersion->id,
            'name' => $templateVersion->name,
            'version_number' => $templateVersion->version_number,
            'preview_config' => $templateVersion->preview_config,
            'page_count' => $templateVersion->pages_count ?? $templateVersion->pages()->count(),
            'pages' => $templateVersion->relationLoaded('pages')
                ? $templateVersion->pages->map(fn ($page): array => [
                    'id' => $page->id,
                    'name' => $page->name,
                    'page_type' => $this->enumValue($page->page_type),
                    'sort_order' => $page->sort_order,
                ])->values()
                : [],
        ];
    }

    private function themeVersionSummary(ThemeVersion $themeVersion): array
    {
        return [
            'id' => $themeVersion->id,
            'name' => $themeVersion->name,
            'theme' => $themeVersion->theme ? [
                'id' => $themeVersion->theme->id,
                'name' => $themeVersion->theme->name,
                'slug' => $themeVersion->theme->slug,
            ] : null,
        ];
    }

    private function planSummary(Plan $plan): array
    {
        return [
            'id' => $plan->id,
            'name' => $plan->name,
            'slug' => $plan->slug,
            'description' => $plan->description,
            'price_cents' => $plan->price_cents,
            'currency' => $plan->currency,
            'max_pages' => $plan->max_pages,
            'max_photos' => $plan->max_photos,
        ];
    }

    private function enumValue(mixed $value): string
    {
        return $value instanceof BackedEnum ? $value->value : (string) $value;
    }
}
