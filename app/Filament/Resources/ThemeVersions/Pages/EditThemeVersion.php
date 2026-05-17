<?php

namespace App\Filament\Resources\ThemeVersions\Pages;

use App\Filament\Resources\ThemeVersions\ThemeVersionResource;
use Filament\Actions\DeleteAction;
use Filament\Actions\ViewAction;
use Filament\Resources\Pages\EditRecord;

class EditThemeVersion extends EditRecord
{
    protected static string $resource = ThemeVersionResource::class;

    protected function getHeaderActions(): array
    {
        return [
            ViewAction::make(),
            DeleteAction::make(),
        ];
    }
}
