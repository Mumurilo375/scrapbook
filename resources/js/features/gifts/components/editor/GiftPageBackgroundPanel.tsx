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
        <section
            aria-labelledby="gift-page-background-title"
            className="gift-editor-inspector -m-4 min-w-0 overflow-hidden rounded-[16px_4px_16px_16px] bg-white text-[#342E38]"
        >
            <header className="gift-editor-inspector-header px-4 py-5">
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                        <h2
                            className="font-display text-lg font-bold tracking-[-0.02em] text-[#21162D]"
                            id="gift-page-background-title"
                        >
                            Papel da página
                        </h2>
                        <p className="mt-1 max-w-[34ch] text-sm leading-5 text-[#645D68]">
                            Troque o papel da folha sem alterar fotos, textos ou adesivos.
                        </p>
                    </div>
                    <FileImage aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-[#FF765B]" />
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
                    {statusLabel(status, saveStatus, usingTheme)}
                </p>
            </header>

            <div className="gift-editor-inspector-section border-t border-[#DDD7E0] px-4 py-4">
                <h3 className="text-sm font-bold text-[#21162D]">Papel do tema</h3>
                <button
                    aria-pressed={usingTheme}
                    className={`mt-2 grid min-h-[76px] w-full grid-cols-[52px_minmax(0,1fr)_20px] items-center gap-3 border-y px-1 py-2 text-left outline-none transition focus-visible:ring-2 focus-visible:ring-[#21162D] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-45 ${
                        usingTheme
                            ? 'border-[#FF765B] bg-[#FFF7F4]'
                            : 'border-[#DDD7E0] bg-white hover:border-[#978E9C] hover:bg-[#F8F6FA]'
                    }`}
                    disabled={disabled}
                    onClick={onUseTheme}
                    type="button"
                >
                    <span
                        aria-hidden="true"
                        className="relative block h-14 w-12 shrink-0 overflow-hidden rounded-[2px] shadow-[2px_4px_8px_rgba(33,22,45,0.18)] ring-1 ring-[#C9C1CD]"
                        style={{
                            backgroundBlendMode: 'soft-light, multiply',
                            backgroundColor: normalizedTheme.page.backgroundColor,
                            backgroundImage:
                                "linear-gradient(135deg, rgba(255,255,255,0.32), rgba(58,36,24,0.08)), url('/materials/cotton-paper.webp')",
                            backgroundPosition: 'center',
                            backgroundSize: 'cover',
                        }}
                    />
                    <span className="min-w-0">
                        <span className="block text-sm font-bold text-[#21162D]">Padrão do tema</span>
                        <span className="mt-0.5 block text-xs font-medium text-[#746D78]">
                            {usingTheme ? 'Aplicado nesta página' : 'Restaurar o papel original'}
                        </span>
                    </span>
                    {usingTheme ? <Check aria-hidden="true" className="h-4 w-4 text-[#C94F39]" /> : null}
                </button>
            </div>

            <div className="gift-editor-inspector-section border-t border-[#DDD7E0] px-4 py-4">
                <div className="mb-3 flex min-h-5 items-baseline justify-between gap-3">
                    <h3 className="text-sm font-bold text-[#21162D]">Outros papéis</h3>
                    {status === 'ready' ? (
                        <span className="shrink-0 text-xs font-semibold text-[#746D78]">
                            {paperCountLabel(backgrounds.length)}
                        </span>
                    ) : null}
                </div>

                {status === 'loading' ? (
                    <div
                        className="flex min-h-32 items-center justify-center gap-2 border-y border-dashed border-[#C9C1CD] text-sm font-semibold text-[#342E38]"
                        role="status"
                    >
                        <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" />
                        Carregando papéis...
                    </div>
                ) : null}

                {status === 'error' ? (
                    <div
                        className="grid gap-3 rounded-[6px] border border-[#DFA69B] bg-[#FFF2EF] p-4 text-sm font-semibold text-[#7C3024]"
                        role="alert"
                    >
                        <p>{error ?? 'Não foi possível carregar os papéis.'}</p>
                        <button
                            className="inline-flex h-11 w-fit items-center gap-2 rounded-[5px] border border-[#978E9C] bg-white px-3 text-sm font-bold text-[#21162D] outline-none transition hover:border-[#21162D] hover:bg-[#EFEBF3] focus-visible:ring-2 focus-visible:ring-[#21162D] focus-visible:ring-offset-2"
                            onClick={onRetry}
                            type="button"
                        >
                            <RotateCcw aria-hidden="true" className="h-4 w-4" />
                            Tentar novamente
                        </button>
                    </div>
                ) : null}

                {status === 'ready' && backgrounds.length === 0 ? (
                    <div className="grid min-h-32 place-content-center border-y border-dashed border-[#C9C1CD] px-4 py-5 text-center text-sm font-semibold text-[#342E38]">
                        Nenhum papel extra foi cadastrado para este presente.
                    </div>
                ) : null}

                {status === 'ready' && backgrounds.length > 0 ? (
                    <div className="gift-editor-paper-grid grid grid-cols-3 gap-x-2 gap-y-4">
                        {backgrounds.map((asset) => {
                            const selected = currentAssetId === String(asset.id);
                            const previewUrl = safePreviewUrl(asset);

                            return (
                                <button
                                    aria-label={`Usar papel ${asset.name}`}
                                    aria-pressed={selected}
                                    className="gift-editor-paper-tile group min-w-0 text-left outline-none disabled:cursor-not-allowed disabled:opacity-45"
                                    disabled={disabled}
                                    key={asset.id}
                                    onClick={() => onApplyAsset(asset)}
                                    type="button"
                                >
                                    <span
                                        aria-hidden="true"
                                        className={`relative mx-auto block aspect-[4/5] w-[82%] overflow-hidden rounded-[2px] bg-[#FBFAF6] shadow-[2px_5px_9px_rgba(33,22,45,0.16)] transition duration-150 group-hover:-translate-y-0.5 group-focus-visible:ring-2 group-focus-visible:ring-[#21162D] group-focus-visible:ring-offset-2 motion-reduce:transform-none ${
                                            selected
                                                ? 'ring-2 ring-[#FF765B] ring-offset-2 ring-offset-white'
                                                : 'ring-1 ring-[#C9C1CD]'
                                        }`}
                                    >
                                        <span
                                            className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-multiply"
                                            style={{ backgroundImage: "url('/materials/cotton-paper.webp')" }}
                                        />
                                        {previewUrl ? (
                                            <img
                                                alt=""
                                                className="relative h-full w-full object-cover"
                                                decoding="async"
                                                loading="lazy"
                                                src={previewUrl}
                                            />
                                        ) : null}
                                        {selected ? (
                                            <span className="absolute top-1 right-1 grid h-5 w-5 place-items-center rounded-[3px] bg-[#FF765B] text-[#21162D] shadow-[1px_2px_4px_rgba(33,22,45,0.2)]">
                                                <Check aria-hidden="true" className="h-3.5 w-3.5" />
                                            </span>
                                        ) : null}
                                    </span>
                                    <span className="mt-1.5 block min-w-0 px-0.5">
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
            </div>
        </section>
    );
}

function paperCountLabel(count: number): string {
    if (count === 1) {
        return '1 opção';
    }

    return `${count} opções`;
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
