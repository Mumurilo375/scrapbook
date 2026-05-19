import { LoaderCircle, Search, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';

import { AssetVisual, normalizeThemeConfig, type ThemeConfigInput } from '../../../../components/renderer';
import type { EditorAsset, EditorAssetCategory, SaveStatus } from './editorTypes';

type AssetLibraryStatus = 'loading' | 'ready' | 'error';

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

    return (
        <section className="grid min-w-0 gap-4">
            <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                    <h2 className="text-base font-semibold text-[#1F150A]">Adesivos</h2>
                    <p className="text-xs font-semibold uppercase text-[#7A2634]">{statusLabel(status, saveStatus)}</p>
                </div>
                <Sparkles aria-hidden="true" className="h-5 w-5 shrink-0 text-[#7A2634]" />
            </div>
            <p className="text-sm font-semibold text-[#5F4636]">Clique em um adesivo para adicionar à página.</p>

            <label className="relative block">
                <span className="sr-only">Buscar adesivo</span>
                <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#7A5A43]" />
                <input
                    className="h-10 w-full rounded-[6px] border border-[#CBA980] bg-white pr-3 pl-9 text-sm font-semibold text-[#1F150A] outline-none transition placeholder:text-[#8E735F] focus:border-[#D93632] focus:ring-2 focus:ring-[#D9363226]"
                    disabled={status === 'loading'}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Buscar adesivo"
                    type="search"
                    value={query}
                />
            </label>

            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
                <CategoryButton active={categorySlug === null} label="Todos" onClick={() => setCategorySlug(null)} />
                {categories.map((category) => (
                    <CategoryButton
                        active={categorySlug === category.slug}
                        key={category.id}
                        label={category.name}
                        onClick={() => setCategorySlug(category.slug)}
                    />
                ))}
            </div>

            {status === 'loading' ? (
                <div
                    className="inline-flex items-center gap-2 rounded-[8px] border border-dashed border-[#CBA980] bg-[#FFFBF6] p-4 text-sm font-semibold text-[#6F5A4A]"
                    role="status"
                >
                    <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" />
                    Carregando adesivos...
                </div>
            ) : null}

            {status === 'error' ? (
                <div
                    className="grid gap-3 rounded-[8px] border border-[#E2A08E] bg-[#FFF5F0] p-4 text-sm font-semibold text-[#7A2634]"
                    role="alert"
                >
                    <p>{error ?? 'Não foi possível carregar os adesivos.'}</p>
                    <button
                        className="inline-flex min-h-9 w-fit items-center rounded-[6px] border border-[#CBA980] bg-white px-3 text-sm font-semibold text-[#42291D]"
                        onClick={onRetry}
                        type="button"
                    >
                        Tentar novamente
                    </button>
                </div>
            ) : null}

            {status === 'ready' && filteredAssets.length === 0 ? (
                <div className="grid gap-3 rounded-[8px] border border-dashed border-[#CBA980] bg-[#FFFBF6] p-4 text-sm font-semibold text-[#6F5A4A]">
                    <p>{emptyMessage(assets.length, query, categorySlug)}</p>
                    {query.trim() !== '' || categorySlug ? (
                        <button
                            className="min-h-9 w-fit rounded-[6px] border border-[#CBA980] bg-white px-3 text-sm font-semibold text-[#42291D] hover:bg-[#F6E4CF]"
                            onClick={() => {
                                setQuery('');
                                setCategorySlug(null);
                            }}
                            type="button"
                        >
                            Limpar filtros
                        </button>
                    ) : null}
                </div>
            ) : null}

            {status === 'ready' && filteredAssets.length > 0 ? (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {filteredAssets.map((asset) => (
                        <button
                            aria-label={`Adicionar adesivo ${asset.name}`}
                            className="group grid min-h-[122px] gap-2 rounded-[8px] border border-[#D8B991] bg-[#FFFBF6] p-2 text-left transition hover:border-[#B87358] hover:bg-white disabled:cursor-not-allowed disabled:opacity-55"
                            disabled={disabled}
                            key={asset.id}
                            onClick={() => onAddAsset(asset)}
                            type="button"
                        >
                            <span className="flex aspect-square items-center justify-center rounded-[6px] bg-[#FFF8EF] p-2">
                                <AssetVisual asset={asset} theme={normalizedTheme} />
                            </span>
                            <span className="min-w-0">
                                <span className="block truncate text-xs font-semibold text-[#1F150A]">{asset.name}</span>
                                <span className="mt-0.5 block truncate text-[11px] font-semibold uppercase text-[#7A5A43]">
                                    {asset.isThemeAsset ? 'Tema atual' : asset.category?.name ?? assetTypeLabel(asset.type)}
                                </span>
                            </span>
                        </button>
                    ))}
                </div>
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
            className={`h-9 shrink-0 rounded-[999px] border px-3 text-xs font-semibold transition ${
                active
                    ? 'border-[#7A2634] bg-[#FFF0EC] text-[#7A2634]'
                    : 'border-[#CBA980] bg-white text-[#42291D] hover:bg-[#F6E4CF]'
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
