<?php

namespace App\Filament\Resources\GiftVisits\Pages;

use App\Filament\Resources\GiftVisits\GiftVisitResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListGiftVisits extends ListRecords
{
    protected static string $resource = GiftVisitResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
