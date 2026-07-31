import { LoaderCircle, Search, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';

import { AssetVisual, normalizeThemeConfig, type ThemeConfigInput } from '../../../../components/renderer';
import type { EditorAsset, EditorAssetCategory, SaveStatus } from './editorTypes';

type AssetLibraryStatus = 'loading' | 'ready' | 'error';

const ASSET_PREVIEW_BATCH_SIZE = 36;

type GiftAssetsPanelProps = {
    assets: EditorAsset[];
    categories: EditorAssetCategory[];
    disabled: boolean;
    error: string | null;
    onAddAsset: (asset: EditorAsset) => void;
    onRetry: () => void;
    saveStatus: SaveStatus;
    status: AssetLibraryStatus;
    theme?: ThemeConfigInput;
};

export function GiftAssetsPanel({
    assets,
    categories,
    disabled,
    error,
    onAddAsset,
    onRetry,
    saveStatus,
    status,
    theme,
}: GiftAssetsPanelProps) {
    const normalizedTheme = useMemo(() => normalizeThemeConfig(theme), [theme]);
    const [query, setQuery] = useState('');
    const [categorySlug, setCategorySlug] = useState<string | null>(null);
    const [visibleLimit, setVisibleLimit] = useState(ASSET_PREVIEW_BATCH_SIZE);
    const filteredAssets = useMemo(() => {
        const needle = query.trim().toLowerCase();

        return assets.filter((asset) => {
            if (categorySlug && asset.category?.slug !== categorySlug) {
                return false;
            }

            if (needle === '') {
                return true;
            }

            return searchableText(asset).includes(needle);
        });
    }, [assets, categorySlug, query]);
    const visibleAssets = filteredAssets.slice(0, visibleLimit);
    const hasMoreAssets = visibleLimit < filteredAssets.length;

    return (
        <section
            aria-labelledby="gift-assets-panel-title"
            className="gift-editor-inspector -m-4 min-w-0 overflow-hidden rounded-[16px_4px_16px_16px] bg-white text-[#342E38]"
        >
            <header className="gift-editor-inspector-header px-4 py-5">
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                        <h2
                            className="font-display text-lg font-bold tracking-[-0.02em] text-[#21162D]"
                            id="gift-assets-panel-title"
                        >
                            Adesivos
                        </h2>
                        <p className="mt-1 max-w-[32ch] text-sm leading-5 text-[#645D68]">
                            Escolha um recorte para adicionar à página.
                        </p>
                    </div>
                    <Sparkles aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-[#FF765B]" />
                </div>
                <p className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-[#746D78]" role="status">
                    <span
                        aria-hidden="true"
                        className={`h-2 w-2 rounded-full ${
                            status === 'error'
                                ? 'bg-[#C63C43]'
                                : status === 'loading' || saveStatus === 'saving'
                                  ? 'bg-[#B86C22]'
                                  : 'bg-[#357263]'
                        }`}
                    />
                    {statusLabel(status, saveStatus)}
                </p>
            </header>

            <div className="gift-editor-inspector-section border-t border-[#DDD7E0] px-4 py-4">
                <label className="relative block">
                    <span className="mb-2 block text-xs font-bold text-[#342E38]">Buscar na coleção</span>
                    <Search
                        aria-hidden="true"
                        className="pointer-events-none absolute bottom-3.5 left-3.5 h-4 w-4 text-[#746D78]"
                    />
                    <input
                        className="gift-editor-inspector-field h-11 w-full rounded-[6px] border border-[#978E9C] bg-white pr-3 pl-10 text-sm font-medium text-[#342E38] outline-none transition placeholder:text-[#746D78] focus:border-[#21162D] focus:ring-2 focus:ring-[#FF765B66] disabled:cursor-not-allowed disabled:bg-[#EFEBF3]"
                        disabled={status === 'loading'}
                        onChange={(event) => {
                            setQuery(event.target.value);
                            setVisibleLimit(ASSET_PREVIEW_BATCH_SIZE);
                        }}
                        placeholder="Nome, tipo ou tema"
                        type="search"
                        value={query}
                    />
                </label>

                <div
                    aria-label="Filtrar adesivos por categoria"
                    className="gift-editor-inspector-filters -mx-1 mt-3 flex gap-1 overflow-x-auto px-1"
                >
                    <CategoryButton
                        active={categorySlug === null}
                        label="Todos"
                        onClick={() => {
                            setCategorySlug(null);
                            setVisibleLimit(ASSET_PREVIEW_BATCH_SIZE);
                        }}
                    />
                    {categories.map((category) => (
                        <CategoryButton
                            active={categorySlug === category.slug}
                            key={category.id}
                            label={category.name}
                            onClick={() => {
                                setCategorySlug(category.slug);
                                setVisibleLimit(ASSET_PREVIEW_BATCH_SIZE);
                            }}
                        />
                    ))}
                </div>
            </div>

            <div className="gift-editor-inspector-section border-t border-[#DDD7E0] px-4 py-4">
                <div className="mb-3 flex min-h-5 items-baseline justify-between gap-3">
                    <h3 className="text-sm font-bold text-[#21162D]">Coleção disponível</h3>
                    {status === 'ready' ? (
                        <span className="shrink-0 text-xs font-semibold text-[#746D78]">
                            {assetCountLabel(filteredAssets.length)}
                        </span>
                    ) : null}
                </div>

                {status === 'loading' ? (
                    <div
                        className="flex min-h-32 items-center justify-center gap-2 border-y border-dashed border-[#C9C1CD] text-sm font-semibold text-[#342E38]"
                        role="status"
                    >
                        <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" />
                        Carregando adesivos...
                    </div>
                ) : null}

                {status === 'error' ? (
                    <div
                        className="grid gap-3 rounded-[6px] border border-[#DFA69B] bg-[#FFF2EF] p-4 text-sm font-semibold text-[#7C3024]"
                        role="alert"
                    >
                        <p>{error ?? 'Não foi possível carregar os adesivos.'}</p>
                        <button
                            className="inline-flex h-11 w-fit items-center rounded-[5px] border border-[#978E9C] bg-white px-3 text-sm font-bold text-[#21162D] outline-none transition hover:border-[#21162D] hover:bg-[#EFEBF3] focus-visible:ring-2 focus-visible:ring-[#21162D] focus-visible:ring-offset-2"
                            onClick={onRetry}
                            type="button"
                        >
                            Tentar novamente
                        </button>
                    </div>
                ) : null}

                {status === 'ready' && filteredAssets.length === 0 ? (
                    <div className="grid min-h-32 place-content-center gap-3 border-y border-dashed border-[#C9C1CD] px-3 py-5 text-center text-sm font-semibold text-[#342E38]">
                        <p>{emptyMessage(assets.length, query, categorySlug)}</p>
                        {query.trim() !== '' || categorySlug ? (
                            <button
                                className="mx-auto h-11 w-fit rounded-[5px] border border-[#978E9C] bg-white px-3 text-sm font-bold text-[#21162D] outline-none transition hover:border-[#21162D] hover:bg-[#F8F6FA] focus-visible:ring-2 focus-visible:ring-[#21162D] focus-visible:ring-offset-2"
                                onClick={() => {
                                    setQuery('');
                                    setCategorySlug(null);
                                    setVisibleLimit(ASSET_PREVIEW_BATCH_SIZE);
                                }}
                                type="button"
                            >
                                Limpar filtros
                            </button>
                        ) : null}
                    </div>
                ) : null}

                {status === 'ready' && filteredAssets.length > 0 ? (
                    <>
                        <div className="gift-editor-asset-grid grid grid-cols-3 gap-x-2 gap-y-4">
                            {visibleAssets.map((asset) => (
                                <button
                                    aria-label={`Adicionar adesivo ${asset.name}`}
                                    className="gift-editor-asset-tile group min-w-0 text-left outline-none disabled:cursor-not-allowed disabled:opacity-45"
                                    disabled={disabled}
                                    key={asset.id}
                                    onClick={() => onAddAsset(asset)}
                                    type="button"
                                >
                                    <span className="relative grid aspect-square place-items-center rounded-[4px] bg-[#F4F1F5] p-2.5 ring-1 ring-[#DDD7E0] ring-inset transition duration-150 group-hover:-translate-y-0.5 group-hover:bg-[#EFEBF3] group-hover:ring-[#978E9C] group-focus-visible:ring-[#21162D] motion-reduce:transform-none">
                                        <AssetVisual asset={asset} theme={normalizedTheme} />
                                    </span>
                                    <span className="mt-1.5 block min-w-0 px-0.5">
                                        <span className="block truncate text-xs font-bold text-[#21162D]">
                                            {asset.name}
                                        </span>
                                        <span className="mt-0.5 block truncate text-[11px] font-semibold text-[#746D78]">
                                            {asset.isThemeAsset
                                                ? 'Do tema'
                                                : (asset.category?.name ?? assetTypeLabel(asset.type))}
                                        </span>
                                    </span>
                                </button>
                            ))}
                        </div>
                        {hasMoreAssets ? (
                            <button
                                className="mt-4 h-11 w-full rounded-[5px] border border-[#978E9C] bg-white px-3 text-sm font-bold text-[#21162D] outline-none transition hover:border-[#21162D] hover:bg-[#EFEBF3] focus-visible:ring-2 focus-visible:ring-[#21162D] focus-visible:ring-offset-2"
                                onClick={() => setVisibleLimit((current) => current + ASSET_PREVIEW_BATCH_SIZE)}
                                type="button"
                            >
                                Mostrar mais adesivos
                            </button>
                        ) : null}
                    </>
                ) : null}
            </div>
        </section>
    );
}

type CategoryButtonProps = {
    active: boolean;
    label: string;
    onClick: () => void;
};

function CategoryButton({ active, label, onClick }: CategoryButtonProps) {
    return (
        <button
            aria-pressed={active}
            className={`h-11 shrink-0 border-x-0 border-t-0 border-b-2 px-3 text-xs font-bold outline-none transition focus-visible:ring-2 focus-visible:ring-[#21162D] focus-visible:ring-offset-[-2px] ${
                active
                    ? 'border-[#FF765B] bg-[#FFF7F4] text-[#21162D]'
                    : 'border-transparent bg-white text-[#645D68] hover:border-[#978E9C] hover:bg-[#F8F6FA] hover:text-[#21162D]'
            }`}
            onClick={onClick}
            type="button"
        >
            {label}
        </button>
    );
}

function assetCountLabel(count: number): string {
    return count === 1 ? '1 resultado' : `${count} resultados`;
}

function searchableText(asset: EditorAsset): string {
    const keywords = Array.isArray(asset.config?.keywords) ? asset.config.keywords : [];

    return [asset.name, asset.slug, asset.type, asset.category?.name, asset.category?.slug, ...keywords]
        .filter((value): value is string => typeof value === 'string')
        .join(' ')
        .toLowerCase();
}

function statusLabel(status: AssetLibraryStatus, saveStatus: SaveStatus): string {
    if (status === 'loading') {
        return 'Carregando biblioteca';
    }

    if (status === 'error') {
        return 'Biblioteca indisponível';
    }

    if (saveStatus === 'saving') {
        return 'Autosave ativo';
    }

    return 'Biblioteca pronta';
}

function emptyMessage(assetCount: number, query: string, categorySlug: string | null): string {
    if (assetCount === 0) {
        return 'Ainda não há adesivos disponíveis para este presente.';
    }

    if (query.trim() !== '' && categorySlug) {
        return 'Nenhum adesivo combina com esta busca e categoria.';
    }

    if (query.trim() !== '') {
        return 'Nenhum adesivo combina com esta busca.';
    }

    return 'Nenhum adesivo nesta categoria.';
}

function assetTypeLabel(type: string): string {
    const labels: Record<string, string> = {
        background: 'Fundo',
        border: 'Borda',
        decoration: 'Decoração',
        doodle: 'Rabisco',
        envelope: 'Envelope',
        flower: 'Flor',
        frame: 'Moldura',
        icon: 'Ícone',
        label: 'Etiqueta',
        overlay: 'Overlay',
        paper: 'Papel',
        shape: 'Forma',
        stamp: 'Selo',
        sticker: 'Adesivo',
        tape: 'Fita',
        texture: 'Textura',
    };

    return labels[type] ?? 'Decoração';
}
