<?php

namespace App\Filament\Resources\GiftPages\Pages;

use App\Filament\Resources\GiftPages\GiftPageResource;
use Filament\Actions\EditAction;
use Filament\Resources\Pages\ViewRecord;

class ViewGiftPage extends ViewRecord
{
    protected static string $resource = GiftPageResource::class;

    protected function getHeaderActions(): array
    {
        return [
            EditAction::make(),
        ];
    }
}
