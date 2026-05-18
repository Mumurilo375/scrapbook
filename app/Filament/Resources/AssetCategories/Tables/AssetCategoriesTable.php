<?php

namespace App\Filament\Resources\AssetCategories\Tables;

use App\Filament\Support\AdminResourceRegistry;
use Filament\Tables\Table;

class AssetCategoriesTable
{
    public static function configure(Table $table): Table
    {
        return AdminResourceRegistry::table(static::class, $table);
    }
}
