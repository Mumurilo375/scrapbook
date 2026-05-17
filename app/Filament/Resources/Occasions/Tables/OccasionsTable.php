<?php

namespace App\Filament\Resources\Occasions\Tables;

use App\Filament\Support\AdminResourceRegistry;
use Filament\Tables\Table;

class OccasionsTable
{
    public static function configure(Table $table): Table
    {
        return AdminResourceRegistry::table(static::class, $table);
    }
}
