<?php

namespace App\Filament\Resources\GiftEvents\Tables;

use App\Filament\Support\AdminResourceRegistry;
use Filament\Tables\Table;

class GiftEventsTable
{
    public static function configure(Table $table): Table
    {
        return AdminResourceRegistry::table(static::class, $table);
    }
}
