<?php

namespace App\Filament\Support;

use App\Domain\Analytics\Models\GiftEvent;
use App\Domain\Assets\Enums\AssetType;
use App\Domain\Assets\Models\Asset;
use App\Domain\Assets\Services\AssetUrlResolver;
use App\Domain\Assets\Support\AssetMetadata;
use App\Domain\Assets\Support\ThemeAssetRoles;
use App\Domain\Editor\CanvasNormalizer;
use App\Domain\Gifts\Enums\GiftStatus;
use App\Domain\Gifts\Enums\GiftVisibility;
use App\Domain\Gifts\Models\Gift;
use App\Domain\Media\Enums\MediaStatus;
use App\Domain\Media\Enums\MediaType;
use App\Domain\Media\Models\MediaItem;
use App\Domain\Payments\Enums\OrderStatus;
use App\Domain\Payments\Enums\PaymentStatus;
use App\Domain\Payments\Models\Order;
use App\Domain\Payments\Models\Payment;
use App\Domain\Templates\Actions\CreateTemplateFromGift;
use App\Domain\Templates\Enums\PageType;
use App\Domain\Templates\Enums\TemplateVersionStatus;
use App\Domain\Templates\Models\Occasion;
use App\Domain\Templates\Models\TemplatePage;
use App\Domain\Templates\Models\TemplateVersion;
use App\Domain\Themes\Enums\ThemeVersionStatus;
use App\Domain\Themes\Models\ThemeVersion;
use App\Domain\Themes\ThemeConfig;
use App\Filament\Resources\Assets\RelationManagers\ThemeVersionsRelationManager;
use App\Filament\Resources\Gifts\RelationManagers\EventsRelationManager;
use App\Filament\Resources\Gifts\RelationManagers\MediaItemsRelationManager;
use App\Filament\Resources\Gifts\RelationManagers\OrdersRelationManager;
use App\Filament\Resources\Gifts\RelationManagers\VisitsRelationManager;
use App\Filament\Resources\Orders\RelationManagers\PaymentsRelationManager;
use App\Filament\Resources\TemplateVersions\RelationManagers\PagesRelationManager;
use App\Filament\Resources\Themes\RelationManagers\VersionsRelationManager;
use App\Filament\Resources\ThemeVersions\RelationManagers\AssetsRelationManager;
use BackedEnum;
use Filament\Actions\Action;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use Filament\Forms\Components\CodeEditor;
use Filament\Forms\Components\CodeEditor\Enums\Language;
use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Infolists\Components\IconEntry;
use Filament\Infolists\Components\ImageEntry;
use Filament\Infolists\Components\TextEntry;
use Filament\Notifications\Notification;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\Filter;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Filters\TrashedFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Throwable;

class AdminResourceRegistry
{
    /**
     * @return array<string, mixed>
     */
    public static function resourceOptions(string $key): array
    {
        return self::resources()[$key] ?? [];
    }

    public static function form(string $class, Schema $schema): Schema
    {
        return $schema
            ->components(self::formComponents(self::keyFromClass($class)))
            ->columns(2);
    }

    public static function infolist(string $class, Schema $schema): Schema
    {
        return $schema
            ->components(self::infolistComponents(self::keyFromClass($class)))
            ->columns(2);
    }

    public static function table(string $class, Table $table): Table
    {
        return self::configureTable(self::keyFromClass($class), $table);
    }

    /**
     * @return array<class-string>
     */
    public static function relations(string $resourceClass): array
    {
        return match (self::keyFromClass($resourceClass)) {
            'Theme' => [
                VersionsRelationManager::class,
            ],
            'Template' => [
                \App\Filament\Resources\Templates\RelationManagers\VersionsRelationManager::class,
            ],
            'TemplateVersion' => [
                PagesRelationManager::class,
            ],
            'ThemeVersion' => [
                AssetsRelationManager::class,
            ],
            'Asset' => [
                ThemeVersionsRelationManager::class,
            ],
            'Gift' => [
                \App\Filament\Resources\Gifts\RelationManagers\PagesRelationManager::class,
                MediaItemsRelationManager::class,
                OrdersRelationManager::class,
                VisitsRelationManager::class,
                EventsRelationManager::class,
            ],
            'Order' => [
                PaymentsRelationManager::class,
            ],
            default => [],
        };
    }

    /**
     * @return array<string, array<string, mixed>>
     */
    protected static function resources(): array
    {
        return [
            'Occasion' => ['group' => 'Produto', 'sort' => 10, 'label' => 'ocasião', 'pluralLabel' => 'Occasions', 'icon' => Heroicon::OutlinedTag, 'adminOnly' => true, 'delete' => true, 'reorder' => true],
            'Plan' => ['group' => 'Produto', 'sort' => 20, 'label' => 'plano', 'pluralLabel' => 'Plans', 'icon' => Heroicon::OutlinedBanknotes, 'adminOnly' => true, 'delete' => true, 'reorder' => true],
            'Theme' => ['group' => 'Visual', 'sort' => 10, 'label' => 'tema', 'pluralLabel' => 'Themes', 'icon' => Heroicon::OutlinedPaintBrush, 'adminOnly' => true, 'delete' => true, 'reorder' => true],
            'ThemeVersion' => ['group' => 'Visual', 'sort' => 20, 'label' => 'versão de tema', 'pluralLabel' => 'Theme Versions', 'icon' => Heroicon::OutlinedSparkles, 'adminOnly' => true, 'delete' => true],
            'AssetCategory' => ['group' => 'Visual', 'sort' => 30, 'label' => 'categoria de asset', 'pluralLabel' => 'Asset Categories', 'icon' => Heroicon::OutlinedTag, 'delete' => true, 'reorder' => true],
            'Asset' => ['group' => 'Visual', 'sort' => 40, 'label' => 'asset', 'pluralLabel' => 'Assets', 'icon' => Heroicon::OutlinedPhoto, 'delete' => true, 'reorder' => true],
            'Template' => ['group' => 'Templates', 'sort' => 10, 'label' => 'template', 'pluralLabel' => 'Templates', 'icon' => Heroicon::OutlinedDocumentDuplicate, 'adminOnly' => true, 'delete' => true, 'reorder' => true],
            'TemplateVersion' => ['group' => 'Templates', 'sort' => 20, 'label' => 'versão de template', 'pluralLabel' => 'Template Versions', 'icon' => Heroicon::OutlinedDocumentCheck, 'adminOnly' => true, 'delete' => true],
            'TemplatePage' => ['group' => 'Templates', 'sort' => 30, 'label' => 'página de template', 'pluralLabel' => 'Template Pages', 'icon' => Heroicon::OutlinedRectangleStack, 'adminOnly' => true, 'delete' => true, 'reorder' => true],
            'Gift' => ['group' => 'Operação', 'sort' => 10, 'label' => 'gift', 'pluralLabel' => 'Gifts', 'icon' => Heroicon::OutlinedGift, 'create' => false, 'edit' => true, 'delete' => false],
            'GiftPage' => ['group' => 'Operação', 'sort' => 11, 'label' => 'página do gift', 'pluralLabel' => 'Gift Pages', 'icon' => Heroicon::OutlinedRectangleStack, 'navigation' => false, 'create' => false, 'edit' => true, 'delete' => false, 'reorder' => true],
            'MediaItem' => ['group' => 'Operação', 'sort' => 20, 'label' => 'mídia', 'pluralLabel' => 'Media Items', 'icon' => Heroicon::OutlinedPhoto, 'create' => false, 'edit' => false, 'delete' => false],
            'Order' => ['group' => 'Pagamentos', 'sort' => 10, 'label' => 'pedido', 'pluralLabel' => 'Orders', 'icon' => Heroicon::OutlinedShoppingBag, 'create' => false, 'edit' => false, 'delete' => false],
            'Payment' => ['group' => 'Pagamentos', 'sort' => 20, 'label' => 'pagamento', 'pluralLabel' => 'Payments', 'icon' => Heroicon::OutlinedCreditCard, 'create' => false, 'edit' => false, 'delete' => false],
            'GiftVisit' => ['group' => 'Analytics', 'sort' => 10, 'label' => 'visita', 'pluralLabel' => 'Gift Visits', 'icon' => Heroicon::OutlinedEye, 'create' => false, 'edit' => false, 'delete' => false],
            'GiftEvent' => ['group' => 'Analytics', 'sort' => 20, 'label' => 'evento', 'pluralLabel' => 'Gift Events', 'icon' => Heroicon::OutlinedChartBar, 'create' => false, 'edit' => false, 'delete' => false],
        ];
    }

