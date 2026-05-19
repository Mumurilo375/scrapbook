<?php

namespace App\Filament\Resources\ThemeVersions\RelationManagers;

use App\Domain\Assets\Models\Asset;
use App\Domain\Assets\Services\AssetUrlResolver;
use App\Domain\Assets\Support\ThemeAssetRoles;
use App\Filament\Resources\Assets\AssetResource;
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
use Filament\Tables\Columns\ImageColumn;
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
                ImageColumn::make('preview')->getStateUsing(fn (Asset $record): ?string => app(AssetUrlResolver::class)->previewUrl($record))->imageHeight(44),
                TextColumn::make('category.name')->label('Categoria')->searchable()->sortable(),
                TextColumn::make('name')->searchable()->sortable(),
                TextColumn::make('type')->badge(),
                TextColumn::make('pivot.role')
                    ->label('Uso no tema')
                    ->badge()
                    ->formatStateUsing(fn (mixed $state): string => ThemeAssetRoles::label((string) ($state ?: ThemeAssetRoles::STICKER))),
                TextColumn::make('pivot.sort_order')->label('Prioridade')->sortable(),
                IconColumn::make('is_active')->boolean(),
            ])
            ->headerActions([
                AttachAction::make()
                    ->label('Associar asset')
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
                    ->fillForm(fn (Asset $record): array => [
                        'role' => $record->pivot?->role ?: 'sticker',
                        'sort_order' => $record->pivot?->sort_order ?? 0,
                        'config' => self::jsonForEditing($record->pivot?->config),
                    ])
                    ->action(function (Asset $record, array $data): void {
                        $this->getOwnerRecord()->assets()->updateExistingPivot($record->id, [
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
                    ->modalDescription('Este asset passará a ser usado como textura de papel desta versão de tema.')
                    ->action(function (Asset $record): void {
                        $this->setPivotRole($record, ThemeAssetRoles::PAPER_TEXTURE);
                    }),
                Action::make('useAsBackgroundTexture')
                    ->label('Usar como fundo')
                    ->icon('heroicon-o-photo')
                    ->color('gray')
                    ->requiresConfirmation()
                    ->modalDescription('Este asset passará a ser usado como fundo externo desta versão de tema.')
                    ->action(function (Asset $record): void {
                        $this->setPivotRole($record, ThemeAssetRoles::BACKGROUND_TEXTURE);
                    }),
                Action::make('useAsBookTexture')
                    ->label('Usar como livro')
                    ->icon('heroicon-o-book-open')
                    ->color('gray')
                    ->requiresConfirmation()
                    ->modalDescription('Este asset passará a ser usado como textura da superfície do livro/capa.')
                    ->action(function (Asset $record): void {
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
                ->helperText('Menor número aparece primeiro. Assets do tema são enviados antes dos globais no editor.')
                ->integer()
                ->default(0)
                ->minValue(0),
            CodeEditor::make('config')
                ->label('Config avançado do vínculo')
                ->language(Language::Json)
                ->helperText('Opcional. Use apenas quando este vínculo precisar de uma configuração visual específica; na maioria dos casos, role e prioridade bastam.')
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

    private function setPivotRole(Asset $record, string $role): void
    {
        $this->getOwnerRecord()->assets()->updateExistingPivot($record->id, [
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
