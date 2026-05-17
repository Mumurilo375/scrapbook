<?php

namespace App\Filament\Resources\Payments\Tables;

use App\Filament\Support\AdminResourceRegistry;
use Filament\Tables\Table;

class PaymentsTable
{
    public static function configure(Table $table): Table
    {
        return AdminResourceRegistry::table(static::class, $table);
    }
}