    /**
     * @return array<int, mixed>
     */
    protected static function formComponents(string $key): array
    {
        return match ($key) {
            'Occasion' => [
                self::nameField(),
                self::slugField(),
                Textarea::make('description')->columnSpanFull(),
                Toggle::make('is_active')->default(true),
                self::integerField('sort_order')->default(0),
                self::jsonField('metadata'),
            ],
            'Plan' => [
                self::nameField(),
                self::slugField(),
                Textarea::make('description')->columnSpanFull(),
                self::integerField('price_cents')->label('Preço em centavos')->required()->minValue(0),
                TextInput::make('currency')->required()->default('BRL')->maxLength(3),
                self::integerField('max_pages')->minValue(0),
                self::integerField('max_photos')->minValue(0),
                self::integerField('max_storage_mb')->minValue(0),
                self::integerField('gift_lifetime_days')->minValue(0),
                Toggle::make('can_use_qr_code')->default(false),
                Toggle::make('can_edit_after_publish')->default(false),
                Toggle::make('is_active')->default(true),
                self::integerField('sort_order')->default(0),
                self::jsonField('features'),
            ],
            'Theme' => [
                self::nameField(),
                self::slugField(),
                Textarea::make('description')->columnSpanFull(),
                Toggle::make('is_active')->default(true),
                self::integerField('sort_order')->default(0),
            ],
            'ThemeVersion' => [
                Select::make('theme_id')->relationship('theme', 'name')->searchable()->preload()->required(),
                self::integerField('version_number')->required()->minValue(1),
                self::enumSelect('status', ThemeVersionStatus::class)->required()->default(ThemeVersionStatus::Draft->value),
                self::nameField(),
                DateTimePicker::make('published_at'),
                Textarea::make('texture_help')
                    ->label('Como testar texturas reais')
                    ->default('Suba um asset do tipo paper/texture/background, salve, associe nesta versão de tema pela aba Assets e escolha o uso: textura de papel, fundo externo ou textura do livro. O editor, preview e viewer resolvem essas imagens por asset seguro.')
                    ->rows(3)
                    ->disabled()
                    ->dehydrated(false)
                    ->columnSpanFull(),
                self::jsonField('config', required: true, default: ThemeConfig::defaults()),
            ],
            'AssetCategory' => [
                self::nameField(),
                self::slugField(),
                Textarea::make('description')->columnSpanFull(),
                TextInput::make('icon')->maxLength(255),
                Toggle::make('is_active')->default(true),
                self::integerField('sort_order')->default(0),
                self::jsonField('metadata'),
            ],
            'Asset' => [
                Textarea::make('asset_pipeline_help')
                    ->label('Pipeline visual')
                    ->default('Assets ativos sem vínculo com tema são globais e aparecem em todos os temas. Papel/textura/background de página deve ser usado pela aba Página/Fundo do editor, não como adesivo. Para definir papel padrão do tema, salve o asset e associe a uma ThemeVersion com uso "Textura de papel", "Superfície kraft" ou "Papel/fundo de página".')
                    ->rows(3)
                    ->disabled()
                    ->dehydrated(false)
                    ->columnSpanFull(),
                FileUpload::make('asset_file')
                    ->label('Arquivo do asset')
                    ->image()
                    ->acceptedFileTypes(['image/png', 'image/webp', 'image/jpeg'])
                    ->helperText('Envie PNG, WebP ou JPG/JPEG. O upload temporário é local; ao salvar, o arquivo vai para o storage de assets configurado. Se houver erro, ele aparece neste campo.')
                    ->imagePreviewHeight('150')
                    ->maxSize((int) config('scrapbook.assets.max_upload_kb', 8192))
                    ->rules([
                        'mimetypes:image/png,image/jpeg,image/webp',
                        'max:'.((int) config('scrapbook.assets.max_upload_kb', 8192)),
                    ])
                    ->uploadingMessage('Enviando asset...')
                    ->storeFiles(false)
                    ->required(fn (?Asset $record): bool => ! $record instanceof Asset || blank($record->storage_path))
                    ->columnSpanFull(),
                Select::make('asset_category_id')->relationship('category', 'name')->searchable()->preload(),
                self::nameField(),
                self::slugField(required: false),
                self::enumSelect('type', AssetType::class)
                    ->required()
                    ->helperText('Use paper/texture/background para fundos de página. Stickers, fitas, selos, flores e molduras posicionáveis devem usar tipos decorativos.'),
                TextInput::make('storage_disk')->disabled()->dehydrated(false)->visible(fn (?Asset $record): bool => $record instanceof Asset)->maxLength(255),
                TextInput::make('storage_path')->disabled()->dehydrated(false)->visible(fn (?Asset $record): bool => $record instanceof Asset)->maxLength(255)->columnSpanFull(),
                TextInput::make('public_url')->label('URL pública interna')->disabled()->dehydrated(false)->visible(fn (?Asset $record): bool => $record instanceof Asset)->maxLength(2048)->columnSpanFull(),
                TextInput::make('mime_type')->disabled()->dehydrated(false)->visible(fn (?Asset $record): bool => $record instanceof Asset)->maxLength(255),
                self::integerField('size_bytes')->disabled()->dehydrated(false)->visible(fn (?Asset $record): bool => $record instanceof Asset),
                self::integerField('width')->disabled()->dehydrated(false)->visible(fn (?Asset $record): bool => $record instanceof Asset),
                self::integerField('height')->disabled()->dehydrated(false)->visible(fn (?Asset $record): bool => $record instanceof Asset),
                Toggle::make('is_active')->default(true),
                self::integerField('sort_order')->default(0),
                self::jsonField('metadata', default: AssetMetadata::defaultForAdminForm()),
            ],
            'Template' => [
                Select::make('occasion_id')->relationship('occasion', 'name')->searchable()->preload()->required(),
                self::nameField(),
                self::slugField(),
                Textarea::make('description')->columnSpanFull(),
                Toggle::make('is_active')->default(true),
                self::integerField('sort_order')->default(0),
                self::jsonField('metadata'),
            ],
            'TemplateVersion' => [
                Select::make('template_id')->relationship('template', 'name')->searchable()->preload()->required(),
                Select::make('theme_version_id')->relationship('themeVersion', 'name')->searchable()->preload(),
                self::integerField('version_number')->required()->minValue(1),
                self::enumSelect('status', TemplateVersionStatus::class)->required()->default(TemplateVersionStatus::Draft->value),
                self::nameField(),
                DateTimePicker::make('published_at'),
                self::jsonField('preview_config'),
                self::jsonField('default_config'),
            ],
            'TemplatePage' => [
                Textarea::make('template_page_help')
                    ->label('Edição avançada')
                    ->default('JSON de TemplatePage é avançado. O fluxo recomendado para montar templates bonitos é criar/editar um Gift no editor visual e usar a ação administrativa "Criar template" no Gift. Edite o JSON manualmente apenas com cuidado e sempre mantenha artboard válido.')
                    ->rows(3)
                    ->disabled()
                    ->dehydrated(false)
                    ->columnSpanFull(),
                Select::make('template_version_id')->relationship('templateVersion', 'name')->searchable()->preload()->required(),
                self::enumSelect('page_type', PageType::class)->required()->default(PageType::Generic->value),
                self::nameField(),
                self::integerField('sort_order')->required()->default(0)->minValue(0),
                self::jsonField('canvas', required: true, default: self::defaultCanvas()),
                self::jsonField('editable_schema'),
                self::jsonField('constraints'),
                self::jsonField('metadata'),
            ],
            'Gift' => [
                TextInput::make('title')->required()->maxLength(255)->columnSpanFull(),
                TextInput::make('recipient_name')->maxLength(255),
                TextInput::make('sender_name')->maxLength(255),
                self::enumSelect('visibility', GiftVisibility::class)->required(),
                Select::make('user_id')->relationship('user', 'email')->searchable()->preload(),
                Select::make('plan_id')->relationship('plan', 'name')->searchable()->preload(),
                Select::make('occasion_id')->relationship('occasion', 'name')->searchable()->preload(),
                Select::make('template_version_id')->relationship('templateVersion', 'name')->searchable()->preload(),
                Select::make('theme_version_id')->relationship('themeVersion', 'name')->searchable()->preload(),
                TextInput::make('public_code')->disabled()->dehydrated(false),
                DateTimePicker::make('published_at'),
                DateTimePicker::make('expires_at'),
                DateTimePicker::make('last_edited_at'),
                self::jsonField('settings'),
                self::jsonField('limits_snapshot')->disabled()->dehydrated(false),
            ],
            'GiftPage' => [
                Select::make('gift_id')->relationship('gift', 'title')->searchable()->preload()->required(),
                Select::make('source_template_page_id')->relationship('sourceTemplatePage', 'name')->searchable()->preload(),
                self::enumSelect('page_type', PageType::class)->required(),
                self::nameField(),
                self::integerField('sort_order')->required()->default(0)->minValue(0),
                Toggle::make('is_visible')->default(true),
                Toggle::make('locked')->default(false),
                self::jsonField('canvas', required: true, default: self::defaultCanvas()),
                self::jsonField('settings'),
            ],
            'MediaItem' => [
                Select::make('user_id')->relationship('user', 'email')->searchable()->preload()->disabled()->dehydrated(false),
                Select::make('gift_id')->relationship('gift', 'title')->searchable()->preload()->disabled()->dehydrated(false),
                self::enumSelect('type', MediaType::class)->disabled()->dehydrated(false),
                self::enumSelect('status', MediaStatus::class)->disabled()->dehydrated(false),
                TextInput::make('original_filename')->disabled()->dehydrated(false),
                TextInput::make('storage_disk')->disabled()->dehydrated(false),
                TextInput::make('storage_path')->disabled()->dehydrated(false)->columnSpanFull(),
                self::jsonField('variants')->disabled()->dehydrated(false),
                self::jsonField('metadata')->disabled()->dehydrated(false),
            ],
            'Order' => [
                self::readonlyNotice('Pedidos são operacionais nesta fase. A edição direta fica desativada para evitar inconsistência com o futuro gateway.'),
            ],
            'Payment' => [
                self::readonlyNotice('Pagamentos são somente consulta nesta fase. O payload bruto não deve ser tratado como campo comum editável.'),
            ],
            'GiftVisit', 'GiftEvent' => [
                self::readonlyNotice('Analytics é somente consulta nesta fase.'),
            ],
            default => [],
        };
    }

