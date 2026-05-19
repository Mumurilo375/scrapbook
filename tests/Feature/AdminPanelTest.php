<?php

namespace Tests\Feature;

use App\Filament\Pages\VisualQa;
use App\Filament\Resources\Gifts\GiftResource;
use App\Filament\Resources\Occasions\OccasionResource;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class AdminPanelTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_cannot_access_admin_panel(): void
    {
        $customer = $this->userWithRole('customer');

        $this
            ->actingAs($customer)
            ->get('/admin')
            ->assertForbidden();
    }

    public function test_admin_can_open_product_resource(): void
    {
        $admin = $this->userWithRole('admin');

        $this
            ->actingAs($admin)
            ->get(OccasionResource::getUrl())
            ->assertOk();
    }

    public function test_support_can_open_operational_resource_but_not_product_resource(): void
    {
        $support = $this->userWithRole('support');

        $this
            ->actingAs($support)
            ->get(GiftResource::getUrl())
            ->assertOk();

        $this
            ->actingAs($support)
            ->get(OccasionResource::getUrl())
            ->assertForbidden();
    }

    public function test_staff_can_open_visual_qa_checklist(): void
    {
        $admin = $this->userWithRole('admin');
        $support = $this->userWithRole('support');

        $this
            ->actingAs($admin)
            ->get(VisualQa::getUrl())
            ->assertOk()
            ->assertSee('QA visual/mobile com assets reais')
            ->assertSee('Auditoria automatica');

        $this
            ->actingAs($support)
            ->get(VisualQa::getUrl())
            ->assertOk()
            ->assertSee('QA visual/mobile com assets reais');
    }

    public function test_customer_cannot_open_visual_qa_checklist(): void
    {
        $customer = $this->userWithRole('customer');

        $this
            ->actingAs($customer)
            ->get(VisualQa::getUrl())
            ->assertForbidden();
    }

    private function userWithRole(string $roleName): User
    {
        $role = Role::findOrCreate($roleName, 'web');

        $user = User::factory()->create();
        $user->assignRole($role);

        return $user;
    }
}
