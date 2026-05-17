<?php

namespace App\Filament\Resources\GiftPages\Pages;

use App\Filament\Resources\GiftPages\GiftPageResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListGiftPages extends ListRecords
{
    protected static string $resource = GiftPageResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
