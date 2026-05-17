<?php

namespace App\Filament\Resources\Gifts\Schemas;

use App\Filament\Support\AdminResourceRegistry;
use Filament\Schemas\Schema;

class GiftForm
{
    public static function configure(Schema $schema): Schema
    {
        return AdminResourceRegistry::form(static::class, $schema);
    }
}
