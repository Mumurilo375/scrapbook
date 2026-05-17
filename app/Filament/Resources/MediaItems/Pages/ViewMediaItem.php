<?php

namespace App\Filament\Resources\MediaItems\Pages;

use App\Filament\Resources\MediaItems\MediaItemResource;
use Filament\Actions\EditAction;
use Filament\Resources\Pages\ViewRecord;

class ViewMediaItem extends ViewRecord
{
    protected static string $resource = MediaItemResource::class;

    protected function getHeaderActions(): array
    {
        return [
            EditAction::make(),
        ];
    }
}
