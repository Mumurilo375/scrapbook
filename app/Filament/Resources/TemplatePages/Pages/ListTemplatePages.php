<?php

namespace App\Filament\Resources\TemplatePages\Pages;

use App\Filament\Resources\TemplatePages\TemplatePageResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListTemplatePages extends ListRecords
{
    protected static string $resource = TemplatePageResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
