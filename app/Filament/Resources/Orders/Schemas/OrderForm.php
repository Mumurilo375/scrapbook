<?php

namespace App\Filament\Resources\Orders\Schemas;

use App\Filament\Support\AdminResourceRegistry;
use Filament\Schemas\Schema;

class OrderForm
{
    public static function configure(Schema $schema): Schema
    {
        return AdminResourceRegistry::form(static::class, $schema);
    }
}
