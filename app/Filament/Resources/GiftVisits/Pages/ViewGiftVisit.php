<?php

namespace App\Filament\Resources\GiftVisits\Pages;

use App\Filament\Resources\GiftVisits\GiftVisitResource;
use Filament\Actions\EditAction;
use Filament\Resources\Pages\ViewRecord;

class ViewGiftVisit extends ViewRecord
{
    protected static string $resource = GiftVisitResource::class;

    protected function getHeaderActions(): array
    {
        return [
            EditAction::make(),
        ];
    }
}
