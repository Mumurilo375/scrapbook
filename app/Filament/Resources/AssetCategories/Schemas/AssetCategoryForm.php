<?php

namespace App\Filament\Resources\AssetCategories\Schemas;

use App\Filament\Support\AdminResourceRegistry;
use Filament\Schemas\Schema;

class AssetCategoryForm
{
    public static function configure(Schema $schema): Schema
    {
        return AdminResourceRegistry::form(static::class, $schema);
    }
}
