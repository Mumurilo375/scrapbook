import { Link } from '@inertiajs/react';
import { ArrowLeft, ExternalLink, Eye, PenLine, Share2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState, type TouchEvent } from 'react';

import { assetMapFromList, normalizeThemeConfig, type RendererContext } from '../../../components/renderer';
import { GiftViewerFrame } from '../../gifts/components/viewer/GiftViewerFrame';
import { GiftViewerLayout } from '../../gifts/components/viewer/GiftViewerLayout';
import type { ViewerGift } from '../../gifts/components/viewer/viewerTypes';
import { normalizeViewerPages } from '../../gifts/components/viewer/viewerUtils';
import { PublicGiftCta } from './PublicGiftCta';
import { PublicGiftEnding } from './PublicGiftEnding';
import { PublicGiftNavigation } from './PublicGiftNavigation';
import { PublicGiftOpening } from './PublicGiftOpening';
import { PublicGiftProgress } from './PublicGiftProgress';

type PublicGiftViewerShellProps = {
    gift: ViewerGift;
    mode: 'preview' | 'public';
};

type ViewerPhase = 'opening' | 'pages' | 'ending';

type TouchPoint = {
    x: number;
    y: number;
};

export function PublicGiftViewerShell({ gift, mode }: PublicGiftViewerShellProps) {
    const pages = useMemo(() => normalizeViewerPages(gift.pages), [gift.pages]);
    const theme = useMemo(() => normalizeThemeConfig(gift.theme?.config), [gift.theme?.config]);
    const assetMap = useMemo(() => assetMapFromList(gift.assets), [gift.assets]);
    const [phase, setPhase] = useState<ViewerPhase>('opening');
    const [activePageIndex, setActivePageIndex] = useState(0);
    const touchStart = useRef<TouchPoint | null>(null);
    const pageCount = pages.length;
    const visiblePageIndex = pageCount > 0 ? Math.min(activePageIndex, pageCount - 1) : 0;
    const activePage = phase === 'pages' ? pages[visiblePageIndex] ?? null : null;
    const context: RendererContext = mode === 'public' ? 'public' : 'preview';
    const isPublic = mode === 'public';

    const goToPage = useCallback((index: number) => {
        if (pageCount <= 0) {
            setActivePageIndex(0);
            setPhase('pages');

            return;
        }

        setActivePageIndex(Math.max(0, Math.min(index, pageCount - 1)));
        setPhase('pages');
    }, [pageCount]);

    const openGift = useCallback(() => {
        goToPage(0);
    }, [goToPage]);

    const goNext = useCallback(() => {
        if (phase === 'opening') {
            openGift();

            return;
        }

        if (phase === 'ending' || pageCount <= 0) {
            return;
        }

        if (visiblePageIndex >= pageCount - 1) {
            setPhase('ending');

            return;
        }

        setActivePageIndex((current) => Math.min(current + 1, pageCount - 1));
    }, [openGift, pageCount, phase, visiblePageIndex]);

    const goPrevious = useCallback(() => {
        if (phase === 'ending') {
            goToPage(Math.max(0, pageCount - 1));

            return;
        }

        if (phase !== 'pages') {
            return;
        }

        setActivePageIndex((current) => Math.max(0, current - 1));
    }, [goToPage, pageCount, phase]);

    const restart = useCallback(() => {
        setActivePageIndex(0);
        setPhase('opening');

        if (typeof window !== 'undefined') {
            window.scrollTo({ behavior: 'smooth', top: 0 });
        }
    }, []);

    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            if (isTypingTarget(event.target) || phase === 'opening') {
                return;
            }

            if (event.key === 'ArrowLeft') {
                event.preventDefault();
                goPrevious();
            }

            if (event.key === 'ArrowRight') {
                event.preventDefault();
                goNext();
            }
        }

        window.addEventListener('keydown', handleKeyDown);

        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [goNext, goPrevious, phase]);

    function handleTouchStart(event: TouchEvent<HTMLElement>) {
        if (phase === 'opening') {
            return;
        }

        const touch = event.changedTouches[0];

        touchStart.current = touch ? { x: touch.clientX, y: touch.clientY } : null;
    }

    function handleTouchEnd(event: TouchEvent<HTMLElement>) {
        if (phase === 'opening' || touchStart.current === null) {
            return;
        }

        const touch = event.changedTouches[0];

        if (!touch) {
            touchStart.current = null;

            return;
        }

        const deltaX = touch.clientX - touchStart.current.x;
        const deltaY = touch.clientY - touchStart.current.y;
        touchStart.current = null;

        if (Math.abs(deltaX) < 54 || Math.abs(deltaX) < Math.abs(deltaY) * 1.35) {
            return;
        }

        if (deltaX < 0) {
            goNext();
        } else {
            goPrevious();
        }
    }

    return (
        <GiftViewerLayout theme={gift.theme?.config}>
            {mode === 'preview' ? <PrivatePreviewBar gift={gift} theme={theme} /> : null}

            <section
                className="mx-auto grid w-full flex-1 content-start gap-5 pb-7 pt-2 sm:pt-5"
                onTouchEnd={handleTouchEnd}
                onTouchStart={handleTouchStart}
            >
                {phase === 'opening' ? (
                    <PublicGiftOpening gift={gift} mode={mode} onOpen={openGift} theme={theme} />
                ) : null}

                {phase === 'pages' ? (
                    <div className="grid gap-5">
                        <ViewerPageHeader gift={gift} mode={mode} theme={theme} />
                        <div className="gift-viewer-page-transition" key={activePage?.id ?? 'empty-page'}>
                            <GiftViewerFrame assets={assetMap} context={context} page={activePage} theme={gift.theme?.config} />
                        </div>
                        <PublicGiftProgress
                            activePageIndex={visiblePageIndex}
                            isEnding={false}
                            pageCount={pageCount}
                            theme={theme}
                        />
                        <PublicGiftNavigation
                            activePageIndex={visiblePageIndex}
                            isEnding={false}
                            onNext={goNext}
                            onPrevious={goPrevious}
                            pageCount={pageCount}
                            theme={theme}
                        />
                        {isPublic ? <PublicGiftCta compact createUrl={gift.urls.create} theme={theme} /> : null}
                    </div>
                ) : null}

                {phase === 'ending' ? (
                    <div className="grid gap-5">
                        <PublicGiftProgress
                            activePageIndex={Math.max(0, pageCount - 1)}
                            isEnding
                            pageCount={pageCount}
                            theme={theme}
                        />
                        <PublicGiftEnding
                            createUrl={gift.urls.create}
                            gift={gift}
                            isPublic={isPublic}
                            onBackToLastPage={() => goToPage(Math.max(0, pageCount - 1))}
                            onRestart={restart}
                            theme={theme}
                        />
                    </div>
                ) : null}
            </section>
        </GiftViewerLayout>
    );
}

