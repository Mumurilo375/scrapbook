<?php

namespace App\Filament\Resources\TemplatePages;

use App\Domain\Templates\Models\TemplatePage;
use App\Filament\Resources\TemplatePages\Pages\CreateTemplatePage;
use App\Filament\Resources\TemplatePages\Pages\EditTemplatePage;
use App\Filament\Resources\TemplatePages\Pages\ListTemplatePages;
use App\Filament\Resources\TemplatePages\Pages\ViewTemplatePage;
use App\Filament\Resources\TemplatePages\Schemas\TemplatePageForm;
use App\Filament\Resources\TemplatePages\Schemas\TemplatePageInfolist;
use App\Filament\Resources\TemplatePages\Tables\TemplatePagesTable;
use App\Filament\Support\AdminResource;
use App\Filament\Support\AdminResourceRegistry;
use BackedEnum;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class TemplatePageResource extends AdminResource
{
    protected static ?string $model = TemplatePage::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedRectangleStack;

    protected static ?string $recordTitleAttribute = 'name';

    public static function form(Schema $schema): Schema
    {
        return TemplatePageForm::configure($schema);
    }

    public static function infolist(Schema $schema): Schema
    {
        return TemplatePageInfolist::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return TemplatePagesTable::configure($table);
    }

    public static function getRelations(): array
    {
        return AdminResourceRegistry::relations(static::class);
    }

    public static function getPages(): array
    {
        return [
            'index' => ListTemplatePages::route('/'),
            'create' => CreateTemplatePage::route('/create'),
            'view' => ViewTemplatePage::route('/{record}'),
            'edit' => EditTemplatePage::route('/{record}/edit'),
        ];
    }
}
