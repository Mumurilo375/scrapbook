<?php

namespace App\Filament\Resources\Occasions;

use App\Domain\Templates\Models\Occasion;
use App\Filament\Resources\Occasions\Pages\CreateOccasion;
use App\Filament\Resources\Occasions\Pages\EditOccasion;
use App\Filament\Resources\Occasions\Pages\ListOccasions;
use App\Filament\Resources\Occasions\Pages\ViewOccasion;
use App\Filament\Resources\Occasions\Schemas\OccasionForm;
use App\Filament\Resources\Occasions\Schemas\OccasionInfolist;
use App\Filament\Resources\Occasions\Tables\OccasionsTable;
use App\Filament\Support\AdminResource;
use App\Filament\Support\AdminResourceRegistry;
use BackedEnum;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class OccasionResource extends AdminResource
{
    protected static ?string $model = Occasion::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedRectangleStack;

    protected static ?string $recordTitleAttribute = 'name';

    public static function form(Schema $schema): Schema
    {
        return OccasionForm::configure($schema);
    }

    public static function infolist(Schema $schema): Schema
    {
        return OccasionInfolist::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return OccasionsTable::configure($table);
    }

    public static function getRelations(): array
    {
        return AdminResourceRegistry::relations(static::class);
    }

    public static function getPages(): array
    {
        return [
            'index' => ListOccasions::route('/'),
            'create' => CreateOccasion::route('/create'),
            'view' => ViewOccasion::route('/{record}'),
            'edit' => EditOccasion::route('/{record}/edit'),
        ];
    }
}
