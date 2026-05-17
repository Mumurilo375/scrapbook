<?php

namespace App\Filament\Resources\ThemeVersions;

use App\Domain\Themes\Models\ThemeVersion;
use App\Filament\Resources\ThemeVersions\Pages\CreateThemeVersion;
use App\Filament\Resources\ThemeVersions\Pages\EditThemeVersion;
use App\Filament\Resources\ThemeVersions\Pages\ListThemeVersions;
use App\Filament\Resources\ThemeVersions\Pages\ViewThemeVersion;
use App\Filament\Resources\ThemeVersions\Schemas\ThemeVersionForm;
use App\Filament\Resources\ThemeVersions\Schemas\ThemeVersionInfolist;
use App\Filament\Resources\ThemeVersions\Tables\ThemeVersionsTable;
use App\Filament\Support\AdminResource;
use App\Filament\Support\AdminResourceRegistry;
use BackedEnum;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class ThemeVersionResource extends AdminResource
{
    protected static ?string $model = ThemeVersion::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedRectangleStack;

    protected static ?string $recordTitleAttribute = 'name';

    public static function form(Schema $schema): Schema
    {
        return ThemeVersionForm::configure($schema);
    }

    public static function infolist(Schema $schema): Schema
    {
        return ThemeVersionInfolist::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return ThemeVersionsTable::configure($table);
    }

    public static function getRelations(): array
    {
        return AdminResourceRegistry::relations(static::class);
    }

    public static function getPages(): array
    {
        return [
            'index' => ListThemeVersions::route('/'),
            'create' => CreateThemeVersion::route('/create'),
            'view' => ViewThemeVersion::route('/{record}'),
            'edit' => EditThemeVersion::route('/{record}/edit'),
        ];
    }
}
