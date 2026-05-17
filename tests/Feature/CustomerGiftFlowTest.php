<?php

namespace Tests\Feature;

use App\Domain\Gifts\Enums\GiftStatus;
use App\Domain\Gifts\Models\Gift;
use App\Domain\Gifts\Models\GiftPage;
use App\Domain\Payments\Models\Plan;
use App\Domain\Templates\Enums\PageType;
use App\Domain\Templates\Models\Occasion;
use App\Domain\Templates\Models\Template;
use App\Domain\Templates\Models\TemplatePage;
use App\Domain\Templates\Models\TemplateVersion;
use App\Domain\Themes\Models\ThemeVersion;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class CustomerGiftFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_create_index_lists_only_active_occasions(): void
    {
        $activeOccasion = Occasion::factory()->create([
            'name' => 'Amor',
            'slug' => 'amor',
            'is_active' => true,
        ]);
        Occasion::factory()->create([
            'slug' => 'inativa',
            'is_active' => false,
        ]);

        $this
            ->get('/criar')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('gifts/Create/OccasionIndex', false)
                ->has('occasions', 1)
                ->where('occasions.0.slug', $activeOccasion->slug));
    }

    public function test_occasion_page_lists_only_templates_with_published_versions(): void
    {
        [$occasion, $publishedTemplate] = $this->publishedTemplateWithPages();
        $draftTemplate = Template::factory()->create([
            'occasion_id' => $occasion->id,
            'slug' => 'template-draft',
        ]);
        TemplateVersion::factory()->create([
            'template_id' => $draftTemplate->id,
        ]);

        $this
            ->get("/criar/{$occasion->slug}")
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('gifts/Create/TemplateIndex', false)
                ->has('templates', 1)
                ->where('templates.0.slug', $publishedTemplate->slug));
    }

    public function test_template_page_shows_real_published_template_details(): void
    {
        [$occasion, $template, $templateVersion] = $this->publishedTemplateWithPages();

        $this
            ->get("/criar/{$occasion->slug}/{$template->slug}")
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('gifts/Create/TemplateShow', false)
                ->where('template.slug', $template->slug)
                ->where('templateVersion.id', $templateVersion->id)
                ->has('templateVersion.pages', 2));
    }

    public function test_authenticated_user_can_create_draft_gift_from_published_template_version(): void
    {
        $user = User::factory()->create();
        $plan = Plan::factory()->create(['is_active' => true]);
        [, , $templateVersion] = $this->publishedTemplateWithPages($plan);

        $this
            ->actingAs($user)
            ->post('/gifts', [
                'template_version_id' => $templateVersion->id,
                'recipient_name' => 'Ana',
                'sender_name' => 'João',
            ])
            ->assertRedirect();

        $gift = Gift::query()->firstOrFail();

        $this->assertSame($user->id, $gift->user_id);
        $this->assertSame(GiftStatus::Draft, $gift->status);
        $this->assertSame($templateVersion->id, $gift->template_version_id);
        $this->assertSame($templateVersion->theme_version_id, $gift->theme_version_id);
        $this->assertSame($plan->id, $gift->plan_id);
        $this->assertDatabaseCount('gift_pages', 2);
        $this->assertDatabaseHas('gift_pages', [
            'gift_id' => $gift->id,
            'sort_order' => 10,
            'name' => 'Capa',
        ]);
    }

    public function test_draft_template_version_cannot_create_gift_from_customer_flow(): void
    {
        $user = User::factory()->create();
        $draftVersion = TemplateVersion::factory()->create();

        $this
            ->actingAs($user)
            ->from('/criar')
            ->post('/gifts', [
                'template_version_id' => $draftVersion->id,
            ])
            ->assertRedirect('/criar')
            ->assertSessionHasErrors('template_version_id');
    }

    public function test_dashboard_lists_only_authenticated_user_gifts(): void
    {
        $user = User::factory()->create();
        $ownGift = Gift::factory()->create(['user_id' => $user->id, 'title' => 'Meu rascunho']);
        Gift::factory()->create(['title' => 'Outro rascunho']);

        $this
            ->actingAs($user)
            ->get('/app/gifts')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('gifts/Dashboard/GiftIndex', false)
                ->has('gifts', 1)
                ->where('gifts.0.id', $ownGift->id)
                ->where('gifts.0.title', 'Meu rascunho'));
    }

    public function test_user_cannot_open_another_users_gift_edit_page(): void
    {
        $owner = User::factory()->create();
        $otherUser = User::factory()->create();
        $gift = Gift::factory()->create(['user_id' => $owner->id]);

        $this
            ->actingAs($otherUser)
            ->get(route('app.gifts.edit', $gift))
            ->assertForbidden();
    }

    public function test_user_can_update_own_draft_page_canvas_without_external_urls(): void
    {
        $user = User::factory()->create();
        $gift = Gift::factory()->create(['user_id' => $user->id]);
        $page = GiftPage::factory()->create([
            'gift_id' => $gift->id,
            'source_template_page_id' => null,
            'sort_order' => 10,
        ]);

        $this
            ->actingAs($user)
            ->patch(route('app.gifts.pages.update', [$gift, $page]), [
                'canvas' => [
                    'schemaVersion' => 1,
                    'artboard' => ['width' => 390, 'height' => 844],
                    'elements' => [],
                ],
            ])
            ->assertRedirect();

        $this->assertSame(1, $page->refresh()->canvas['schemaVersion']);
    }

    public function test_page_canvas_rejects_external_urls(): void
    {
        $user = User::factory()->create();
        $gift = Gift::factory()->create(['user_id' => $user->id]);
        $page = GiftPage::factory()->create([
            'gift_id' => $gift->id,
            'source_template_page_id' => null,
        ]);

        $this
            ->actingAs($user)
            ->from(route('app.gifts.edit', $gift))
            ->patch(route('app.gifts.pages.update', [$gift, $page]), [
                'canvas' => [
                    'schemaVersion' => 1,
                    'artboard' => ['width' => 390, 'height' => 844],
                    'elements' => [
                        ['id' => 'photo', 'type' => 'image', 'src' => 'https://example.com/photo.jpg'],
                    ],
                ],
            ])
            ->assertRedirect(route('app.gifts.edit', $gift))
            ->assertSessionHasErrors('canvas');
    }

    /**
     * @return array{Occasion, Template, TemplateVersion}
     */
    private function publishedTemplateWithPages(?Plan $plan = null): array
    {
        $occasion = Occasion::factory()->create([
            'is_active' => true,
            'slug' => 'amor-namoro',
        ]);
        $themeVersion = ThemeVersion::factory()->published()->create();
        $template = Template::factory()->create([
            'occasion_id' => $occasion->id,
            'is_active' => true,
            'slug' => 'cartinha-publicada',
        ]);
        $templateVersion = TemplateVersion::factory()->published()->create([
            'template_id' => $template->id,
            'theme_version_id' => $themeVersion->id,
            'default_config' => [
                'schemaVersion' => 1,
                'plan_id' => $plan?->id,
            ],
        ]);

        TemplatePage::factory()->create([
            'template_version_id' => $templateVersion->id,
            'page_type' => PageType::Cover,
            'name' => 'Capa',
            'sort_order' => 10,
        ]);
        TemplatePage::factory()->create([
            'template_version_id' => $templateVersion->id,
            'page_type' => PageType::Letter,
            'name' => 'Carta',
            'sort_order' => 20,
        ]);

        return [$occasion, $template, $templateVersion->refresh()];
    }
}
