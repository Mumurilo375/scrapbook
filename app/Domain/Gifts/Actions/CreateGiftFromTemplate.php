<?php

namespace App\Domain\Gifts\Actions;

use App\Domain\Gifts\Enums\GiftStatus;
use App\Domain\Gifts\Enums\GiftVisibility;
use App\Domain\Gifts\Models\Gift;
use App\Domain\Payments\Models\Plan;
use App\Domain\Templates\Enums\PageType;
use App\Domain\Templates\Enums\TemplateVersionStatus;
use App\Domain\Templates\Models\Template;
use App\Domain\Templates\Models\TemplatePage;
use App\Domain\Templates\Models\TemplateVersion;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

final class CreateGiftFromTemplate
{
    /**
     * @param  array<string, mixed>  $attributes
     */
    public function handle(?User $user, TemplateVersion $templateVersion, ?Plan $plan = null, array $attributes = []): Gift
    {
        $status = $templateVersion->getAttribute('status');
        $status = $status instanceof TemplateVersionStatus ? $status : TemplateVersionStatus::from((string) $status);

        if ($status !== TemplateVersionStatus::Published) {
            throw ValidationException::withMessages([
                'template_version_id' => 'Only published template versions can be used to create gifts.',
            ]);
        }

        $title = (string) ($attributes['title'] ?? $templateVersion->name);

        /** @var Template|null $template */
        $template = $templateVersion->template()->first();

        /** @var Collection<int, TemplatePage> $pages */
        $pages = $templateVersion->pages()->get();

        return DB::transaction(function () use ($attributes, $pages, $plan, $template, $templateVersion, $title, $user): Gift {
            $gift = Gift::query()->create([
                'user_id' => $user?->id,
                'plan_id' => $plan?->id,
                'occasion_id' => $template?->occasion_id,
                'template_version_id' => $templateVersion->id,
                'theme_version_id' => $attributes['theme_version_id'] ?? $templateVersion->theme_version_id,
                'title' => $title,
                'slug' => Str::slug((string) ($attributes['slug'] ?? $title)) ?: null,
                'status' => GiftStatus::Draft,
                'visibility' => GiftVisibility::Private,
                'recipient_name' => $attributes['recipient_name'] ?? null,
                'sender_name' => $attributes['sender_name'] ?? null,
                'settings' => $attributes['settings'] ?? ['schemaVersion' => 1],
                'limits_snapshot' => $plan?->limitsSnapshot(),
                'last_edited_at' => now(),
            ]);

            foreach ($pages as $page) {
                $pageType = $page->getAttribute('page_type');
                $pageType = $pageType instanceof PageType ? $pageType->value : (string) $pageType;

                $gift->pages()->create([
                    'source_template_page_id' => $page->id,
                    'page_type' => $pageType,
                    'name' => $page->name,
                    'sort_order' => $page->sort_order,
                    'canvas' => $page->canvas,
                    'settings' => [
                        'editable_schema' => $page->editable_schema,
                        'constraints' => $page->constraints,
                    ],
                    'is_visible' => true,
                    'locked' => false,
                ]);
            }

            return $gift->load(['pages', 'templateVersion', 'themeVersion']);
        });
    }
}
