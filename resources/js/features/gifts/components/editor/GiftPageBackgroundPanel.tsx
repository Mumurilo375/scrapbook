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
        <section className="grid min-w-0 gap-4">
            <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                    <h2 className="text-base font-semibold text-[#1F150A]">Página</h2>
                    <p className="text-xs font-semibold uppercase text-[#7A2634]">{statusLabel(status, saveStatus)}</p>
                </div>
                <FileImage aria-hidden="true" className="h-5 w-5 shrink-0 text-[#7A2634]" />
            </div>

            <p className="text-sm font-semibold text-[#5F4636]">
                Escolha o papel desta página. Isso muda o fundo da folha inteira, sem alterar os adesivos.
            </p>

            <button
                aria-pressed={usingTheme}
                className={`flex min-h-16 items-center gap-3 rounded-[8px] border p-2 text-left transition disabled:cursor-not-allowed disabled:opacity-55 ${
                    usingTheme
                        ? 'border-[#7A2634] bg-[#FFF0EC]'
                        : 'border-[#D8B991] bg-[#FFFBF6] hover:border-[#B87358] hover:bg-white'
                }`}
                disabled={disabled}
                onClick={onUseTheme}
                type="button"
            >
                <span
                    aria-hidden="true"
                    className="relative block h-12 w-12 shrink-0 overflow-hidden rounded-[6px] border border-[#D8B991]"
                    style={{
                        backgroundColor: normalizedTheme.page.backgroundColor,
                        backgroundImage:
                            'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.55) 1px, transparent 1.4px), radial-gradient(circle at 75% 35%, rgba(123,90,67,0.18) 0.8px, transparent 1.2px)',
                        backgroundSize: '18px 18px, 24px 24px',
                    }}
                />
                <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-[#1F150A]">Usar papel do tema</span>
                    <span className="mt-0.5 block text-xs font-semibold text-[#7A5A43]">
                        {usingTheme ? 'Selecionado' : 'Voltar ao padrão visual do tema'}
                    </span>
                </span>
                {usingTheme ? <Check aria-hidden="true" className="h-4 w-4 shrink-0 text-[#7A2634]" /> : null}
            </button>

            {status === 'loading' ? (
                <div
                    className="inline-flex items-center gap-2 rounded-[8px] border border-dashed border-[#CBA980] bg-[#FFFBF6] p-4 text-sm font-semibold text-[#6F5A4A]"
                    role="status"
                >
                    <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" />
                    Carregando papéis...
                </div>
            ) : null}

            {status === 'error' ? (
                <div
                    className="grid gap-3 rounded-[8px] border border-[#E2A08E] bg-[#FFF5F0] p-4 text-sm font-semibold text-[#7A2634]"
                    role="alert"
                >
                    <p>{error ?? 'Não foi possível carregar os papéis.'}</p>
                    <button
                        className="inline-flex min-h-9 w-fit items-center gap-2 rounded-[6px] border border-[#CBA980] bg-white px-3 text-sm font-semibold text-[#42291D]"
                        onClick={onRetry}
                        type="button"
                    >
                        <RotateCcw aria-hidden="true" className="h-4 w-4" />
                        Tentar novamente
                    </button>
                </div>
            ) : null}

            {status === 'ready' && backgrounds.length === 0 ? (
                <div className="rounded-[8px] border border-dashed border-[#CBA980] bg-[#FFFBF6] p-4 text-sm font-semibold text-[#6F5A4A]">
                    Nenhum papel extra foi cadastrado para este presente.
                </div>
            ) : null}

            {status === 'ready' && backgrounds.length > 0 ? (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {backgrounds.map((asset) => {
                        const selected = currentAssetId === String(asset.id);

                        return (
                            <button
                                aria-label={`Usar papel ${asset.name}`}
                                aria-pressed={selected}
                                className={`group grid min-h-[126px] gap-2 rounded-[8px] border p-2 text-left transition disabled:cursor-not-allowed disabled:opacity-55 ${
                                    selected
                                        ? 'border-[#7A2634] bg-[#FFF0EC]'
                                        : 'border-[#D8B991] bg-[#FFFBF6] hover:border-[#B87358] hover:bg-white'
                                }`}
                                disabled={disabled}
                                key={asset.id}
                                onClick={() => onApplyAsset(asset)}
                                type="button"
                            >
                                <span
                                    aria-hidden="true"
                                    className="relative block aspect-[4/5] overflow-hidden rounded-[6px] border border-[#D8B991] bg-[#FFF8EF]"
                                    style={paperPreviewStyle(asset)}
                                >
                                    {selected ? (
                                        <span className="absolute top-1 right-1 grid h-6 w-6 place-items-center rounded-full bg-[#7A2634] text-white shadow-sm">
                                            <Check aria-hidden="true" className="h-3.5 w-3.5" />
                                        </span>
                                    ) : null}
                                </span>
                                <span className="min-w-0">
                                    <span className="block truncate text-xs font-semibold text-[#1F150A]">{asset.name}</span>
                                    <span className="mt-0.5 block truncate text-[11px] font-semibold uppercase text-[#7A5A43]">
                                        {asset.isThemeAsset ? 'Tema atual' : asset.category?.name ?? pageBackgroundLabel(asset)}
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

function paperPreviewStyle(asset: EditorAsset) {
    if (typeof asset.previewUrl !== 'string' || !asset.previewUrl.startsWith('/') || asset.previewUrl.startsWith('//')) {
        return {};
    }

    return {
        backgroundImage: `url("${asset.previewUrl.replace(/"/g, '%22')}")`,
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
    };
}

function statusLabel(status: PageBackgroundLibraryStatus, saveStatus: SaveStatus): string {
    if (status === 'loading') {
        return 'Carregando papéis';
    }

    if (status === 'error') {
        return 'Papéis indisponíveis';
    }

    if (saveStatus === 'saving') {
        return 'Autosave ativo';
    }

    return 'Página atual';
}

function pageBackgroundLabel(asset: EditorAsset): string {
    const labels: Record<string, string> = {
        background: 'Fundo de página',
        paper: 'Papel',
        texture: 'Textura',
    };

    return labels[asset.type] ?? 'Papel';
}
