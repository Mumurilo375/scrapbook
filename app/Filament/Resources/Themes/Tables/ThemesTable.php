<?php

namespace App\Filament\Resources\Themes\Tables;

use App\Filament\Support\AdminResourceRegistry;
use Filament\Tables\Table;

class ThemesTable
{
    public static function configure(Table $table): Table
    {
        return AdminResourceRegistry::table(static::class, $table);
    }
}
