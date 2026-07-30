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
        <section className="grid min-w-0 gap-4 text-[#342E38]">
            <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                    <h2 className="font-display text-lg font-bold tracking-[-0.02em] text-[#21162D]">Adesivos</h2>
                    <p className="mt-1 text-xs font-semibold text-[#746D78]">{statusLabel(status, saveStatus)}</p>
                </div>
                <Sparkles aria-hidden="true" className="h-5 w-5 shrink-0 text-[#FF765B]" />
            </div>
            <p className="text-sm leading-5 text-[#746D78]">Clique em um adesivo para adicionar à página.</p>

            <label className="relative block">
                <span className="sr-only">Buscar adesivo</span>
                <Search
                    aria-hidden="true"
                    className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#746D78]"
                />
                <input
                    className="h-10 w-full rounded-[6px] border border-[#978E9C] bg-white pr-3 pl-9 text-sm font-medium text-[#342E38] outline-none transition placeholder:text-[#746D78] focus:border-[#21162D] focus:ring-2 focus:ring-[#FF765B66] disabled:cursor-not-allowed disabled:bg-[#EFEBF3]"
                    disabled={status === 'loading'}
                    onChange={(event) => {
                        setQuery(event.target.value);
                        setVisibleLimit(ASSET_PREVIEW_BATCH_SIZE);
                    }}
                    placeholder="Buscar adesivo"
                    type="search"
                    value={query}
                />
            </label>

            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
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

            {status === 'loading' ? (
                <div
                    className="inline-flex items-center gap-2 rounded-[6px] border border-dashed border-[#C9C1CD] bg-[#EFEBF3] p-4 text-sm font-semibold text-[#342E38]"
                    role="status"
                >
                    <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" />
                    Carregando adesivos...
                </div>
            ) : null}

            {status === 'error' ? (
                <div
                    className="grid gap-3 rounded-[6px] border border-[#C85B47] bg-[#FFF2EF] p-4 text-sm font-semibold text-[#7C3024]"
                    role="alert"
                >
                    <p>{error ?? 'Não foi possível carregar os adesivos.'}</p>
                    <button
                        className="inline-flex min-h-10 w-fit items-center rounded-[5px] border border-[#978E9C] bg-white px-3 text-sm font-bold text-[#21162D] outline-none transition hover:border-[#21162D] hover:bg-[#EFEBF3] focus-visible:ring-2 focus-visible:ring-[#21162D] focus-visible:ring-offset-2"
                        onClick={onRetry}
                        type="button"
                    >
                        Tentar novamente
                    </button>
                </div>
            ) : null}

            {status === 'ready' && filteredAssets.length === 0 ? (
                <div className="grid gap-3 rounded-[6px] border border-dashed border-[#C9C1CD] bg-[#EFEBF3] p-4 text-sm font-semibold text-[#342E38]">
                    <p>{emptyMessage(assets.length, query, categorySlug)}</p>
                    {query.trim() !== '' || categorySlug ? (
                        <button
                            className="min-h-10 w-fit rounded-[5px] border border-[#978E9C] bg-white px-3 text-sm font-bold text-[#21162D] outline-none transition hover:border-[#21162D] hover:bg-[#F8F6FA] focus-visible:ring-2 focus-visible:ring-[#21162D] focus-visible:ring-offset-2"
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
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {visibleAssets.map((asset) => (
                            <button
                                aria-label={`Adicionar adesivo ${asset.name}`}
                                className="group grid min-h-[122px] gap-2 rounded-[7px] border border-[#978E9C] bg-white p-2 text-left outline-none transition hover:border-[#21162D] hover:bg-[#F8F6FA] focus-visible:ring-2 focus-visible:ring-[#21162D] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-[#EFEBF3] disabled:opacity-60"
                                disabled={disabled}
                                key={asset.id}
                                onClick={() => onAddAsset(asset)}
                                type="button"
                            >
                                <span className="flex aspect-square items-center justify-center rounded-[5px] bg-[#FBFAF6] p-2 transition group-hover:bg-[#EFEBF3]">
                                    <AssetVisual asset={asset} theme={normalizedTheme} />
                                </span>
                                <span className="min-w-0">
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
                            className="min-h-10 rounded-[5px] border border-[#978E9C] bg-white px-3 text-sm font-bold text-[#21162D] outline-none transition hover:border-[#21162D] hover:bg-[#EFEBF3] focus-visible:ring-2 focus-visible:ring-[#21162D] focus-visible:ring-offset-2"
                            onClick={() => setVisibleLimit((current) => current + ASSET_PREVIEW_BATCH_SIZE)}
                            type="button"
                        >
                            Mostrar mais adesivos
                        </button>
                    ) : null}
                </>
            ) : null}
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
            className={`h-10 shrink-0 rounded-[5px] border px-3 text-xs font-bold outline-none transition focus-visible:ring-2 focus-visible:ring-[#21162D] focus-visible:ring-offset-2 ${
                active
                    ? 'border-[#C94F39] bg-[#FF765B] text-[#21162D]'
                    : 'border-[#978E9C] bg-white text-[#342E38] hover:border-[#21162D] hover:bg-[#EFEBF3]'
            }`}
            onClick={onClick}
            type="button"
        >
            {label}
        </button>
    );
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
