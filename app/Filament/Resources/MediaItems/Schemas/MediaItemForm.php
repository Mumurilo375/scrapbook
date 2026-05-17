<?php

namespace App\Filament\Resources\MediaItems\Schemas;

use App\Filament\Support\AdminResourceRegistry;
use Filament\Schemas\Schema;

class MediaItemForm
{
    public static function configure(Schema $schema): Schema
    {
        return AdminResourceRegistry::form(static::class, $schema);
    }
}
