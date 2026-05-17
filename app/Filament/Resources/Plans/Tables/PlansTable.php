<?php

namespace App\Filament\Resources\Plans\Tables;

use App\Filament\Support\AdminResourceRegistry;
use Filament\Tables\Table;

class PlansTable
{
    public static function configure(Table $table): Table
    {
        return AdminResourceRegistry::table(static::class, $table);
    }
}
