<?php

namespace App\Policies;

use App\Domain\Templates\Models\Template;
use App\Models\User;

class TemplatePolicy
{
    public function view(?User $user, Template $template): bool
    {
        if ($template->is_active) {
            return true;
        }

        return $user !== null && $this->isStaff($user);
    }

    public function update(User $user, Template $template): bool
    {
        return $this->isStaff($user);
    }

    private function isStaff(User $user): bool
    {
        return $user->hasAnyRole(['admin', 'support']);
    }
}
