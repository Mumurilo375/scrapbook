<?php

namespace App\Filament\Resources\TemplatePages\Pages;

use App\Filament\Resources\TemplatePages\TemplatePageResource;
use Filament\Actions\EditAction;
use Filament\Resources\Pages\ViewRecord;

class ViewTemplatePage extends ViewRecord
{
    protected static string $resource = TemplatePageResource::class;

    protected function getHeaderActions(): array
    {
        return [
            EditAction::make(),
        ];
    }
}
