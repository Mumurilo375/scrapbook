<?php

namespace App\Filament\Resources\Payments\Schemas;

use App\Filament\Support\AdminResourceRegistry;
use Filament\Schemas\Schema;

class PaymentForm
{
    public static function configure(Schema $schema): Schema
    {
        return AdminResourceRegistry::form(static::class, $schema);
    }
}
