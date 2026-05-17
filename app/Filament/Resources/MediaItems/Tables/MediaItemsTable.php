<?php

namespace App\Filament\Resources\MediaItems\Tables;

use App\Filament\Support\AdminResourceRegistry;
use Filament\Tables\Table;

class MediaItemsTable
{
    public static function configure(Table $table): Table
    {
        return AdminResourceRegistry::table(static::class, $table);
    }
}
