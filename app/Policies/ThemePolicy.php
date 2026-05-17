<?php

namespace App\Policies;

use App\Domain\Themes\Models\Theme;
use App\Models\User;

class ThemePolicy
{
    public function view(?User $user, Theme $theme): bool
    {
        if ($theme->is_active) {
            return true;
        }

        return $user !== null && $this->isStaff($user);
    }

    public function update(User $user, Theme $theme): bool
    {
        return $this->isStaff($user);
    }

    private function isStaff(User $user): bool
    {
        return $user->hasAnyRole(['admin', 'support']);
    }
}
