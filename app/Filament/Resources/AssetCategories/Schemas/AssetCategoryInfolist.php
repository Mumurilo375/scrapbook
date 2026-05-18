<?php

namespace App\Filament\Resources\AssetCategories\Schemas;

use App\Filament\Support\AdminResourceRegistry;
use Filament\Schemas\Schema;

class AssetCategoryInfolist
{
    public static function configure(Schema $schema): Schema
    {
        return AdminResourceRegistry::infolist(static::class, $schema);
    }
}
