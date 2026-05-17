<?php

namespace App\Filament\Resources\Orders\Schemas;

use App\Filament\Support\AdminResourceRegistry;
use Filament\Schemas\Schema;

class OrderInfolist
{
    public static function configure(Schema $schema): Schema
    {
        return AdminResourceRegistry::infolist(static::class, $schema);
    }
}
