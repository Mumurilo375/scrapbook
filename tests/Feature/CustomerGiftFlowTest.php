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
use Illuminate\Support\Carbon;
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

    public function test_authenticated_user_can_open_own_gift_editor(): void
    {
        $user = User::factory()->create();
        $gift = Gift::factory()->create(['user_id' => $user->id]);
        $page = GiftPage::factory()->create([
            'gift_id' => $gift->id,
            'source_template_page_id' => null,
            'name' => 'Carta',
            'sort_order' => 10,
            'settings' => ['constraints' => ['maxTextLength' => 240]],
        ]);

        $this
            ->actingAs($user)
            ->get(route('app.gifts.edit', $gift))
            ->assertOk()
            ->assertInertia(fn (Assert $pageAssert) => $pageAssert
                ->component('gifts/Edit/GiftEdit', false)
                ->where('gift.id', $gift->id)
                ->missing('gift.settings')
                ->missing('gift.plan')
                ->where('gift.theme.config.tokens.colors.paper', '#FFF8EC')
                ->where('gift.theme.config.tokens.colors.appBackground', '#F3E7D3')
                ->where('gift.theme.config.page.texture', 'paper-grain')
                ->has('pages', 1)
                ->where('pages.0.id', $page->id)
                ->where('pages.0.text_max_length', 240)
                ->whereNotNull('pages.0.updated_at'));
    }

    public function test_guest_cannot_open_gift_editor(): void
    {
        $gift = Gift::factory()->create();

        $this
            ->get(route('app.gifts.edit', $gift))
            ->assertRedirect(route('login'));
    }

    public function test_user_can_update_own_draft_gift_metadata(): void
    {
        $user = User::factory()->create();
        $gift = Gift::factory()->create(['user_id' => $user->id]);
        $editedAt = Carbon::parse('2026-05-17 12:00:00');

        Carbon::setTestNow($editedAt);

        try {
            $this
                ->actingAs($user)
                ->patch(route('app.gifts.update', $gift), [
                    'title' => 'Novo presente',
                    'recipient_name' => 'Ana',
                    'sender_name' => 'João',
                ])
                ->assertRedirect()
                ->assertSessionHasNoErrors();
        } finally {
            Carbon::setTestNow();
        }

        $gift->refresh();

        $this->assertSame('Novo presente', $gift->title);
        $this->assertSame('Ana', $gift->recipient_name);
        $this->assertSame('João', $gift->sender_name);
        $this->assertTrue($gift->last_edited_at?->equalTo($editedAt));
    }

    public function test_gift_metadata_autosave_can_return_json(): void
    {
        $user = User::factory()->create();
        $gift = Gift::factory()->create(['user_id' => $user->id]);

        $this
            ->actingAs($user)
            ->patchJson(route('app.gifts.update', $gift), [
                'title' => 'Presente autosalvo',
                'recipient_name' => 'Ana',
                'sender_name' => 'João',
            ])
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.gift.id', $gift->id)
            ->assertJsonPath('data.gift.title', 'Presente autosalvo')
            ->assertJsonPath('data.gift.recipient_name', 'Ana')
            ->assertJsonPath('data.gift.sender_name', 'João');
    }

    public function test_user_cannot_autosave_another_users_gift_metadata(): void
    {
        $owner = User::factory()->create();
        $otherUser = User::factory()->create();
        $gift = Gift::factory()->create([
            'title' => 'Título original',
            'user_id' => $owner->id,
        ]);

        $this
            ->actingAs($otherUser)
            ->patchJson(route('app.gifts.update', $gift), [
                'title' => 'Título indevido',
            ])
            ->assertForbidden();

        $this->assertSame('Título original', $gift->refresh()->title);
    }

    public function test_published_gift_metadata_autosave_is_rejected(): void
    {
        $user = User::factory()->create();
        $gift = Gift::factory()->published()->create([
            'title' => 'Publicado',
            'user_id' => $user->id,
        ]);

        $this
            ->actingAs($user)
            ->patchJson(route('app.gifts.update', $gift), [
                'title' => 'Não deveria salvar',
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('gift');

        $this->assertSame('Publicado', $gift->refresh()->title);
    }

    public function test_user_cannot_update_forbidden_gift_fields_from_editor(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $originalPlan = Plan::factory()->create();
        $newPlan = Plan::factory()->create();
        $gift = Gift::factory()->create([
            'user_id' => $user->id,
            'plan_id' => $originalPlan->id,
            'public_code' => null,
            'settings' => ['schemaVersion' => 1],
        ]);

        $this
            ->actingAs($user)
            ->patch(route('app.gifts.update', $gift), [
                'title' => 'Título permitido',
                'status' => GiftStatus::Published->value,
                'user_id' => $otherUser->id,
                'plan_id' => $newPlan->id,
                'public_code' => 'codigo-publico',
                'settings' => ['schemaVersion' => 999],
            ])
            ->assertRedirect()
            ->assertSessionHasNoErrors();

        $gift->refresh();

        $this->assertSame('Título permitido', $gift->title);
        $this->assertSame($user->id, $gift->user_id);
        $this->assertSame($originalPlan->id, $gift->plan_id);
        $this->assertSame(GiftStatus::Draft, $gift->status);
        $this->assertNull($gift->public_code);
        $this->assertSame(['schemaVersion' => 1], $gift->settings);
    }

    public function test_user_can_update_own_draft_page_canvas_without_external_urls(): void
    {
        $user = User::factory()->create();
        $gift = Gift::factory()->create([
            'user_id' => $user->id,
            'last_edited_at' => Carbon::parse('2026-05-16 12:00:00'),
        ]);
        $page = GiftPage::factory()->create([
            'gift_id' => $gift->id,
            'source_template_page_id' => null,
            'sort_order' => 10,
        ]);
        $editedAt = Carbon::parse('2026-05-17 12:00:00');

        Carbon::setTestNow($editedAt);

        try {
            $this
                ->actingAs($user)
                ->patch(route('app.gifts.pages.update', [$gift, $page]), [
                    'canvas' => [
                        'schemaVersion' => 1,
                        'artboard' => ['width' => 390, 'height' => 844],
                        'elements' => [
                            [
                                'id' => 'main_text',
                                'type' => 'text',
                                'text' => 'Novo texto',
                                'x' => 32,
                                'y' => 96,
                                'w' => 326,
                                'h' => 120,
                                'rotation' => 0,
                                'z' => 10,
                            ],
                        ],
                    ],
                ])
                ->assertRedirect()
                ->assertSessionHasNoErrors();
        } finally {
            Carbon::setTestNow();
        }

        $this->assertSame('Novo texto', $page->refresh()->canvas['elements'][0]['text']);
        $this->assertTrue($gift->refresh()->last_edited_at?->equalTo($editedAt));
    }

    public function test_page_canvas_autosave_can_return_json(): void
    {
        $user = User::factory()->create();
        $gift = Gift::factory()->create(['user_id' => $user->id]);
        $page = GiftPage::factory()->create([
            'gift_id' => $gift->id,
            'source_template_page_id' => null,
        ]);

        $this
            ->actingAs($user)
            ->patchJson(route('app.gifts.pages.update', [$gift, $page]), [
                'canvas' => [
                    'schemaVersion' => 1,
                    'artboard' => ['width' => 390, 'height' => 844],
                    'elements' => [
                        [
                            'id' => 'main_text',
                            'type' => 'text',
                            'text' => 'Texto autosalvo',
                            'x' => 32,
                            'y' => 96,
                            'w' => 326,
                            'h' => 120,
                            'rotation' => 0,
                            'z' => 10,
                        ],
                    ],
                ],
            ])
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.page.id', $page->id)
            ->assertJsonPath('data.page.canvas.elements.0.text', 'Texto autosalvo')
            ->assertJsonPath('data.gift.id', $gift->id);
    }

    public function test_page_canvas_accepts_visual_transform_properties(): void
    {
        $user = User::factory()->create();
        $gift = Gift::factory()->create(['user_id' => $user->id]);
        $page = GiftPage::factory()->create([
            'gift_id' => $gift->id,
            'source_template_page_id' => null,
        ]);

        $this
            ->actingAs($user)
            ->patchJson(route('app.gifts.pages.update', [$gift, $page]), [
                'canvas' => [
                    'schemaVersion' => 1,
                    'version' => 1,
                    'artboard' => ['width' => 1080, 'height' => 1350, 'unit' => 'px'],
                    'elements' => [
                        [
                            'id' => 'main_text',
                            'type' => 'text',
                            'text' => 'Texto com transform',
                            'x' => 120,
                            'y' => 160,
                            'w' => 420,
                            'h' => 140,
                            'rotation' => -12,
                            'z' => 30,
                            'style' => [
                                'fontSize' => 64,
                                'color' => '#7A2634',
                                'align' => 'center',
                            ],
                        ],
                        [
                            'id' => 'sticker_heart',
                            'type' => 'sticker',
                            'label' => 'amor',
                            'x' => 740,
                            'y' => 220,
                            'w' => 128,
                            'h' => 128,
                            'rotation' => 18,
                            'zIndex' => 10,
                        ],
                    ],
                ],
            ])
            ->assertOk()
            ->assertJsonPath('data.page.canvas.elements.0.w', 420)
            ->assertJsonPath('data.page.canvas.elements.0.h', 140)
            ->assertJsonPath('data.page.canvas.elements.0.rotation', -12)
            ->assertJsonPath('data.page.canvas.elements.0.style.fontSize', 64)
            ->assertJsonMissingPath('data.page.canvas.elements.1.zIndex');

        $elements = $page->refresh()->canvas['elements'];

        $this->assertSame([20, 10], array_column($elements, 'z'));
        $this->assertSame('center', $elements[0]['style']['align']);
    }

    public function test_page_canvas_accepts_editable_sticker_text(): void
    {
        $user = User::factory()->create();
        $gift = Gift::factory()->create(['user_id' => $user->id]);
        $page = GiftPage::factory()->create([
            'gift_id' => $gift->id,
            'source_template_page_id' => null,
        ]);

        $this
            ->actingAs($user)
            ->patchJson(route('app.gifts.pages.update', [$gift, $page]), [
                'canvas' => [
                    'schemaVersion' => 1,
                    'version' => 1,
                    'artboard' => ['width' => 1080, 'height' => 1350, 'unit' => 'px'],
                    'elements' => [
                        [
                            'id' => 'sticker_congrats',
                            'type' => 'sticker',
                            'label' => 'parabéns',
                            'text' => 'parabéns editado',
                            'editableText' => true,
                            'x' => 100,
                            'y' => 120,
                            'w' => 360,
                            'h' => 112,
                            'rotation' => -4,
                            'z' => 20,
                        ],
                        [
                            'id' => 'sticker_shape',
                            'type' => 'sticker',
                            'x' => 520,
                            'y' => 180,
                            'w' => 120,
                            'h' => 120,
                            'rotation' => 0,
                            'z' => 10,
                        ],
                    ],
                ],
            ])
            ->assertOk()
            ->assertJsonPath('data.page.canvas.elements.0.text', 'parabéns editado')
            ->assertJsonPath('data.page.canvas.elements.0.editableText', true)
            ->assertJsonMissingPath('data.page.canvas.elements.1.text');

        $elements = $page->refresh()->canvas['elements'];

        $this->assertSame('parabéns editado', $elements[0]['text']);
        $this->assertArrayNotHasKey('text', $elements[1]);
    }

    public function test_page_canvas_rejects_invalid_transform_numbers(): void
    {
        $user = User::factory()->create();
        $gift = Gift::factory()->create(['user_id' => $user->id]);
        $page = GiftPage::factory()->create([
            'gift_id' => $gift->id,
            'source_template_page_id' => null,
        ]);

        $this
            ->actingAs($user)
            ->patchJson(route('app.gifts.pages.update', [$gift, $page]), [
                'canvas' => [
                    'schemaVersion' => 1,
                    'artboard' => ['width' => 1080, 'height' => 1350],
                    'elements' => [
                        [
                            'id' => 'bad_text',
                            'type' => 'text',
                            'text' => 'Texto',
                            'x' => 'abc',
                            'y' => 100,
                            'w' => 320,
                            'h' => 120,
                            'rotation' => 0,
                            'z' => 10,
                        ],
                    ],
                ],
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('canvas.elements.0.x');
    }

    public function test_page_canvas_rejects_element_without_type(): void
    {
        $user = User::factory()->create();
        $gift = Gift::factory()->create(['user_id' => $user->id]);
        $page = GiftPage::factory()->create([
            'gift_id' => $gift->id,
            'source_template_page_id' => null,
        ]);

        $this
            ->actingAs($user)
            ->patchJson(route('app.gifts.pages.update', [$gift, $page]), [
                'canvas' => [
                    'schemaVersion' => 1,
                    'artboard' => ['width' => 1080, 'height' => 1350],
                    'elements' => [
                        [
                            'id' => 'missing_type',
                            'x' => 100,
                            'y' => 100,
                            'w' => 320,
                            'h' => 120,
                            'rotation' => 0,
                            'z' => 10,
                        ],
                    ],
                ],
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('canvas.elements.0.type');
    }

    public function test_page_canvas_rejects_non_finite_and_extreme_transform_values(): void
    {
        $user = User::factory()->create();
        $gift = Gift::factory()->create(['user_id' => $user->id]);
        $page = GiftPage::factory()->create([
            'gift_id' => $gift->id,
            'source_template_page_id' => null,
        ]);

        $this
            ->actingAs($user)
            ->patchJson(route('app.gifts.pages.update', [$gift, $page]), [
                'canvas' => [
                    'schemaVersion' => 1,
                    'artboard' => ['width' => 1080, 'height' => 1350],
                    'elements' => [
                        [
                            'id' => 'bad_text',
                            'type' => 'text',
                            'text' => 'Texto',
                            'x' => '1e999',
                            'y' => 100,
                            'w' => 320,
                            'h' => 120,
                            'rotation' => 0,
                            'z' => 10,
                        ],
                    ],
                ],
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('canvas.elements.0.x');

        $this
            ->actingAs($user)
            ->patchJson(route('app.gifts.pages.update', [$gift, $page]), [
                'canvas' => [
                    'schemaVersion' => 1,
                    'artboard' => ['width' => 1080, 'height' => 1350],
                    'elements' => [
                        [
                            'id' => 'huge_text',
                            'type' => 'text',
                            'text' => 'Texto',
                            'x' => 1000000,
                            'y' => 100,
                            'w' => 320,
                            'h' => 120,
                            'rotation' => 0,
                            'z' => 10,
                        ],
                    ],
                ],
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('canvas.elements.0.x');
    }

    public function test_published_gift_page_autosave_is_forbidden(): void
    {
        $user = User::factory()->create();
        $gift = Gift::factory()->published()->create(['user_id' => $user->id]);
        $page = GiftPage::factory()->create([
            'gift_id' => $gift->id,
            'source_template_page_id' => null,
        ]);

        $this
            ->actingAs($user)
            ->patchJson(route('app.gifts.pages.update', [$gift, $page]), [
                'canvas' => [
                    'schemaVersion' => 1,
                    'artboard' => ['width' => 390, 'height' => 844],
                    'elements' => [],
                ],
            ])
            ->assertForbidden();
    }

    public function test_user_cannot_update_page_from_another_gift(): void
    {
        $user = User::factory()->create();
        $gift = Gift::factory()->create(['user_id' => $user->id]);
        $otherGift = Gift::factory()->create(['user_id' => $user->id]);
        $page = GiftPage::factory()->create([
            'gift_id' => $otherGift->id,
            'source_template_page_id' => null,
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
            ->assertForbidden();
    }

    public function test_user_cannot_update_page_from_another_user(): void
    {
        $owner = User::factory()->create();
        $otherUser = User::factory()->create();
        $gift = Gift::factory()->create(['user_id' => $owner->id]);
        $page = GiftPage::factory()->create([
            'gift_id' => $gift->id,
            'source_template_page_id' => null,
        ]);

        $this
            ->actingAs($otherUser)
            ->patch(route('app.gifts.pages.update', [$gift, $page]), [
                'canvas' => [
                    'schemaVersion' => 1,
                    'artboard' => ['width' => 390, 'height' => 844],
                    'elements' => [],
                ],
            ])
            ->assertForbidden();
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

    public function test_page_canvas_rejects_html_in_text_or_content(): void
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
                        ['id' => 'main', 'type' => 'text', 'content' => '<script>alert(1)</script>'],
                    ],
                ],
            ])
            ->assertRedirect(route('app.gifts.edit', $gift))
            ->assertSessionHasErrors('canvas');
    }

    public function test_page_canvas_rejects_html_in_editable_sticker_text(): void
    {
        $user = User::factory()->create();
        $gift = Gift::factory()->create(['user_id' => $user->id]);
        $page = GiftPage::factory()->create([
            'gift_id' => $gift->id,
            'source_template_page_id' => null,
        ]);

        $this
            ->actingAs($user)
            ->patchJson(route('app.gifts.pages.update', [$gift, $page]), [
                'canvas' => [
                    'schemaVersion' => 1,
                    'artboard' => ['width' => 1080, 'height' => 1350],
                    'elements' => [
                        [
                            'id' => 'sticker_congrats',
                            'type' => 'sticker',
                            'text' => '<script>alert(1)</script>',
                            'editableText' => true,
                            'x' => 100,
                            'y' => 120,
                            'w' => 360,
                            'h' => 112,
                            'rotation' => 0,
                            'z' => 10,
                        ],
                    ],
                ],
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('canvas');
    }

    public function test_page_canvas_rejects_insecure_protocols(): void
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
                        ['id' => 'main', 'type' => 'text', 'text' => 'javascript:alert(1)'],
                    ],
                ],
            ])
            ->assertRedirect(route('app.gifts.edit', $gift))
            ->assertSessionHasErrors('canvas');
    }

    public function test_locked_page_cannot_be_edited(): void
    {
        $user = User::factory()->create();
        $gift = Gift::factory()->create(['user_id' => $user->id]);
        $page = GiftPage::factory()->create([
            'gift_id' => $gift->id,
            'source_template_page_id' => null,
            'locked' => true,
        ]);

        $this
            ->actingAs($user)
            ->from(route('app.gifts.edit', $gift))
            ->patch(route('app.gifts.pages.update', [$gift, $page]), [
                'canvas' => [
                    'schemaVersion' => 1,
                    'artboard' => ['width' => 390, 'height' => 844],
                    'elements' => [],
                ],
            ])
            ->assertRedirect(route('app.gifts.edit', $gift))
            ->assertSessionHasErrors('page');
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
