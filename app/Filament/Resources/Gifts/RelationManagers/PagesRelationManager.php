<?php

namespace App\Filament\Resources\Gifts\RelationManagers;

use App\Filament\Resources\GiftPages\GiftPageResource;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables\Table;

class PagesRelationManager extends RelationManager
{
    protected static string $relationship = 'pages';

    protected static ?string $relatedResource = GiftPageResource::class;

    public function table(Table $table): Table
    {
        return $table->headerActions([]);
    }
}
