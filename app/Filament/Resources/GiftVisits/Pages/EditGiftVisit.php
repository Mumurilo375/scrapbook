<?php

namespace App\Filament\Resources\GiftVisits\Pages;

use App\Filament\Resources\GiftVisits\GiftVisitResource;
use Filament\Actions\DeleteAction;
use Filament\Actions\ViewAction;
use Filament\Resources\Pages\EditRecord;

class EditGiftVisit extends EditRecord
{
    protected static string $resource = GiftVisitResource::class;

    protected function getHeaderActions(): array
    {
        return [
            ViewAction::make(),
            DeleteAction::make(),
        ];
    }
}
