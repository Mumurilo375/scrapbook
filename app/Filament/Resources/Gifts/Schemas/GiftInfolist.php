<?php

namespace App\Filament\Resources\Gifts\Schemas;

use App\Filament\Support\AdminResourceRegistry;
use Filament\Schemas\Schema;

class GiftInfolist
{
    public static function configure(Schema $schema): Schema
    {
        return AdminResourceRegistry::infolist(static::class, $schema);
    }
}
