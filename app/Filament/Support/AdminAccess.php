<?php

namespace App\Filament\Support;

use App\Models\User;
use Filament\Facades\Filament;

class AdminAccess
{
    public static function user(): ?User
    {
        $user = Filament::auth()->user();

        return $user instanceof User ? $user : null;
    }

    public static function isAdmin(): bool
    {
        return self::user()?->hasRole('admin') ?? false;
    }

    public static function isStaff(): bool
    {
        return self::user()?->hasAnyRole(['admin', 'support']) ?? false;
    }
}
