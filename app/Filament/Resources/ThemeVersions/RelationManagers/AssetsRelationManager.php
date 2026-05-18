<?php

namespace App\Filament\Resources\ThemeVersions\RelationManagers;

use App\Filament\Resources\Assets\AssetResource;
use Filament\Actions\AttachAction;
use Filament\Actions\DetachAction;
use Filament\Forms\Components\Hidden;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Illuminate\Support\Str;

class AssetsRelationManager extends RelationManager
{
    protected static string $relationship = 'assets';

    protected static ?string $relatedResource = AssetResource::class;

    public function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('category.name')->label('Categoria')->searchable()->sortable(),
                TextColumn::make('name')->searchable()->sortable(),
                TextColumn::make('type')->badge(),
                TextColumn::make('pivot.role')->label('Role')->badge(),
                TextColumn::make('pivot.sort_order')->label('Ordem')->sortable(),
                IconColumn::make('is_active')->boolean(),
            ])
            ->headerActions([
                AttachAction::make()
                    ->label('Associar asset')
                    ->preloadRecordSelect()
                    ->schema(fn (AttachAction $action): array => [
                        $action->getRecordSelect(),
                        Hidden::make('id')->default(fn (): string => (string) Str::ulid()),
                        TextInput::make('role')->default('sticker')->maxLength(255),
                        TextInput::make('sort_order')->integer()->default(0)->minValue(0),
                        Textarea::make('config')
                            ->label('Config JSON')
                            ->rules(['nullable', 'json'])
                            ->default('{"schemaVersion":1}')
                            ->dehydrateStateUsing(fn (?string $state): ?string => filled($state) ? $state : null)
                            ->columnSpanFull(),
                    ]),
            ])
            ->recordActions([
                DetachAction::make(),
            ]);
    }
}
