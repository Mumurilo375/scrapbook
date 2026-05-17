<?php

namespace App\Filament\Resources\ThemeVersions\Pages;

use App\Filament\Resources\ThemeVersions\ThemeVersionResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListThemeVersions extends ListRecords
{
    protected static string $resource = ThemeVersionResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
