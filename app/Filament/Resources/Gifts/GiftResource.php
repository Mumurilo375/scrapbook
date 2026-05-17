<?php

namespace App\Filament\Resources\Gifts;

use App\Domain\Gifts\Models\Gift;
use App\Filament\Resources\Gifts\Pages\CreateGift;
use App\Filament\Resources\Gifts\Pages\EditGift;
use App\Filament\Resources\Gifts\Pages\ListGifts;
use App\Filament\Resources\Gifts\Pages\ViewGift;
use App\Filament\Resources\Gifts\Schemas\GiftForm;
use App\Filament\Resources\Gifts\Schemas\GiftInfolist;
use App\Filament\Resources\Gifts\Tables\GiftsTable;
use App\Filament\Support\AdminResource;
use App\Filament\Support\AdminResourceRegistry;
use BackedEnum;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class GiftResource extends AdminResource
{
    protected static ?string $model = Gift::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedRectangleStack;

    protected static ?string $recordTitleAttribute = 'title';

    public static function form(Schema $schema): Schema
    {
        return GiftForm::configure($schema);
    }

    public static function infolist(Schema $schema): Schema
    {
        return GiftInfolist::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return GiftsTable::configure($table);
    }

    public static function getRelations(): array
    {
        return AdminResourceRegistry::relations(static::class);
    }

    public static function getPages(): array
    {
        return [
            'index' => ListGifts::route('/'),
            'create' => CreateGift::route('/create'),
            'view' => ViewGift::route('/{record}'),
            'edit' => EditGift::route('/{record}/edit'),
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
