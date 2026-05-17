<?php

namespace App\Filament\Resources\MediaItems\Schemas;

use App\Filament\Support\AdminResourceRegistry;
use Filament\Schemas\Schema;

class MediaItemInfolist
{
    public static function configure(Schema $schema): Schema
    {
        return AdminResourceRegistry::infolist(static::class, $schema);
    }
}