    /**
     * @return array<int, mixed>
     */
    protected static function infolistComponents(string $key): array
    {
        return match ($key) {
            'Occasion' => [
                TextEntry::make('name'), TextEntry::make('slug')->copyable(), IconEntry::make('is_active')->boolean(),
                TextEntry::make('sort_order'), TextEntry::make('description')->columnSpanFull(), self::jsonEntry('metadata'),
                ...self::timestamps(),
            ],
            'Plan' => [
                TextEntry::make('name'), TextEntry::make('slug')->copyable(), TextEntry::make('price_cents')->label('Preço')->money('BRL', divideBy: 100, locale: 'pt_BR'),
                TextEntry::make('currency'), TextEntry::make('max_pages'), TextEntry::make('max_photos'), TextEntry::make('max_storage_mb'),
                TextEntry::make('gift_lifetime_days'), IconEntry::make('can_use_qr_code')->boolean(), IconEntry::make('can_edit_after_publish')->boolean(),
                IconEntry::make('is_active')->boolean(), self::jsonEntry('features'), ...self::timestamps(),
            ],
            'Theme' => [
                TextEntry::make('name'), TextEntry::make('slug')->copyable(), IconEntry::make('is_active')->boolean(),
                TextEntry::make('versions_count')->counts('versions')->label('Versões'), TextEntry::make('published_version')->getStateUsing(fn ($record): string => self::publishedVersionLabel($record->versions))->label('Versão publicada'),
                TextEntry::make('description')->columnSpanFull(), ...self::timestamps(),
            ],
            'ThemeVersion' => [
                TextEntry::make('theme.name'), TextEntry::make('version_number'), self::statusEntry('status'), TextEntry::make('name'), TextEntry::make('published_at')->dateTime(), self::jsonEntry('config'), ...self::timestamps(),
            ],
            'AssetCategory' => [
                TextEntry::make('name'), TextEntry::make('slug')->copyable(), TextEntry::make('icon'), IconEntry::make('is_active')->boolean(),
                TextEntry::make('sort_order'), TextEntry::make('assets_count')->counts('assets')->label('Assets'), TextEntry::make('description')->columnSpanFull(), self::jsonEntry('metadata'),
                ...self::timestamps(),
            ],
            'Asset' => [
                ImageEntry::make('preview')->label('Preview')->getStateUsing(fn (Asset $record): ?string => self::storageUrl($record))->imageHeight(140),
                TextEntry::make('category.name'), TextEntry::make('name'), TextEntry::make('slug')->copyable(), self::statusEntry('type'), IconEntry::make('is_active')->boolean(),
                TextEntry::make('scope')->label('Escopo')->getStateUsing(fn (Asset $record): string => $record->themeVersions()->exists() ? 'Tema' : 'Global')->badge(),
                TextEntry::make('theme_usage')->label('Uso em temas')->getStateUsing(fn (Asset $record): string => self::assetThemeUsageLabel($record))->columnSpanFull(),
                TextEntry::make('sort_order'),
                TextEntry::make('storage_disk'), TextEntry::make('storage_path')->copyable(), TextEntry::make('public_url')->copyable(),
                TextEntry::make('mime_type'), TextEntry::make('size_bytes')->numeric(), TextEntry::make('width'), TextEntry::make('height'), self::jsonEntry('metadata'), ...self::timestamps(),
            ],
            'Template' => [
                TextEntry::make('occasion.name'), TextEntry::make('name'), TextEntry::make('slug')->copyable(), IconEntry::make('is_active')->boolean(),
                TextEntry::make('versions_count')->counts('versions')->label('Versões'), TextEntry::make('published_version')->getStateUsing(fn ($record): string => self::publishedVersionLabel($record->versions))->label('Versão publicada'),
                TextEntry::make('description')->columnSpanFull(), self::jsonEntry('metadata'), ...self::timestamps(),
            ],
            'TemplateVersion' => [
                TextEntry::make('template.name'), TextEntry::make('themeVersion.name'), TextEntry::make('version_number'), self::statusEntry('status'), TextEntry::make('name'), TextEntry::make('published_at')->dateTime(),
                self::jsonEntry('preview_config'), self::jsonEntry('default_config'), ...self::timestamps(),
            ],
            'TemplatePage' => [
                TextEntry::make('templateVersion.name'), self::statusEntry('page_type'), TextEntry::make('name'), TextEntry::make('sort_order'),
                TextEntry::make('canvas_summary')->label('Resumo visual')->getStateUsing(fn (TemplatePage $record): string => self::canvasSummary($record->canvas))->columnSpanFull(),
                self::jsonEntry('canvas'), self::jsonEntry('editable_schema'), self::jsonEntry('constraints'), self::jsonEntry('metadata'), ...self::timestamps(),
            ],
            'Gift' => [
                TextEntry::make('id')->copyable(), TextEntry::make('user.email'), TextEntry::make('title'), TextEntry::make('recipient_name'), TextEntry::make('sender_name'),
                self::statusEntry('status'), self::statusEntry('visibility'), TextEntry::make('occasion.name'), TextEntry::make('templateVersion.name'), TextEntry::make('themeVersion.name'), TextEntry::make('plan.name'),
                TextEntry::make('public_code')->copyable(), TextEntry::make('published_at')->dateTime(), TextEntry::make('expires_at')->dateTime(), TextEntry::make('last_edited_at')->dateTime(),
                self::jsonEntry('settings'), self::jsonEntry('limits_snapshot'), ...self::timestamps(),
            ],
            'GiftPage' => [
                TextEntry::make('gift.title'), self::statusEntry('page_type'), TextEntry::make('name'), TextEntry::make('sort_order'), IconEntry::make('is_visible')->boolean(), IconEntry::make('locked')->boolean(),
                self::jsonEntry('canvas'), self::jsonEntry('settings'), ...self::timestamps(),
            ],
            'MediaItem' => [
                ImageEntry::make('preview')->label('Preview')->getStateUsing(fn (MediaItem $record): ?string => self::storageUrl($record))->imageHeight(140),
                TextEntry::make('user.email'), TextEntry::make('gift.title'), self::statusEntry('type'), self::statusEntry('status'), TextEntry::make('original_filename'),
                TextEntry::make('storage_disk'), TextEntry::make('storage_path')->copyable(), TextEntry::make('mime_type'), TextEntry::make('size_bytes')->numeric(), TextEntry::make('width'), TextEntry::make('height'),
                self::jsonEntry('variants'), self::jsonEntry('metadata'), ...self::timestamps(),
            ],
            'Order' => [
                TextEntry::make('user.email'), TextEntry::make('gift.title'), TextEntry::make('plan.name'), self::statusEntry('status'), TextEntry::make('amount_cents')->label('Valor')->money('BRL', divideBy: 100, locale: 'pt_BR'),
                TextEntry::make('currency'), TextEntry::make('provider'), TextEntry::make('provider_reference')->copyable(), TextEntry::make('checkout_url')->copyable(), TextEntry::make('paid_at')->dateTime(), TextEntry::make('expires_at')->dateTime(), self::jsonEntry('metadata'), ...self::timestamps(),
            ],
            'Payment' => [
                TextEntry::make('order.provider_reference'), self::statusEntry('status'), TextEntry::make('provider'), TextEntry::make('provider_payment_id')->copyable(), TextEntry::make('amount_cents')->label('Valor')->money('BRL', divideBy: 100, locale: 'pt_BR'),
                TextEntry::make('currency'), TextEntry::make('processed_at')->dateTime(), self::jsonEntry('raw_payload'), ...self::timestamps(),
            ],
            'GiftVisit' => [
                TextEntry::make('gift.title'), TextEntry::make('session_hash')->copyable(), TextEntry::make('ip_hash')->copyable(), TextEntry::make('user_agent_hash')->copyable(), TextEntry::make('referrer')->columnSpanFull(), TextEntry::make('opened_at')->dateTime(), self::jsonEntry('metadata'), ...self::timestamps(),
            ],
            'GiftEvent' => [
                TextEntry::make('gift.title'), TextEntry::make('user.email'), TextEntry::make('event_type'), TextEntry::make('occurred_at')->dateTime(), self::jsonEntry('payload'), ...self::timestamps(),
            ],
            default => [],
        };
    }

