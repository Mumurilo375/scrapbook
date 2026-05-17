<?php

namespace App\Domain\Gifts\Actions;

use App\Domain\Gifts\Models\Gift;
use App\Domain\Themes\Enums\ThemeVersionStatus;
use App\Domain\Themes\Models\ThemeVersion;
use App\Models\User;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;

final class ChangeGiftTheme
{
    public function handle(User $user, Gift $gift, ThemeVersion $themeVersion): Gift
    {
        Gate::forUser($user)->authorize('update', $gift);

        $status = $themeVersion->getAttribute('status');
        $status = $status instanceof ThemeVersionStatus ? $status : ThemeVersionStatus::from((string) $status);

        if ($status !== ThemeVersionStatus::Published) {
            throw ValidationException::withMessages([
                'theme_version_id' => 'Only published theme versions can be applied to gifts.',
            ]);
        }

        $gift->forceFill([
            'theme_version_id' => $themeVersion->id,
            'last_edited_at' => now(),
        ])->save();

        return $gift->refresh();
    }
}
