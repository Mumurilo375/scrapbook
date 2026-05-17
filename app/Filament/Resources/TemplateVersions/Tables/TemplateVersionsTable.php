<?php

namespace App\Filament\Resources\TemplateVersions\Tables;

use App\Filament\Support\AdminResourceRegistry;
use Filament\Tables\Table;

class TemplateVersionsTable
{
    public static function configure(Table $table): Table
    {
        return AdminResourceRegistry::table(static::class, $table);
    }
}
