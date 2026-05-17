<?php

namespace App\Filament\Resources\TemplateVersions\Pages;

use App\Filament\Resources\TemplateVersions\TemplateVersionResource;
use Filament\Actions\EditAction;
use Filament\Resources\Pages\ViewRecord;

class ViewTemplateVersion extends ViewRecord
{
    protected static string $resource = TemplateVersionResource::class;

    protected function getHeaderActions(): array
    {
        return [
            EditAction::make(),
        ];
    }
}