type ViewerPageHeaderProps = {
    gift: ViewerGift;
    mode: 'preview' | 'public';
    theme: ReturnType<typeof normalizeThemeConfig>;
};

function ViewerPageHeader({ gift, mode, theme }: ViewerPageHeaderProps) {
    return (
        <div className="mx-auto w-full max-w-[680px] text-center">
            <p className="text-xs font-semibold uppercase" style={{ color: theme.tokens.colors.accent }}>
                {mode === 'preview' ? 'Prévia do presente' : 'Scrapbook aberto'}
            </p>
            <h1 className="mt-2 truncate font-editorial text-2xl font-semibold sm:text-3xl" style={{ color: theme.elements.text.headingColor }}>
                {gift.title}
            </h1>
            <p className="mt-1 text-sm font-semibold" style={{ color: theme.tokens.colors.mutedInk }}>
                {gift.recipient_name ? `Para ${gift.recipient_name}` : 'Feito com carinho'}
                {gift.sender_name ? `, de ${gift.sender_name}` : ''}
            </p>
        </div>
    );
}

type PrivatePreviewBarProps = {
    gift: ViewerGift;
    theme: ReturnType<typeof normalizeThemeConfig>;
};

function PrivatePreviewBar({ gift, theme }: PrivatePreviewBarProps) {
    const primaryHref = gift.urls.share ?? gift.urls.review ?? gift.urls.edit ?? gift.urls.preview ?? '/app/gifts';
    const primaryLabel = gift.urls.share ? 'Compartilhar' : 'Revisar e publicar';
    const PrimaryIcon = gift.urls.share ? Share2 : Eye;

    return (
        <header
            className="sticky top-0 z-30 -mx-4 border-b px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
            style={{
                backgroundColor: `color-mix(in srgb, ${theme.tokens.colors.appBackground} 92%, white)`,
                borderColor: theme.tokens.colors.muted,
                color: theme.tokens.colors.ink,
            }}
        >
            <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                    {gift.urls.edit ? (
                        <Link
                            className="inline-flex min-h-10 items-center gap-2 rounded-[6px] border px-3 text-sm font-semibold"
                            href={gift.urls.edit}
                            style={{
                                backgroundColor: theme.tokens.colors.paper,
                                borderColor: theme.tokens.colors.muted,
                                color: theme.tokens.colors.ink,
                            }}
                        >
                            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
                            Voltar para editar
                        </Link>
                    ) : null}
                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{gift.title}</p>
                        <p className="mt-1 text-xs font-semibold uppercase" style={{ color: theme.tokens.colors.accent }}>
                            Preview privado{gift.status ? ` - ${statusLabel(gift.status)}` : ''}
                        </p>
                    </div>
                </div>

                <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
                    <Link
                        className="inline-flex min-h-10 items-center gap-2 rounded-[6px] border px-3 text-sm font-semibold"
                        href={primaryHref}
                        style={{
                            backgroundColor: theme.tokens.colors.accent,
                            borderColor: theme.tokens.colors.accent,
                            color: theme.tokens.colors.paper,
                        }}
                    >
                        <PrimaryIcon aria-hidden="true" className="h-4 w-4" />
                        {primaryLabel}
                    </Link>
                    {gift.urls.public ? (
                        <Link
                            className="inline-flex min-h-10 items-center gap-2 rounded-[6px] border px-3 text-sm font-semibold"
                            href={gift.urls.public}
                            style={{
                                backgroundColor: theme.tokens.colors.paper,
                                borderColor: theme.tokens.colors.muted,
                                color: theme.tokens.colors.ink,
                            }}
                        >
                            <ExternalLink aria-hidden="true" className="h-4 w-4" />
                            Abrir link
                        </Link>
                    ) : null}
                    {gift.urls.edit ? (
                        <Link
                            className="inline-flex min-h-10 items-center gap-2 px-2 text-sm font-semibold"
                            href={gift.urls.edit}
                            style={{ color: theme.tokens.colors.ink }}
                        >
                            <PenLine aria-hidden="true" className="h-4 w-4" />
                            Editar
                        </Link>
                    ) : null}
                </div>
            </div>
        </header>
    );
}

function statusLabel(status: string): string {
    const labels: Record<string, string> = {
        disabled: 'desativado',
        draft: 'rascunho',
        expired: 'expirado',
        pending_payment: 'aguardando pagamento',
        published: 'publicado',
    };

    return labels[status] ?? status;
}

function isTypingTarget(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) {
        return false;
    }

    return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
}
