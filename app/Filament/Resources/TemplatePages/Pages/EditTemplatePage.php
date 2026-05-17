<?php

namespace App\Filament\Resources\TemplatePages\Pages;

use App\Filament\Resources\TemplatePages\TemplatePageResource;
use Filament\Actions\DeleteAction;
use Filament\Actions\ViewAction;
use Filament\Resources\Pages\EditRecord;

class EditTemplatePage extends EditRecord
{
    protected static string $resource = TemplatePageResource::class;

    protected function getHeaderActions(): array
    {
        return [
            ViewAction::make(),
            DeleteAction::make(),
        ];
    }
}