    protected static function configureTable(string $key, Table $table): Table
    {
        $table = match ($key) {
            'Occasion' => $table
                ->columns([TextColumn::make('name')->searchable()->sortable(), TextColumn::make('slug')->searchable()->copyable(), IconColumn::make('is_active')->boolean(), TextColumn::make('sort_order')->sortable(), TextColumn::make('templates_count')->counts('templates')->label('Templates')])
                ->filters([TernaryFilter::make('is_active')])
                ->defaultSort('sort_order')
                ->reorderable('sort_order'),
            'Plan' => $table
                ->columns([TextColumn::make('name')->searchable()->sortable(), TextColumn::make('slug')->searchable()->copyable(), TextColumn::make('price_cents')->label('Preço')->money('BRL', divideBy: 100, locale: 'pt_BR')->sortable(), TextColumn::make('currency'), IconColumn::make('is_active')->boolean(), TextColumn::make('sort_order')->sortable()])
                ->filters([TernaryFilter::make('is_active')])
                ->defaultSort('sort_order')
                ->reorderable('sort_order'),
            'Theme' => $table
                ->columns([TextColumn::make('name')->searchable()->sortable(), TextColumn::make('slug')->searchable()->copyable(), IconColumn::make('is_active')->boolean(), TextColumn::make('versions_count')->counts('versions')->label('Versões'), TextColumn::make('published_version')->getStateUsing(fn ($record): string => self::publishedVersionLabel($record->versions))->label('Publicada'), TextColumn::make('sort_order')->sortable()])
                ->filters([TernaryFilter::make('is_active')])
                ->defaultSort('sort_order')
                ->reorderable('sort_order'),
            'ThemeVersion' => $table
                ->columns([TextColumn::make('theme.name')->searchable()->sortable(), TextColumn::make('version_number')->sortable(), self::statusColumn('status'), TextColumn::make('name')->searchable(), TextColumn::make('published_at')->dateTime()->sortable()])
                ->filters([SelectFilter::make('theme_id')->relationship('theme', 'name')->searchable()->preload(), SelectFilter::make('status')->options(self::enumOptions(ThemeVersionStatus::class))])
                ->defaultSort('created_at', 'desc'),
            'AssetCategory' => $table
                ->columns([TextColumn::make('name')->searchable()->sortable(), TextColumn::make('slug')->searchable()->copyable(), TextColumn::make('icon'), IconColumn::make('is_active')->boolean(), TextColumn::make('assets_count')->counts('assets')->label('Assets'), TextColumn::make('sort_order')->sortable()])
                ->filters([TernaryFilter::make('is_active')])
                ->defaultSort('sort_order')
                ->reorderable('sort_order'),
            'Asset' => $table
                ->columns([ImageColumn::make('preview')->getStateUsing(fn (Asset $record): ?string => self::storageUrl($record))->imageHeight(48), TextColumn::make('category.name')->searchable()->sortable(), TextColumn::make('name')->searchable()->sortable(), TextColumn::make('slug')->searchable()->copyable(), self::statusColumn('type'), TextColumn::make('scope')->label('Escopo')->getStateUsing(fn (Asset $record): string => $record->themeVersions()->exists() ? 'Tema' : 'Global')->badge(), TextColumn::make('theme_usage')->label('Uso em temas')->getStateUsing(fn (Asset $record): string => self::assetThemeUsageLabel($record))->limit(48)->toggleable(), IconColumn::make('is_active')->boolean(), TextColumn::make('sort_order')->sortable(), TextColumn::make('dimensions')->label('Dimensões')->getStateUsing(fn (Asset $record): string => $record->width && $record->height ? "{$record->width}x{$record->height}" : 'N/D'), TextColumn::make('mime_type'), TextColumn::make('size_bytes')->numeric()->sortable(), TextColumn::make('created_at')->dateTime()->sortable()])
                ->filters([SelectFilter::make('asset_category_id')->relationship('category', 'name')->searchable()->preload(), SelectFilter::make('type')->options(self::enumOptions(AssetType::class)), TernaryFilter::make('is_active')])
                ->defaultSort('sort_order')
                ->reorderable('sort_order'),
            'Template' => $table
                ->columns([TextColumn::make('occasion.name')->searchable()->sortable(), TextColumn::make('name')->searchable()->sortable(), TextColumn::make('slug')->searchable()->copyable(), IconColumn::make('is_active')->boolean(), TextColumn::make('versions_count')->counts('versions')->label('Versões'), TextColumn::make('published_version')->getStateUsing(fn ($record): string => self::publishedVersionLabel($record->versions))->label('Publicada'), TextColumn::make('sort_order')->sortable()])
                ->filters([SelectFilter::make('occasion_id')->relationship('occasion', 'name')->searchable()->preload(), TernaryFilter::make('is_active')])
                ->defaultSort('sort_order')
                ->reorderable('sort_order'),
            'TemplateVersion' => $table
                ->columns([TextColumn::make('template.name')->searchable()->sortable(), TextColumn::make('themeVersion.name')->label('Theme version')->searchable(), TextColumn::make('version_number')->sortable(), self::statusColumn('status'), TextColumn::make('name')->searchable(), TextColumn::make('published_at')->dateTime()->sortable()])
                ->filters([SelectFilter::make('template_id')->relationship('template', 'name')->searchable()->preload(), SelectFilter::make('theme_version_id')->relationship('themeVersion', 'name')->searchable()->preload(), SelectFilter::make('status')->options(self::enumOptions(TemplateVersionStatus::class))])
                ->defaultSort('created_at', 'desc'),
            'TemplatePage' => $table
                ->columns([TextColumn::make('templateVersion.name')->searchable(), self::statusColumn('page_type'), TextColumn::make('name')->searchable(), TextColumn::make('sort_order')->sortable()])
                ->filters([SelectFilter::make('template_version_id')->relationship('templateVersion', 'name')->searchable()->preload()])
                ->defaultSort('sort_order')
                ->reorderable('sort_order'),
            'Gift' => $table
                ->columns([TextColumn::make('id')->copyable()->toggleable(isToggledHiddenByDefault: true), TextColumn::make('user.email')->searchable(), TextColumn::make('title')->searchable()->sortable(), TextColumn::make('recipient_name')->searchable(), TextColumn::make('sender_name')->searchable(), self::statusColumn('status'), self::statusColumn('visibility'), TextColumn::make('occasion.name'), TextColumn::make('plan.name'), TextColumn::make('public_code')->searchable()->copyable()->toggleable(isToggledHiddenByDefault: true), TextColumn::make('published_at')->dateTime()->sortable(), TextColumn::make('expires_at')->dateTime()->sortable(), TextColumn::make('created_at')->dateTime()->sortable()->toggleable()])
                ->filters([SelectFilter::make('status')->options(self::enumOptions(GiftStatus::class)), SelectFilter::make('visibility')->options(self::enumOptions(GiftVisibility::class)), SelectFilter::make('plan_id')->relationship('plan', 'name')->searchable()->preload(), SelectFilter::make('occasion_id')->relationship('occasion', 'name')->searchable()->preload(), TrashedFilter::make()])
                ->defaultSort('created_at', 'desc'),
            'GiftPage' => $table
                ->columns([TextColumn::make('gift.title')->searchable(), self::statusColumn('page_type'), TextColumn::make('name')->searchable(), TextColumn::make('sort_order')->sortable(), IconColumn::make('is_visible')->boolean(), IconColumn::make('locked')->boolean()])
                ->filters([SelectFilter::make('gift_id')->relationship('gift', 'title')->searchable()->preload()])
                ->defaultSort('sort_order')
                ->reorderable('sort_order'),
            'MediaItem' => $table
                ->columns([ImageColumn::make('preview')->getStateUsing(fn (MediaItem $record): ?string => self::storageUrl($record))->imageHeight(48), TextColumn::make('original_filename')->searchable(), TextColumn::make('user.email')->searchable(), TextColumn::make('gift.title')->searchable(), self::statusColumn('type'), self::statusColumn('status'), TextColumn::make('mime_type'), TextColumn::make('size_bytes')->numeric()->sortable(), TextColumn::make('created_at')->dateTime()->sortable()])
                ->filters([SelectFilter::make('type')->options(self::enumOptions(MediaType::class)), SelectFilter::make('status')->options(self::enumOptions(MediaStatus::class)), TrashedFilter::make()])
                ->defaultSort('created_at', 'desc'),
            'Order' => $table
                ->columns([TextColumn::make('user.email')->searchable(), TextColumn::make('gift.title')->searchable(), TextColumn::make('plan.name'), self::statusColumn('status'), TextColumn::make('amount_cents')->label('Valor')->money('BRL', divideBy: 100, locale: 'pt_BR')->sortable(), TextColumn::make('currency'), TextColumn::make('provider')->searchable(), TextColumn::make('provider_reference')->searchable()->copyable(), TextColumn::make('paid_at')->dateTime()->sortable(), TextColumn::make('created_at')->dateTime()->sortable()])
                ->filters([SelectFilter::make('status')->options(self::enumOptions(OrderStatus::class)), SelectFilter::make('provider')->options(fn (): array => Order::query()->whereNotNull('provider')->distinct()->pluck('provider', 'provider')->all())])
                ->defaultSort('created_at', 'desc'),
            'Payment' => $table
                ->columns([TextColumn::make('order.provider_reference')->searchable(), self::statusColumn('status'), TextColumn::make('provider')->searchable(), TextColumn::make('provider_payment_id')->searchable()->copyable(), TextColumn::make('amount_cents')->label('Valor')->money('BRL', divideBy: 100, locale: 'pt_BR')->sortable(), TextColumn::make('currency'), TextColumn::make('processed_at')->dateTime()->sortable(), TextColumn::make('created_at')->dateTime()->sortable()])
                ->filters([SelectFilter::make('status')->options(self::enumOptions(PaymentStatus::class)), SelectFilter::make('provider')->options(fn (): array => Payment::query()->whereNotNull('provider')->distinct()->pluck('provider', 'provider')->all())])
                ->defaultSort('created_at', 'desc'),
            'GiftVisit' => $table
                ->columns([TextColumn::make('gift.title')->searchable(), TextColumn::make('session_hash')->copyable()->toggleable(isToggledHiddenByDefault: true), TextColumn::make('ip_hash')->copyable()->toggleable(isToggledHiddenByDefault: true), TextColumn::make('referrer')->searchable()->limit(40), TextColumn::make('opened_at')->dateTime()->sortable()])
                ->filters([SelectFilter::make('gift_id')->relationship('gift', 'title')->searchable()->preload(), self::dateRangeFilter('opened_at')])
                ->defaultSort('opened_at', 'desc'),
            'GiftEvent' => $table
                ->columns([TextColumn::make('gift.title')->searchable(), TextColumn::make('user.email')->searchable(), TextColumn::make('event_type')->searchable()->badge(), TextColumn::make('occurred_at')->dateTime()->sortable()])
                ->filters([SelectFilter::make('event_type')->options(fn (): array => GiftEvent::query()->distinct()->pluck('event_type', 'event_type')->all()), SelectFilter::make('gift_id')->relationship('gift', 'title')->searchable()->preload(), self::dateRangeFilter('occurred_at')])
                ->defaultSort('occurred_at', 'desc'),
            default => $table,
        };

        return $table
            ->recordActions(self::recordActions($key))
            ->toolbarActions(self::toolbarActions($key));
    }

