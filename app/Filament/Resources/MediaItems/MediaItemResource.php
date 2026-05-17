<?php

namespace App\Filament\Resources\MediaItems;

use App\Domain\Media\Models\MediaItem;
use App\Filament\Resources\MediaItems\Pages\CreateMediaItem;
use App\Filament\Resources\MediaItems\Pages\EditMediaItem;
use App\Filament\Resources\MediaItems\Pages\ListMediaItems;
use App\Filament\Resources\MediaItems\Pages\ViewMediaItem;
use App\Filament\Resources\MediaItems\Schemas\MediaItemForm;
use App\Filament\Resources\MediaItems\Schemas\MediaItemInfolist;
use App\Filament\Resources\MediaItems\Tables\MediaItemsTable;
use App\Filament\Support\AdminResource;
use App\Filament\Support\AdminResourceRegistry;
use BackedEnum;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class MediaItemResource extends AdminResource
{
    protected static ?string $model = MediaItem::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedRectangleStack;

    protected static ?string $recordTitleAttribute = 'original_filename';

    public static function form(Schema $schema): Schema
    {
        return MediaItemForm::configure($schema);
    }

    public static function infolist(Schema $schema): Schema
    {
        return MediaItemInfolist::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return MediaItemsTable::configure($table);
    }

    public static function getRelations(): array
    {
        return AdminResourceRegistry::relations(static::class);
    }

    public static function getPages(): array
    {
        return [
            'index' => ListMediaItems::route('/'),
            'create' => CreateMediaItem::route('/create'),
            'view' => ViewMediaItem::route('/{record}'),
            'edit' => EditMediaItem::route('/{record}/edit'),
        ];
    }

    public static function getRecordRouteBindingEloquentQuery(): Builder
    {
        return parent::getRecordRouteBindingEloquentQuery()
            ->withoutGlobalScopes([
                SoftDeletingScope::class,
            ]);
    }
}
