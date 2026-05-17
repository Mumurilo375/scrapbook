<?php

namespace App\Filament\Resources\Payments\Schemas;

use App\Filament\Support\AdminResourceRegistry;
use Filament\Schemas\Schema;

class PaymentInfolist
{
    public static function configure(Schema $schema): Schema
    {
        return AdminResourceRegistry::infolist(static::class, $schema);
    }
}