    /**
     * @return array<int, mixed>
     */
    protected static function recordActions(string $key): array
    {
        $actions = [ViewAction::make()];

        if (self::resourceOptions($key)['edit'] ?? true) {
            $actions[] = EditAction::make();
        }

        if ($key === 'ThemeVersion') {
            array_push($actions, self::publishThemeVersionAction(), self::archiveThemeVersionAction());
        }

        if ($key === 'TemplateVersion') {
            array_push($actions, self::publishTemplateVersionAction(), self::archiveTemplateVersionAction(), self::duplicateTemplateVersionAction());
        }

        if ($key === 'Gift') {
            array_push($actions, self::createTemplateFromGiftAction(), self::disableGiftAction(), self::reactivateGiftAction(), self::expireGiftAction());
        }

        if (self::resourceOptions($key)['delete'] ?? false) {
            $actions[] = DeleteAction::make();
        }

        return $actions;
    }

    /**
     * @return array<int, mixed>
     */
    protected static function toolbarActions(string $key): array
    {
        if (! (self::resourceOptions($key)['delete'] ?? false)) {
            return [];
        }

        return [
            BulkActionGroup::make([
                DeleteBulkAction::make(),
            ]),
        ];
    }

    protected static function publishThemeVersionAction(): Action
    {
        return Action::make('publish')
            ->label('Publicar')
            ->icon(Heroicon::OutlinedRocketLaunch)
            ->color('success')
            ->requiresConfirmation()
            ->visible(fn (ThemeVersion $record): bool => $record->status !== ThemeVersionStatus::Published)
            ->action(function (ThemeVersion $record): void {
                DB::transaction(function () use ($record): void {
                    ThemeVersion::query()
                        ->where('theme_id', $record->theme_id)
                        ->whereKeyNot($record->getKey())
                        ->where('status', ThemeVersionStatus::Published->value)
                        ->update(['status' => ThemeVersionStatus::Archived->value]);

                    $record->forceFill([
                        'status' => ThemeVersionStatus::Published,
                        'published_at' => now(),
                    ])->save();
                });
            });
    }

