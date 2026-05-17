<?php

namespace App\Filament\Resources\TemplateVersions\Pages;

use App\Filament\Resources\TemplateVersions\TemplateVersionResource;
use Filament\Actions\DeleteAction;
use Filament\Actions\ViewAction;
use Filament\Resources\Pages\EditRecord;

class EditTemplateVersion extends EditRecord
{
    protected static string $resource = TemplateVersionResource::class;

    protected function getHeaderActions(): array
    {
        return [
            ViewAction::make(),
            DeleteAction::make(),
        ];
    }
}
