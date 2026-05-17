<?php

namespace App\Filament\Resources\GiftEvents\Pages;

use App\Filament\Resources\GiftEvents\GiftEventResource;
use Filament\Actions\EditAction;
use Filament\Resources\Pages\ViewRecord;

class ViewGiftEvent extends ViewRecord
{
    protected static string $resource = GiftEventResource::class;

    protected function getHeaderActions(): array
    {
        return [
            EditAction::make(),
        ];
    }
}