    protected static function archiveThemeVersionAction(): Action
    {
        return Action::make('archive')
            ->label('Arquivar')
            ->icon(Heroicon::OutlinedArchiveBox)
            ->color('gray')
            ->requiresConfirmation()
            ->visible(fn (ThemeVersion $record): bool => $record->status !== ThemeVersionStatus::Archived)
            ->action(fn (ThemeVersion $record) => $record->forceFill(['status' => ThemeVersionStatus::Archived])->save());
    }

    protected static function publishTemplateVersionAction(): Action
    {
        return Action::make('publish')
            ->label('Publicar')
            ->icon(Heroicon::OutlinedRocketLaunch)
            ->color('success')
            ->requiresConfirmation()
            ->visible(fn (TemplateVersion $record): bool => $record->status !== TemplateVersionStatus::Published)
            ->action(function (TemplateVersion $record): void {
                DB::transaction(function () use ($record): void {
                    TemplateVersion::query()
                        ->where('template_id', $record->template_id)
                        ->whereKeyNot($record->getKey())
                        ->where('status', TemplateVersionStatus::Published->value)
                        ->update(['status' => TemplateVersionStatus::Archived->value]);

                    $record->forceFill([
                        'status' => TemplateVersionStatus::Published,
                        'published_at' => now(),
                    ])->save();
                });
            });
    }

