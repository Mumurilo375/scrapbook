<?php

namespace App\Filament\Resources\Gifts\Tables;

use App\Filament\Support\AdminResourceRegistry;
use Filament\Tables\Table;

class GiftsTable
{
    public static function configure(Table $table): Table
    {
        return AdminResourceRegistry::table(static::class, $table);
    }
}
