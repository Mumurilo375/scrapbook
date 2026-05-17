<?php

namespace App\Filament\Resources\TemplatePages\Tables;

use App\Filament\Support\AdminResourceRegistry;
use Filament\Tables\Table;

class TemplatePagesTable
{
    public static function configure(Table $table): Table
    {
        return AdminResourceRegistry::table(static::class, $table);
    }
}
