<?php

namespace App\Filament\Resources\ThemeVersions\Tables;

use App\Filament\Support\AdminResourceRegistry;
use Filament\Tables\Table;

class ThemeVersionsTable
{
    public static function configure(Table $table): Table
    {
        return AdminResourceRegistry::table(static::class, $table);
    }
}
