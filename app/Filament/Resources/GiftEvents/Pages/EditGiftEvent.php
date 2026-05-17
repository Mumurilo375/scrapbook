<?php

namespace App\Filament\Resources\GiftEvents\Pages;

use App\Filament\Resources\GiftEvents\GiftEventResource;
use Filament\Actions\DeleteAction;
use Filament\Actions\ViewAction;
use Filament\Resources\Pages\EditRecord;

class EditGiftEvent extends EditRecord
{
    protected static string $resource = GiftEventResource::class;

    protected function getHeaderActions(): array
    {
        return [
            ViewAction::make(),
            DeleteAction::make(),
        ];
    }
}
