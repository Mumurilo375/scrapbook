<?php

namespace App\Filament\Resources\GiftVisits;

use App\Domain\Analytics\Models\GiftVisit;
use App\Filament\Resources\GiftVisits\Pages\CreateGiftVisit;
use App\Filament\Resources\GiftVisits\Pages\EditGiftVisit;
use App\Filament\Resources\GiftVisits\Pages\ListGiftVisits;
use App\Filament\Resources\GiftVisits\Pages\ViewGiftVisit;
use App\Filament\Resources\GiftVisits\Schemas\GiftVisitForm;
use App\Filament\Resources\GiftVisits\Schemas\GiftVisitInfolist;
use App\Filament\Resources\GiftVisits\Tables\GiftVisitsTable;
use App\Filament\Support\AdminResource;
use App\Filament\Support\AdminResourceRegistry;
use BackedEnum;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class GiftVisitResource extends AdminResource
{
    protected static ?string $model = GiftVisit::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedRectangleStack;

    protected static ?string $recordTitleAttribute = 'session_hash';

    public static function form(Schema $schema): Schema
    {
        return GiftVisitForm::configure($schema);
    }

    public static function infolist(Schema $schema): Schema
    {
        return GiftVisitInfolist::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return GiftVisitsTable::configure($table);
    }

    public static function getRelations(): array
    {
        return AdminResourceRegistry::relations(static::class);
    }

    public static function getPages(): array
    {
        return [
            'index' => ListGiftVisits::route('/'),
            'create' => CreateGiftVisit::route('/create'),
            'view' => ViewGiftVisit::route('/{record}'),
            'edit' => EditGiftVisit::route('/{record}/edit'),
        ];
    }
}
