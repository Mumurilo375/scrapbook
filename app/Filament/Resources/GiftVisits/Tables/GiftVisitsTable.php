<?php

namespace App\Filament\Resources\GiftVisits\Tables;

use App\Filament\Support\AdminResourceRegistry;
use Filament\Tables\Table;

class GiftVisitsTable
{
    public static function configure(Table $table): Table
    {
        return AdminResourceRegistry::table(static::class, $table);
    }
}
