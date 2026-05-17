<?php

namespace App\Filament\Resources\Gifts\RelationManagers;

use App\Filament\Resources\GiftEvents\GiftEventResource;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables\Table;

class EventsRelationManager extends RelationManager
{
    protected static string $relationship = 'events';

    protected static ?string $relatedResource = GiftEventResource::class;

    public function table(Table $table): Table
    {
        return $table
            ->headerActions([]);
    }
}
