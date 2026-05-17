<?php

namespace App\Filament\Resources\Templates\Tables;

use App\Filament\Support\AdminResourceRegistry;
use Filament\Tables\Table;

class TemplatesTable
{
    public static function configure(Table $table): Table
    {
        return AdminResourceRegistry::table(static::class, $table);
    }
}
