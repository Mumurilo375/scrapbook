<?php

namespace App\Filament\Resources\Gifts\RelationManagers;

use App\Filament\Resources\GiftVisits\GiftVisitResource;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables\Table;

class VisitsRelationManager extends RelationManager
{
    protected static string $relationship = 'visits';

    protected static ?string $relatedResource = GiftVisitResource::class;

    public function table(Table $table): Table
    {
        return $table
            ->headerActions([]);
    }
}
