<?php

namespace App\Filament\Resources\Orders\Tables;

use App\Filament\Support\AdminResourceRegistry;
use Filament\Tables\Table;

class OrdersTable
{
    public static function configure(Table $table): Table
    {
        return AdminResourceRegistry::table(static::class, $table);
    }
}
