<?php

namespace App\Filament\Resources\Assets\RelationManagers;

use App\Domain\Themes\Models\ThemeVersion;
use App\Filament\Resources\ThemeVersions\ThemeVersionResource;
use Filament\Actions\Action;
use Filament\Actions\AttachAction;
use Filament\Actions\DetachAction;
use Filament\Forms\Components\CodeEditor;
use Filament\Forms\Components\CodeEditor\Enums\Language;
use Filament\Forms\Components\Hidden;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Illuminate\Support\Str;

class ThemeVersionsRelationManager extends RelationManager
{
    protected static string $relationship = 'themeVersions';

    protected static ?string $relatedResource = ThemeVersionResource::class;

    public function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('theme.name')->label('Tema')->searchable()->sortable(),
                TextColumn::make('name')->label('Versão')->searchable()->sortable(),
                TextColumn::make('version_number')->label('Número')->sortable(),
                TextColumn::make('status')->badge(),
                TextColumn::make('pivot.role')->label('Role')->badge(),
                TextColumn::make('pivot.sort_order')->label('Ordem')->sortable(),
                IconColumn::make('theme.is_active')->label('Tema ativo')->boolean(),
            ])
            ->headerActions([
                AttachAction::make()
                    ->label('Associar tema')
                    ->preloadRecordSelect()
                    ->schema(fn (AttachAction $action): array => [
                        $action->getRecordSelect(),
                        Hidden::make('id')->default(fn (): string => (string) Str::ulid()),
                        ...self::pivotSchema(),
                    ]),
            ])
            ->recordActions([
                Action::make('editPivot')
                    ->label('Editar vínculo')
                    ->icon('heroicon-o-adjustments-horizontal')
                    ->schema(self::pivotSchema())
                    ->fillForm(fn (ThemeVersion $record): array => [
                        'role' => $record->pivot?->role ?: 'sticker',
                        'sort_order' => $record->pivot?->sort_order ?? 0,
                        'config' => self::jsonForEditing($record->pivot?->config),
                    ])
                    ->action(function (ThemeVersion $record, array $data): void {
                        $this->getOwnerRecord()->themeVersions()->updateExistingPivot($record->id, [
                            'role' => $data['role'] ?? 'sticker',
                            'sort_order' => (int) ($data['sort_order'] ?? 0),
                            'config' => self::jsonForDatabase($data['config'] ?? null),
                        ]);
                    }),
                DetachAction::make(),
            ]);
    }

    /**
     * @return array<int, mixed>
     */
    private static function pivotSchema(): array
    {
        return [
            Select::make('role')
                ->label('Role')
                ->options(self::roleOptions())
                ->default('sticker')
                ->required(),
            TextInput::make('sort_order')
                ->label('Ordem')
                ->integer()
                ->default(0)
                ->minValue(0),
            CodeEditor::make('config')
                ->label('Config JSON')
                ->language(Language::Json)
                ->rules(['nullable', 'json'])
                ->default(self::jsonForEditing(['schemaVersion' => 1]))
                ->dehydrateStateUsing(fn (?string $state): ?string => self::jsonForDatabase($state))
                ->columnSpanFull(),
        ];
    }

    /**
     * @return array<string, string>
     */
    private static function roleOptions(): array
    {
        return [
            'sticker' => 'Sticker',
            'paper_texture' => 'Textura de papel',
            'background_texture' => 'Textura de fundo',
            'tape' => 'Fita',
            'frame' => 'Moldura',
            'decoration' => 'Decoração',
            'overlay' => 'Overlay',
            'border' => 'Borda',
        ];
    }

    private static function jsonForEditing(mixed $state): ?string
    {
        if ($state === null || $state === '') {
            return null;
        }

        if (is_string($state)) {
            $decoded = json_decode($state, true);

            if (json_last_error() === JSON_ERROR_NONE) {
                $state = $decoded;
            } else {
                return $state;
            }
        }

        return json_encode($state, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    }

    private static function jsonForDatabase(mixed $state): ?string
    {
        if ($state === null) {
            return null;
        }

        if (is_array($state)) {
            return json_encode($state, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) ?: null;
        }

        $state = trim((string) $state);

        return $state === '' ? null : $state;
    }
}