    protected static function archiveTemplateVersionAction(): Action
    {
        return Action::make('archive')
            ->label('Arquivar')
            ->icon(Heroicon::OutlinedArchiveBox)
            ->color('gray')
            ->requiresConfirmation()
            ->visible(fn (TemplateVersion $record): bool => $record->status !== TemplateVersionStatus::Archived)
            ->action(fn (TemplateVersion $record) => $record->forceFill(['status' => TemplateVersionStatus::Archived])->save());
    }

    protected static function duplicateTemplateVersionAction(): Action
    {
        return Action::make('duplicate')
            ->label('Duplicar')
            ->icon(Heroicon::OutlinedDocumentDuplicate)
            ->color('gray')
            ->requiresConfirmation()
            ->action(function (TemplateVersion $record): void {
                DB::transaction(function () use ($record): void {
                    $copy = $record->replicate(['id', 'status', 'version_number', 'published_at', 'created_at', 'updated_at']);
                    $copy->version_number = ((int) TemplateVersion::query()->where('template_id', $record->template_id)->max('version_number')) + 1;
                    $copy->status = TemplateVersionStatus::Draft;
                    $copy->published_at = null;
                    $copy->name = "{$record->name} (cópia)";
                    $copy->save();

                    $record->pages()->get()->each(function (TemplatePage $page) use ($copy): void {
                        $pageCopy = $page->replicate(['id', 'template_version_id', 'created_at', 'updated_at']);
                        $pageCopy->template_version_id = $copy->id;
                        $pageCopy->save();
                    });
                });
            });
    }

    protected static function createTemplateFromGiftAction(): Action
    {
        return Action::make('createTemplateFromGift')
            ->label('Criar template')
            ->icon(Heroicon::OutlinedDocumentDuplicate)
            ->color('success')
            ->visible(fn (): bool => AdminAccess::isAdmin())
            ->modalHeading('Criar template a partir deste gift')
            ->modalDescription('Use esta ação depois de montar o Gift no editor visual. Fotos pessoais viram placeholders e mídias do usuário não são copiadas.')
            ->modalSubmitActionLabel('Criar template')
            ->fillForm(fn (Gift $record): array => [
                'name' => trim((string) $record->title) !== '' ? $record->title : 'Novo template visual',
                'slug' => Str::slug(trim((string) $record->title) !== '' ? $record->title : 'novo-template-visual'),
                'description' => null,
                'occasion_id' => $record->occasion_id,
                'theme_version_id' => $record->theme_version_id,
                'status' => TemplateVersionStatus::Draft->value,
                'sort_order' => 0,
            ])
            ->schema([
                TextInput::make('name')
                    ->label('Nome do template')
                    ->required()
                    ->maxLength(255),
                TextInput::make('slug')
                    ->label('Slug')
                    ->required()
                    ->maxLength(255)
                    ->rules(['regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/', 'unique:templates,slug'])
                    ->helperText('Use letras minúsculas, números e hífens. Exemplo: amor-polaroid-delicado.'),
                Textarea::make('description')
                    ->label('Descrição')
                    ->rows(3)
                    ->columnSpanFull(),
                Select::make('occasion_id')
                    ->label('Ocasião')
                    ->options(fn (): array => Occasion::query()->orderBy('sort_order')->orderBy('name')->pluck('name', 'id')->all())
                    ->searchable()
                    ->required(),
                Select::make('theme_version_id')
                    ->label('Tema usado pelo template')
                    ->options(fn (): array => ThemeVersion::query()->with('theme')->orderByDesc('published_at')->orderByDesc('version_number')->get()->mapWithKeys(fn (ThemeVersion $themeVersion): array => [
                        $themeVersion->id => trim(($themeVersion->theme?->name ? $themeVersion->theme->name.' - ' : '')."v{$themeVersion->version_number} {$themeVersion->name}"),
                    ])->all())
                    ->searchable()
                    ->required()
                    ->helperText('O template nasce com este tema. Se publicar depois, prefira uma ThemeVersion publicada e ativa.'),
                Select::make('status')
                    ->label('Status inicial da versão')
                    ->options([
                        TemplateVersionStatus::Draft->value => 'Draft (recomendado)',
                        TemplateVersionStatus::Published->value => 'Publicado',
                    ])
                    ->default(TemplateVersionStatus::Draft->value)
                    ->required()
                    ->helperText('Draft é mais seguro: revise o template antes de liberar no fluxo /criar.'),
                self::integerField('sort_order')
                    ->label('Ordem na listagem')
                    ->default(0)
                    ->minValue(0),
            ])
            ->action(function (Gift $record, array $data): void {
                $template = app(CreateTemplateFromGift::class)->handle(
                    AdminAccess::user(),
                    $record,
                    $data,
                );

                Notification::make()
                    ->title('Template criado')
                    ->body("{$template->name} foi criado com uma versão ".Str::of((string) $data['status'])->replace('_', ' ')->lower().'.')
                    ->success()
                    ->send();
            });
    }

    protected static function disableGiftAction(): Action
    {
        return Action::make('disable')
            ->label('Desativar')
            ->icon(Heroicon::OutlinedNoSymbol)
            ->color('danger')
            ->requiresConfirmation()
            ->visible(fn (Gift $record): bool => $record->status !== GiftStatus::Disabled)
            ->action(fn (Gift $record) => $record->forceFill(['status' => GiftStatus::Disabled])->save());
    }

    protected static function reactivateGiftAction(): Action
    {
        return Action::make('reactivate')
            ->label('Reativar')
            ->icon(Heroicon::OutlinedArrowPath)
            ->color('success')
            ->requiresConfirmation()
            ->visible(fn (Gift $record): bool => $record->status === GiftStatus::Disabled && ($record->expires_at === null || $record->expires_at->isFuture()))
            ->action(function (Gift $record): void {
                $record->forceFill([
                    'status' => $record->published_at ? GiftStatus::Published : GiftStatus::Draft,
                ])->save();
            });
    }

    protected static function expireGiftAction(): Action
    {
        return Action::make('expire')
            ->label('Expirar')
            ->icon(Heroicon::OutlinedClock)
            ->color('warning')
            ->requiresConfirmation()
            ->visible(fn (Gift $record): bool => $record->status !== GiftStatus::Expired)
            ->action(fn (Gift $record) => $record->forceFill(['status' => GiftStatus::Expired, 'expires_at' => now()])->save());
    }

    protected static function nameField(): TextInput
    {
        return TextInput::make('name')->required()->maxLength(255);
    }

    protected static function slugField(bool $required = true): TextInput
    {
        $field = TextInput::make('slug')
            ->maxLength(255)
            ->unique(ignoreRecord: true);

        return $required ? $field->required() : $field;
    }

