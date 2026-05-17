<?php

namespace App\Filament\Resources\Occasions\Pages;

use App\Filament\Resources\Occasions\OccasionResource;
use Filament\Actions\EditAction;
use Filament\Resources\Pages\ViewRecord;

class ViewOccasion extends ViewRecord
{
    protected static string $resource = OccasionResource::class;

    protected function getHeaderActions(): array
    {
        return [
            EditAction::make(),
        ];
    }
}
