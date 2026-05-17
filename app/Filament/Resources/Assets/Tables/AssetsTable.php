<?php

namespace App\Filament\Resources\Assets\Tables;

use App\Filament\Support\AdminResourceRegistry;
use Filament\Tables\Table;

class AssetsTable
{
    public static function configure(Table $table): Table
    {
        return AdminResourceRegistry::table(static::class, $table);
    }
}
