<?php

namespace App\Filament\Resources\Gifts\RelationManagers;

use App\Filament\Resources\MediaItems\MediaItemResource;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables\Table;

class MediaItemsRelationManager extends RelationManager
{
    protected static string $relationship = 'mediaItems';

    protected static ?string $relatedResource = MediaItemResource::class;

    public function table(Table $table): Table
    {
        return $table
            ->headerActions([]);
    }
}
