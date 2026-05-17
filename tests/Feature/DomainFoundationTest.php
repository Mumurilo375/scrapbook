<?php

namespace Tests\Feature;

use App\Domain\Gifts\Actions\CreateGiftFromTemplate;
use App\Domain\Gifts\Actions\UpdateGiftPageCanvas;
use App\Domain\Gifts\Models\Gift;
use App\Domain\Gifts\Models\GiftPage;
use App\Domain\Media\Models\MediaItem;
use App\Domain\Payments\Models\Order;
use App\Domain\Payments\Models\Payment;
use App\Domain\Payments\Models\Plan;
use App\Domain\Templates\Enums\PageType;
use App\Domain\Templates\Models\TemplatePage;
use App\Domain\Templates\Models\TemplateVersion;
use App\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class DomainFoundationTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_cannot_edit_another_users_gift(): void
    {
        $owner = User::factory()->create();
        $otherUser = User::factory()->create();
        $gift = Gift::factory()->create(['user_id' => $owner->id]);

        $this->assertFalse(Gate::forUser($otherUser)->allows('update', $gift));
    }

    public function test_user_can_edit_own_draft_gift(): void
    {
        $user = User::factory()->create();
        $gift = Gift::factory()->create(['user_id' => $user->id]);

        $this->assertTrue(Gate::forUser($user)->allows('update', $gift));
    }

    public function test_gift_created_from_template_copies_template_version_id(): void
    {
        $user = User::factory()->create();
        $templateVersion = $this->publishedTemplateVersionWithPages();

        $gift = app(CreateGiftFromTemplate::class)->handle($user, $templateVersion);

        $this->assertTrue($templateVersion->is($gift->templateVersion));
        $this->assertCount(2, $gift->pages);
    }

    public function test_gift_created_from_template_copies_theme_version_id(): void
    {
        $user = User::factory()->create();
        $templateVersion = $this->publishedTemplateVersionWithPages();

        $gift = app(CreateGiftFromTemplate::class)->handle($user, $templateVersion);

        $this->assertSame($templateVersion->theme_version_id, $gift->theme_version_id);
    }

    public function test_only_published_template_version_can_create_public_gift_flow(): void
    {
        $user = User::factory()->create();
        $templateVersion = $this->publishedTemplateVersionWithPages();

        $gift = app(CreateGiftFromTemplate::class)->handle($user, $templateVersion);

        $this->assertNotNull($gift->id);
    }

    public function test_draft_template_version_cannot_be_used_for_public_creation(): void
    {
        $user = User::factory()->create();
        $templateVersion = TemplateVersion::factory()->create();

        $this->expectException(ValidationException::class);

        app(CreateGiftFromTemplate::class)->handle($user, $templateVersion);
    }

    public function test_user_cannot_associate_media_item_from_another_user(): void
    {
        $owner = User::factory()->create();
        $otherUser = User::factory()->create();
        $gift = Gift::factory()->create(['user_id' => $owner->id]);
        $page = GiftPage::factory()->create([
            'gift_id' => $gift->id,
            'source_template_page_id' => null,
        ]);
        $mediaItem = MediaItem::factory()->processed()->create([
            'user_id' => $otherUser->id,
            'gift_id' => null,
        ]);

        $this->expectException(AuthorizationException::class);

        app(UpdateGiftPageCanvas::class)->handle($owner, $page, [
            'schemaVersion' => 1,
            'elements' => [
                ['id' => 'photo_1', 'type' => 'image', 'mediaItemId' => $mediaItem->id],
            ],
        ]);
    }

    public function test_public_published_gift_can_be_resolved_by_public_code(): void
    {
        $gift = Gift::factory()->published()->create();

        $resolved = Gift::query()
            ->publiclyAccessible()
            ->where('public_code', $gift->public_code)
            ->first();

        $this->assertTrue($gift->is($resolved));
    }

    public function test_disabled_or_expired_gift_cannot_be_resolved_publicly(): void
    {
        $disabledGift = Gift::factory()->disabled()->create();
        $expiredGift = Gift::factory()->expired()->create();

        $this->assertNull(Gift::query()->publiclyAccessible()->where('public_code', $disabledGift->public_code)->first());
        $this->assertNull(Gift::query()->publiclyAccessible()->where('public_code', $expiredGift->public_code)->first());
    }

    public function test_plan_uses_integer_price_cents(): void
    {
        $plan = Plan::factory()->create(['price_cents' => 499]);

        $this->assertIsInt($plan->price_cents);
        $this->assertSame(499, $plan->price_cents);
    }

    public function test_order_belongs_to_user_gift_and_plan(): void
    {
        $user = User::factory()->create();
        $gift = Gift::factory()->create(['user_id' => $user->id]);
        $plan = Plan::factory()->create();
        $order = Order::factory()->create([
            'user_id' => $user->id,
            'gift_id' => $gift->id,
            'plan_id' => $plan->id,
        ]);

        $this->assertTrue($user->is($order->user));
        $this->assertTrue($gift->is($order->gift));
        $this->assertTrue($plan->is($order->plan));
    }

    public function test_payment_belongs_to_order(): void
    {
        $order = Order::factory()->create();
        $payment = Payment::factory()->create(['order_id' => $order->id]);

        $this->assertTrue($order->is($payment->order));
    }

    public function test_seeders_create_minimum_domain_data(): void
    {
        $this->seed();

        $this->assertDatabaseHas('roles', ['name' => 'admin']);
        $this->assertDatabaseHas('occasions', ['slug' => 'amor-namoro']);
        $this->assertDatabaseHas('plans', ['slug' => 'presente-digital', 'price_cents' => 499]);
        $this->assertDatabaseHas('themes', ['slug' => 'kraft-scrapbook-vintage']);
        $this->assertDatabaseHas('templates', ['slug' => 'cartinha-de-amor-vintage']);
        $this->assertDatabaseCount('template_pages', 5);
    }

    private function publishedTemplateVersionWithPages(): TemplateVersion
    {
        $templateVersion = TemplateVersion::factory()->published()->create();

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

        return $templateVersion->refresh();
    }
}
