<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class InitialAccessSeeder extends Seeder
{
    /**
     * Seed roles, permissions and the local admin user.
     */
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $adminRole = Role::findOrCreate('admin', 'web');
        $supportRole = Role::findOrCreate('support', 'web');
        Role::findOrCreate('customer', 'web');

        $viewHorizon = Permission::findOrCreate('view horizon', 'web');

        $adminRole->givePermissionTo($viewHorizon);
        $supportRole->givePermissionTo($viewHorizon);

        if (! app()->environment('local')) {
            return;
        }

        $admin = User::query()->updateOrCreate(
            ['email' => config('scrapbook.admin.email') ?: 'admin@scrapbook.local'],
            [
                'name' => config('scrapbook.admin.name') ?: 'Scrapbook Admin',
                'email_verified_at' => now(),
                'password' => Hash::make(config('scrapbook.admin.password') ?: 'password'),
            ],
        );

        $admin->syncRoles([$adminRole]);
    }
}
