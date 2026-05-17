<?php

namespace App\Filament\Resources\GiftPages\Pages;

use App\Filament\Resources\GiftPages\GiftPageResource;
use Filament\Actions\DeleteAction;
use Filament\Actions\ViewAction;
use Filament\Resources\Pages\EditRecord;

class EditGiftPage extends EditRecord
{
    protected static string $resource = GiftPageResource::class;

    protected function getHeaderActions(): array
    {
        return [
            ViewAction::make(),
            DeleteAction::make(),
        ];
    }
}
