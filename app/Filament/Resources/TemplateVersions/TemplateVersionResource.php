<?php

namespace App\Filament\Resources\TemplateVersions;

use App\Domain\Templates\Models\TemplateVersion;
use App\Filament\Resources\TemplateVersions\Pages\CreateTemplateVersion;
use App\Filament\Resources\TemplateVersions\Pages\EditTemplateVersion;
use App\Filament\Resources\TemplateVersions\Pages\ListTemplateVersions;
use App\Filament\Resources\TemplateVersions\Pages\ViewTemplateVersion;
use App\Filament\Resources\TemplateVersions\Schemas\TemplateVersionForm;
use App\Filament\Resources\TemplateVersions\Schemas\TemplateVersionInfolist;
use App\Filament\Resources\TemplateVersions\Tables\TemplateVersionsTable;
use App\Filament\Support\AdminResource;
use App\Filament\Support\AdminResourceRegistry;
use BackedEnum;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class TemplateVersionResource extends AdminResource
{
    protected static ?string $model = TemplateVersion::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedRectangleStack;

    protected static ?string $recordTitleAttribute = 'name';

    public static function form(Schema $schema): Schema
    {
        return TemplateVersionForm::configure($schema);
    }

    public static function infolist(Schema $schema): Schema
    {
        return TemplateVersionInfolist::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return TemplateVersionsTable::configure($table);
    }

    public static function getRelations(): array
    {
        return AdminResourceRegistry::relations(static::class);
    }

    public static function getPages(): array
    {
        return [
            'index' => ListTemplateVersions::route('/'),
            'create' => CreateTemplateVersion::route('/create'),
            'view' => ViewTemplateVersion::route('/{record}'),
            'edit' => EditTemplateVersion::route('/{record}/edit'),
        ];
    }
}
