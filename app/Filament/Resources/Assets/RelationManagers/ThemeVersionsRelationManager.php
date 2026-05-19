<?php

namespace App\Filament\Resources\Assets\RelationManagers;

use App\Domain\Assets\Support\ThemeAssetRoles;
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
                TextColumn::make('pivot.role')
                    ->label('Uso no tema')
                    ->badge()
                    ->formatStateUsing(fn (mixed $state): string => ThemeAssetRoles::label((string) ($state ?: ThemeAssetRoles::STICKER))),
                TextColumn::make('pivot.sort_order')->label('Prioridade')->sortable(),
                IconColumn::make('theme.is_active')->label('Tema ativo')->boolean(),
            ])
            ->headerActions([
                AttachAction::make()
                    ->label('Associar versão de tema')
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
                Action::make('useAsPaperTexture')
                    ->label('Usar como papel')
                    ->icon('heroicon-o-document')
                    ->color('gray')
                    ->requiresConfirmation()
                    ->modalDescription('Este asset passará a ser usado como textura de papel nesta versão de tema.')
                    ->action(function (ThemeVersion $record): void {
                        $this->setPivotRole($record, ThemeAssetRoles::PAPER_TEXTURE);
                    }),
                Action::make('useAsBackgroundTexture')
                    ->label('Usar como fundo')
                    ->icon('heroicon-o-photo')
                    ->color('gray')
                    ->requiresConfirmation()
                    ->modalDescription('Este asset passará a ser usado como fundo externo nesta versão de tema.')
                    ->action(function (ThemeVersion $record): void {
                        $this->setPivotRole($record, ThemeAssetRoles::BACKGROUND_TEXTURE);
                    }),
                Action::make('useAsBookTexture')
                    ->label('Usar como livro')
                    ->icon('heroicon-o-book-open')
                    ->color('gray')
                    ->requiresConfirmation()
                    ->modalDescription('Este asset passará a ser usado como textura da superfície do livro/capa.')
                    ->action(function (ThemeVersion $record): void {
                        $this->setPivotRole($record, ThemeAssetRoles::BOOK_TEXTURE);
                    }),
                DetachAction::make()
                    ->label('Remover vínculo'),
            ]);
    }

    /**
     * @return array<int, mixed>
     */
    private static function pivotSchema(): array
    {
        return [
            Select::make('role')
                ->label('Como o tema usa este asset')
                ->options(self::roleOptions())
                ->default('sticker')
                ->helperText(self::roleHelperText())
                ->required(),
            TextInput::make('sort_order')
                ->label('Prioridade')
                ->helperText('Menor número aparece primeiro. Assets associados ao tema são priorizados antes dos globais no editor.')
                ->integer()
                ->default(0)
                ->minValue(0),
            CodeEditor::make('config')
                ->label('Config avançado do vínculo')
                ->language(Language::Json)
                ->helperText('Opcional. Use apenas para ajustar este vínculo; na maioria dos casos role e prioridade bastam.')
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
        return ThemeAssetRoles::options();
    }

    private static function roleHelperText(): string
    {
        return collect(ThemeAssetRoles::descriptions())
            ->only([
                ThemeAssetRoles::PAPER_TEXTURE,
                ThemeAssetRoles::PAGE_BACKGROUND,
                ThemeAssetRoles::BACKGROUND_TEXTURE,
                ThemeAssetRoles::BOOK_TEXTURE,
                ThemeAssetRoles::AGING_OVERLAY,
                ThemeAssetRoles::STICKER,
                ThemeAssetRoles::TAPE,
                ThemeAssetRoles::FRAME,
                ThemeAssetRoles::DECORATION,
            ])
            ->map(fn (string $description, string $role): string => ThemeAssetRoles::label($role).': '.$description)
            ->implode(' ');
    }

    private function setPivotRole(ThemeVersion $record, string $role): void
    {
        $this->getOwnerRecord()->themeVersions()->updateExistingPivot($record->id, [
            'role' => $role,
            'sort_order' => (int) ($record->pivot?->sort_order ?? 0),
            'config' => $record->pivot?->config,
        ]);
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
