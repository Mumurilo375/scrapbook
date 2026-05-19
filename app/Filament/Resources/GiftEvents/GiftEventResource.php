<?php

namespace App\Filament\Resources\GiftEvents;

use App\Domain\Analytics\Models\GiftEvent;
use App\Filament\Resources\GiftEvents\Pages\CreateGiftEvent;
use App\Filament\Resources\GiftEvents\Pages\EditGiftEvent;
use App\Filament\Resources\GiftEvents\Pages\ListGiftEvents;
use App\Filament\Resources\GiftEvents\Pages\ViewGiftEvent;
use App\Filament\Resources\GiftEvents\Schemas\GiftEventForm;
use App\Filament\Resources\GiftEvents\Schemas\GiftEventInfolist;
use App\Filament\Resources\GiftEvents\Tables\GiftEventsTable;
use App\Filament\Support\AdminResource;
use App\Filament\Support\AdminResourceRegistry;
use BackedEnum;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class GiftEventResource extends AdminResource
{
    protected static ?string $model = GiftEvent::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedRectangleStack;

    protected static ?string $recordTitleAttribute = 'event_name';

    public static function form(Schema $schema): Schema
    {
        return GiftEventForm::configure($schema);
    }

    public static function infolist(Schema $schema): Schema
    {
        return GiftEventInfolist::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return GiftEventsTable::configure($table);
    }

    public static function getRelations(): array
    {
        return AdminResourceRegistry::relations(static::class);
    }

    public static function getPages(): array
    {
        return [
            'index' => ListGiftEvents::route('/'),
            'create' => CreateGiftEvent::route('/create'),
            'view' => ViewGiftEvent::route('/{record}'),
            'edit' => EditGiftEvent::route('/{record}/edit'),
        ];
    }
}