    protected static function integerField(string $name): TextInput
    {
        return TextInput::make($name)->integer();
    }

    /**
     * @param  class-string<BackedEnum>  $enum
     */
    protected static function enumSelect(string $name, string $enum): Select
    {
        return Select::make($name)->options(self::enumOptions($enum));
    }

    /**
     * @param  class-string<BackedEnum>  $enum
     * @return array<string, string>
     */
    protected static function enumOptions(string $enum): array
    {
        return collect($enum::cases())
            ->mapWithKeys(fn (BackedEnum $case): array => [$case->value => Str::of($case->value)->replace('_', ' ')->headline()->toString()])
            ->all();
    }

    protected static function jsonField(string $name, bool $required = false, mixed $default = null): CodeEditor
    {
        $field = CodeEditor::make($name)
            ->language(Language::Json)
            ->formatStateUsing(fn (mixed $state): ?string => self::jsonForEditing($state))
            ->dehydrateStateUsing(fn (?string $state): mixed => self::jsonFromEditing($state))
            ->rules([$required ? 'required' : 'nullable', 'json'])
            ->columnSpanFull();

        if ($default !== null) {
            $field->default(self::jsonForEditing($default));
        }

        if ($required) {
            $field->required();
        }

        return $field;
    }

    /**
     * @return array<string, mixed>
     */
    protected static function defaultCanvas(): array
    {
        return [
            'schemaVersion' => 1,
            'version' => 1,
            'artboard' => [
                'width' => CanvasNormalizer::DEFAULT_WIDTH,
                'height' => CanvasNormalizer::DEFAULT_HEIGHT,
                'unit' => 'px',
                'background' => ['type' => 'theme'],
                'safeArea' => CanvasNormalizer::DEFAULT_SAFE_AREA,
            ],
            'elements' => [],
        ];
    }

    protected static function readonlyNotice(string $message): Textarea
    {
        return Textarea::make('notice')
            ->label('Observação')
            ->default($message)
            ->disabled()
            ->dehydrated(false)
            ->columnSpanFull();
    }

    protected static function statusColumn(string $name): TextColumn
    {
        return TextColumn::make($name)
            ->badge()
            ->formatStateUsing(fn (mixed $state): string => self::formatEnumState($state));
    }

    protected static function statusEntry(string $name): TextEntry
    {
        return TextEntry::make($name)
            ->badge()
            ->formatStateUsing(fn (mixed $state): string => self::formatEnumState($state));
    }

    protected static function jsonEntry(string $name): TextEntry
    {
        return TextEntry::make($name)
            ->formatStateUsing(fn (mixed $state): ?string => self::jsonForEditing($state))
            ->copyable()
            ->columnSpanFull()
            ->placeholder('Sem dados');
    }

    /**
     * @return array<int, TextEntry>
     */
    protected static function timestamps(): array
    {
        return [
            TextEntry::make('created_at')->dateTime(),
            TextEntry::make('updated_at')->dateTime(),
        ];
    }

    protected static function dateRangeFilter(string $column): Filter
    {
        return Filter::make($column)
            ->schema([
                DatePicker::make('from')->label('De'),
                DatePicker::make('until')->label('Até'),
            ])
            ->query(fn (Builder $query, array $data): Builder => $query
                ->when($data['from'] ?? null, fn (Builder $query, string $date): Builder => $query->whereDate($column, '>=', $date))
                ->when($data['until'] ?? null, fn (Builder $query, string $date): Builder => $query->whereDate($column, '<=', $date)));
    }

    protected static function keyFromClass(string $class): string
    {
        $base = class_basename($class);

        if (str_ends_with($base, 'Resource')) {
            return str($base)->beforeLast('Resource')->toString();
        }

        if (str_ends_with($base, 'Form')) {
            return str($base)->beforeLast('Form')->toString();
        }

        if (str_ends_with($base, 'Infolist')) {
            return str($base)->beforeLast('Infolist')->toString();
        }

        if (str_ends_with($base, 'Table')) {
            return Str::singular(str($base)->beforeLast('Table')->toString());
        }

        return $base;
    }

    protected static function jsonForEditing(mixed $state): ?string
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

    protected static function jsonFromEditing(?string $state): mixed
    {
        if ($state === null || trim($state) === '') {
            return null;
        }

        return json_decode($state, true);
    }

    protected static function formatEnumState(mixed $state): string
    {
        if ($state instanceof BackedEnum) {
            $state = $state->value;
        }

        return Str::of((string) $state)->replace('_', ' ')->headline()->toString();
    }

    protected static function publishedVersionLabel($versions): string
    {
        $published = $versions->first(fn (Model $version): bool => ($version->status instanceof BackedEnum ? $version->status->value : $version->status) === 'published');

        if (! $published) {
            return 'Nenhuma';
        }

        return "v{$published->version_number} - {$published->name}";
    }

    protected static function assetThemeUsageLabel(Asset $asset): string
    {
        $themeVersions = $asset->themeVersions()
            ->with('theme')
            ->orderBy('theme_versions.version_number')
            ->get();

        if ($themeVersions->isEmpty()) {
            return 'Global: aparece em todos os temas ativos no editor.';
        }

        return $themeVersions
            ->map(function (ThemeVersion $themeVersion): string {
                $role = (string) ($themeVersion->pivot?->role ?: ThemeAssetRoles::STICKER);
                $themeName = $themeVersion->theme?->name ?: 'Tema sem nome';

                return "{$themeName} v{$themeVersion->version_number}: ".ThemeAssetRoles::label($role);
            })
            ->implode('; ');
    }

    protected static function canvasSummary(mixed $canvas): string
    {
        if (! is_array($canvas)) {
            return 'Canvas vazio ou inválido.';
        }

        $artboard = is_array($canvas['artboard'] ?? null) ? $canvas['artboard'] : [];
        $elements = is_array($canvas['elements'] ?? null) ? $canvas['elements'] : [];
        $width = $artboard['width'] ?? '?';
        $height = $artboard['height'] ?? '?';
        $textCount = collect($elements)->filter(fn (mixed $element): bool => is_array($element) && ($element['type'] ?? null) === 'text')->count();
        $imageCount = collect($elements)->filter(fn (mixed $element): bool => is_array($element) && ($element['type'] ?? null) === 'image')->count();
        $stickerCount = collect($elements)->filter(fn (mixed $element): bool => is_array($element) && ($element['type'] ?? null) === 'sticker')->count();

        return "Artboard {$width}x{$height}; ".count($elements)." elementos; {$textCount} textos; {$imageCount} imagens/placeholders; {$stickerCount} adesivos.";
    }

    protected static function storageUrl(Model $record): ?string
    {
        if ($record instanceof Asset) {
            return app(AssetUrlResolver::class)->previewUrl($record);
        }

        if (! filled($record->storage_path)) {
            return null;
        }

        try {
            return Storage::disk($record->storage_disk ?: 'public')->url($record->storage_path);
        } catch (Throwable) {
            return null;
        }
    }
}
