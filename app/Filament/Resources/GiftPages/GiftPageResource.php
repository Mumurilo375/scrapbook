<?php

namespace App\Filament\Resources\GiftPages;

use App\Domain\Gifts\Models\GiftPage;
use App\Filament\Resources\GiftPages\Pages\CreateGiftPage;
use App\Filament\Resources\GiftPages\Pages\EditGiftPage;
use App\Filament\Resources\GiftPages\Pages\ListGiftPages;
use App\Filament\Resources\GiftPages\Pages\ViewGiftPage;
use App\Filament\Resources\GiftPages\Schemas\GiftPageForm;
use App\Filament\Resources\GiftPages\Schemas\GiftPageInfolist;
use App\Filament\Resources\GiftPages\Tables\GiftPagesTable;
use App\Filament\Support\AdminResource;
use App\Filament\Support\AdminResourceRegistry;
use BackedEnum;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class GiftPageResource extends AdminResource
{
    protected static ?string $model = GiftPage::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedRectangleStack;

    protected static ?string $recordTitleAttribute = 'name';

    public static function form(Schema $schema): Schema
    {
        return GiftPageForm::configure($schema);
    }

    public static function infolist(Schema $schema): Schema
    {
        return GiftPageInfolist::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return GiftPagesTable::configure($table);
    }

    public static function getRelations(): array
    {
        return AdminResourceRegistry::relations(static::class);
    }

    public static function getPages(): array
    {
        return [
            'index' => ListGiftPages::route('/'),
            'create' => CreateGiftPage::route('/create'),
            'view' => ViewGiftPage::route('/{record}'),
            'edit' => EditGiftPage::route('/{record}/edit'),
        ];
    }
}
