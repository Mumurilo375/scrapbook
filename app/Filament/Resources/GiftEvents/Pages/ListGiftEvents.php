<?php

namespace App\Filament\Resources\GiftEvents\Pages;

use App\Filament\Resources\GiftEvents\GiftEventResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListGiftEvents extends ListRecords
{
    protected static string $resource = GiftEventResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
