<?php

namespace App\Filament\Resources\ThemeVersions\Pages;

use App\Filament\Resources\ThemeVersions\ThemeVersionResource;
use Filament\Actions\EditAction;
use Filament\Resources\Pages\ViewRecord;

class ViewThemeVersion extends ViewRecord
{
    protected static string $resource = ThemeVersionResource::class;

    protected function getHeaderActions(): array
    {
        return [
            EditAction::make(),
        ];
    }
}
