import { Check, FileImage, LoaderCircle, RotateCcw } from 'lucide-react';
import { useMemo } from 'react';

import { normalizeThemeConfig, type ThemeConfigInput } from '../../../../components/renderer';
import type { Canvas } from '../../../../domain/canvas/schema';
import type { EditorAsset, SaveStatus } from './editorTypes';

type PageBackgroundLibraryStatus = 'loading' | 'ready' | 'error';

type GiftPageBackgroundPanelProps = {
    backgrounds: EditorAsset[];
    canvas: Canvas | null;
    disabled: boolean;
    error: string | null;
    onApplyAsset: (asset: EditorAsset) => void;
    onRetry: () => void;
    onUseTheme: () => void;
    saveStatus: SaveStatus;
    status: PageBackgroundLibraryStatus;
    theme?: ThemeConfigInput;
};

export function GiftPageBackgroundPanel({
    backgrounds,
    canvas,
    disabled,
    error,
    onApplyAsset,
    onRetry,
    onUseTheme,
    saveStatus,
    status,
    theme,
}: GiftPageBackgroundPanelProps) {
    const normalizedTheme = useMemo(() => normalizeThemeConfig(theme), [theme]);
    const currentBackground = canvas?.artboard.background;
    const currentAssetId = currentBackground?.type === 'asset' ? String(currentBackground.assetId) : null;
    const usingTheme = currentBackground?.type !== 'asset';

    return (
        <section className="grid min-w-0 gap-4 text-[#342E38]">
            <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                    <h2 className="font-display text-lg font-bold tracking-[-0.02em] text-[#21162D]">
                        Papel da página
                    </h2>
                    <p className="mt-1 text-xs font-semibold text-[#746D78]">
                        {statusLabel(status, saveStatus, usingTheme)}
                    </p>
                </div>
                <FileImage aria-hidden="true" className="h-5 w-5 shrink-0 text-[#FF765B]" />
            </div>

            <p className="text-sm leading-5 text-[#746D78]">
                Escolha o papel desta página. Isso muda o fundo da folha inteira, sem alterar os adesivos.
            </p>

            <button
                aria-pressed={usingTheme}
                className={`flex min-h-16 items-center gap-3 rounded-[7px] border p-2.5 text-left outline-none transition focus-visible:ring-2 focus-visible:ring-[#21162D] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${
                    usingTheme
                        ? 'border-[#C94F39] bg-[#FFF2EF]'
                        : 'border-[#978E9C] bg-white hover:border-[#21162D] hover:bg-[#F8F6FA]'
                }`}
                disabled={disabled}
                onClick={onUseTheme}
                type="button"
            >
                <span
                    aria-hidden="true"
                    className="relative block h-12 w-12 shrink-0 overflow-hidden rounded-[3px] border border-[#C9C1CD] shadow-[2px_3px_7px_rgba(33,22,45,0.16)]"
                    style={{
                        backgroundColor: normalizedTheme.page.backgroundColor,
                        backgroundImage:
                            'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.55) 1px, transparent 1.4px), radial-gradient(circle at 75% 35%, rgba(123,90,67,0.18) 0.8px, transparent 1.2px)',
                        backgroundSize: '18px 18px, 24px 24px',
                    }}
                />
                <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold text-[#21162D]">Usar papel do tema</span>
                    <span className="mt-0.5 block text-xs font-medium text-[#746D78]">
                        {usingTheme ? 'Selecionado' : 'Voltar ao padrão visual do tema'}
                    </span>
                </span>
                {usingTheme ? <Check aria-hidden="true" className="h-4 w-4 shrink-0 text-[#C94F39]" /> : null}
            </button>

            {status === 'loading' ? (
                <div
                    className="inline-flex items-center gap-2 rounded-[6px] border border-dashed border-[#C9C1CD] bg-[#EFEBF3] p-4 text-sm font-semibold text-[#342E38]"
                    role="status"
                >
                    <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" />
                    Carregando papéis...
                </div>
            ) : null}

            {status === 'error' ? (
                <div
                    className="grid gap-3 rounded-[6px] border border-[#C85B47] bg-[#FFF2EF] p-4 text-sm font-semibold text-[#7C3024]"
                    role="alert"
                >
                    <p>{error ?? 'Não foi possível carregar os papéis.'}</p>
                    <button
                        className="inline-flex min-h-10 w-fit items-center gap-2 rounded-[5px] border border-[#978E9C] bg-white px-3 text-sm font-bold text-[#21162D] outline-none transition hover:border-[#21162D] hover:bg-[#EFEBF3] focus-visible:ring-2 focus-visible:ring-[#21162D] focus-visible:ring-offset-2"
                        onClick={onRetry}
                        type="button"
                    >
                        <RotateCcw aria-hidden="true" className="h-4 w-4" />
                        Tentar novamente
                    </button>
                </div>
            ) : null}

            {status === 'ready' && backgrounds.length === 0 ? (
                <div className="rounded-[6px] border border-dashed border-[#C9C1CD] bg-[#EFEBF3] p-4 text-sm font-semibold text-[#342E38]">
                    Nenhum papel extra foi cadastrado para este presente.
                </div>
            ) : null}

            {status === 'ready' && backgrounds.length > 0 ? (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {backgrounds.map((asset) => {
                        const selected = currentAssetId === String(asset.id);
                        const previewUrl = safePreviewUrl(asset);

                        return (
                            <button
                                aria-label={`Usar papel ${asset.name}`}
                                aria-pressed={selected}
                                className={`group grid min-h-[126px] gap-2 rounded-[7px] border p-2 text-left outline-none transition focus-visible:ring-2 focus-visible:ring-[#21162D] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${
                                    selected
                                        ? 'border-[#C94F39] bg-[#FFF2EF]'
                                        : 'border-[#978E9C] bg-white hover:border-[#21162D] hover:bg-[#F8F6FA]'
                                }`}
                                disabled={disabled}
                                key={asset.id}
                                onClick={() => onApplyAsset(asset)}
                                type="button"
                            >
                                <span
                                    aria-hidden="true"
                                    className="relative block aspect-[4/5] overflow-hidden rounded-[3px] border border-[#C9C1CD] bg-[#FBFAF6] shadow-[2px_3px_7px_rgba(33,22,45,0.14)]"
                                >
                                    {previewUrl ? (
                                        <img
                                            alt=""
                                            className="h-full w-full object-cover"
                                            decoding="async"
                                            loading="lazy"
                                            src={previewUrl}
                                        />
                                    ) : null}
                                    {selected ? (
                                        <span className="absolute top-1 right-1 grid h-6 w-6 place-items-center rounded-full bg-[#FF765B] text-[#21162D] shadow-[1px_2px_4px_rgba(33,22,45,0.2)]">
                                            <Check aria-hidden="true" className="h-3.5 w-3.5" />
                                        </span>
                                    ) : null}
                                </span>
                                <span className="min-w-0">
                                    <span className="block truncate text-xs font-bold text-[#21162D]">
                                        {asset.name}
                                    </span>
                                    <span className="mt-0.5 block truncate text-[11px] font-semibold text-[#746D78]">
                                        {asset.isThemeAsset
                                            ? 'Papel do tema'
                                            : (asset.category?.name ?? pageBackgroundLabel(asset))}
                                    </span>
                                </span>
                            </button>
                        );
                    })}
                </div>
            ) : null}
        </section>
    );
}

function safePreviewUrl(asset: EditorAsset): string | null {
    if (
        typeof asset.previewUrl !== 'string' ||
        !asset.previewUrl.startsWith('/') ||
        asset.previewUrl.startsWith('//')
    ) {
        return null;
    }

    return asset.previewUrl;
}

function statusLabel(status: PageBackgroundLibraryStatus, saveStatus: SaveStatus, usingTheme: boolean): string {
    if (status === 'loading') {
        return 'Carregando papéis';
    }

    if (status === 'error') {
        return 'Papéis indisponíveis';
    }

    if (saveStatus === 'saving') {
        return 'Salvando papel';
    }

    return usingTheme ? 'Usando papel do tema' : 'Papel personalizado';
}

function pageBackgroundLabel(asset: EditorAsset): string {
    const labels: Record<string, string> = {
        background: 'Fundo de página',
        paper: 'Papel',
        texture: 'Textura',
    };

    return labels[asset.type] ?? 'Papel';
}
