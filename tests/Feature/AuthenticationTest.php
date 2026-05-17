<?php

namespace Tests\Feature;

use App\Domain\Templates\Models\Occasion;
use App\Domain\Templates\Models\Template;
use App\Domain\Templates\Models\TemplatePage;
use App\Domain\Templates\Models\TemplateVersion;
use App\Domain\Themes\Models\ThemeVersion;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_visitor_can_access_login_page(): void
    {
        $this
            ->get('/login')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('auth/Login', false)
                ->where('returnTo', null));
    }

    public function test_visitor_can_access_register_page(): void
    {
        $this
            ->get('/cadastro')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('auth/Register', false)
                ->where('returnTo', null));
    }

    public function test_user_can_register_and_receives_customer_role(): void
    {
        $this
            ->post('/cadastro', [
                'name' => 'Ana Cliente',
                'email' => 'ana@example.com',
                'password' => 'password-segura',
                'password_confirmation' => 'password-segura',
            ])
            ->assertRedirect(route('app.gifts.index'));

        $user = User::query()->where('email', 'ana@example.com')->firstOrFail();

        $this->assertAuthenticatedAs($user);
        $this->assertTrue(Hash::check('password-segura', $user->password));
        $this->assertTrue($user->hasRole('customer'));
        $this->assertFalse($user->hasAnyRole(['admin', 'support']));
    }

    public function test_user_can_login(): void
    {
        $user = User::factory()->create([
            'email' => 'cliente@example.com',
            'password' => Hash::make('password-segura'),
        ]);

        $this
            ->post('/login', [
                'email' => 'cliente@example.com',
                'password' => 'password-segura',
            ])
            ->assertRedirect(route('app.gifts.index'));

        $this->assertAuthenticatedAs($user);
    }

    public function test_user_can_logout(): void
    {
        $user = User::factory()->create();

        $this
            ->actingAs($user)
            ->post('/logout')
            ->assertRedirect(route('home'));

        $this->assertGuest();
    }

    public function test_guest_cannot_access_gift_dashboard(): void
    {
        $this
            ->get('/app/gifts')
            ->assertRedirect(route('login'));
    }

    public function test_authenticated_user_can_access_gift_dashboard(): void
    {
        $this
            ->actingAs(User::factory()->create())
            ->get('/app/gifts')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('gifts/Dashboard/GiftIndex', false));
    }

    public function test_guest_cannot_create_gift_and_keeps_template_context_for_login(): void
    {
        [$occasion, $template, $templateVersion] = $this->publishedTemplateWithPage();
        $returnTo = route('create.template.show', [$occasion->slug, $template->slug], false);

        $this
            ->post('/gifts', [
                'template_version_id' => $templateVersion->id,
            ])
            ->assertRedirect(route('login', ['return_to' => $returnTo]))
            ->assertSessionHas('gift.create.return_to', $returnTo);

        $this->assertDatabaseCount('gifts', 0);
    }

    public function test_login_after_creation_interruption_returns_to_selected_template(): void
    {
        [$occasion, $template, $templateVersion] = $this->publishedTemplateWithPage();
        $returnTo = route('create.template.show', [$occasion->slug, $template->slug], false);
        $user = User::factory()->create([
            'email' => 'voltar@example.com',
            'password' => Hash::make('password-segura'),
        ]);

        $this->post('/gifts', [
            'template_version_id' => $templateVersion->id,
        ]);

        $this
            ->post('/login', [
                'email' => 'voltar@example.com',
                'password' => 'password-segura',
                'return_to' => $returnTo,
            ])
            ->assertRedirect($returnTo);

        $this->assertAuthenticatedAs($user);
        $this->assertDatabaseCount('gifts', 0);
    }

    public function test_authenticated_user_is_redirected_away_from_guest_auth_pages(): void
    {
        $user = User::factory()->create();

        $this
            ->actingAs($user)
            ->get('/login')
            ->assertRedirect(route('app.gifts.index'));

        $this
            ->actingAs($user)
            ->get('/cadastro')
            ->assertRedirect(route('app.gifts.index'));
    }

    /**
     * @return array{Occasion, Template, TemplateVersion}
     */
    private function publishedTemplateWithPage(): array
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
        ]);

        TemplatePage::factory()->create([
            'template_version_id' => $templateVersion->id,
            'name' => 'Capa',
            'sort_order' => 10,
        ]);

        return [$occasion, $template, $templateVersion->refresh()];
    }
}
