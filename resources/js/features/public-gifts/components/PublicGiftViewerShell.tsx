import { Link } from '@inertiajs/react';
import { ArrowLeft, BookOpen, Check, ExternalLink, Eye, PenLine, Share2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState, type TouchEvent } from 'react';

import { assetMapFromList, normalizeThemeConfig, type RendererContext } from '../../../components/renderer';
import { useAnalytics } from '../../../lib/analytics';
import { GiftViewerLayout } from '../../gifts/components/viewer/GiftViewerLayout';
import type { ViewerGift } from '../../gifts/components/viewer/viewerTypes';
import { normalizeViewerPages } from '../../gifts/components/viewer/viewerUtils';
import { BookViewerShell } from './BookViewerShell';
import { bookMotionAttributes, isBookMotionEnabled, type BookMotionDirection } from './bookMotionUtils';
import { lastBookStartIndex, resolveBookPageRange, type BookViewMode } from './bookModeUtils';
import { PublicGiftCta } from './PublicGiftCta';
import { PublicGiftEnding } from './PublicGiftEnding';
import { PublicGiftNavigation } from './PublicGiftNavigation';
import { PublicGiftOpening } from './PublicGiftOpening';
import { PublicGiftProgress } from './PublicGiftProgress';
import { useReducedMotion } from './useReducedMotion';

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
    const [direction, setDirection] = useState<BookMotionDirection>('none');
    const isWideViewport = useMediaQuery('(min-width: 768px)');
    const prefersReducedMotion = useReducedMotion();
    const touchStart = useRef<TouchPoint | null>(null);
    const viewedPages = useRef<Set<string>>(new Set());
    const completedTracked = useRef(false);
    const pageCount = pages.length;
    const bookMode: BookViewMode = isWideViewport && theme.book.mode !== 'single' ? 'spread' : 'single';
    const motionEnabled = isBookMotionEnabled(theme, prefersReducedMotion);
    const motionAttributes = useMemo(
        () => bookMotionAttributes(theme, direction, bookMode, motionEnabled),
        [bookMode, direction, motionEnabled, theme],
    );
    const pageRange = useMemo(
        () => resolveBookPageRange(activePageIndex, pageCount, bookMode),
        [activePageIndex, bookMode, pageCount],
    );
    const context: RendererContext = mode === 'public' ? 'public' : 'preview';
    const isPublic = mode === 'public';
    const { trackEvent } = useAnalytics();

    const goToPage = useCallback(
        (index: number, nextDirection: BookMotionDirection = 'none') => {
            setDirection(nextDirection);

            if (pageCount <= 0) {
                setActivePageIndex(0);
                setPhase('pages');

                return;
            }

            setActivePageIndex(Math.max(0, Math.min(index, pageCount - 1)));
            setPhase('pages');
        },
        [pageCount],
    );

    const openGift = useCallback(() => {
        if (isPublic) {
            trackEvent('gift_opening_started');
            trackEvent('gift_opening_completed');
        }

        goToPage(0, 'next');
    }, [goToPage, isPublic, trackEvent]);

    const goNext = useCallback(() => {
        if (phase === 'opening') {
            openGift();

            return;
        }

        if (phase === 'ending' || pageCount <= 0) {
            return;
        }

        if (pageRange.nextIndex === null) {
            setDirection('next');
            setPhase('ending');

            return;
        }

        setDirection('next');
        setActivePageIndex(pageRange.nextIndex);
    }, [openGift, pageCount, pageRange.nextIndex, phase]);

    const goPrevious = useCallback(() => {
        if (phase === 'ending') {
            goToPage(lastBookStartIndex(pageCount, bookMode), 'previous');

            return;
        }

        if (phase !== 'pages') {
            return;
        }

        if (!pageRange.canGoPrevious) {
            return;
        }

        setDirection('previous');
        setActivePageIndex(pageRange.previousIndex ?? 0);
    }, [bookMode, goToPage, pageCount, pageRange.canGoPrevious, pageRange.previousIndex, phase]);

    const restart = useCallback(() => {
        setDirection('previous');
        setActivePageIndex(0);
        setPhase('opening');

        if (typeof window !== 'undefined') {
            window.scrollTo({ behavior: prefersReducedMotion ? 'auto' : 'smooth', top: 0 });
        }
    }, [prefersReducedMotion]);

    useEffect(() => {
        if (!isPublic || phase !== 'pages' || pageCount <= 0) {
            return;
        }

        const indexes = [pageRange.startIndex, pageRange.rightIndex].filter((index): index is number => index !== null);

        indexes.forEach((index) => {
            const page = pages[index];
            const key = page?.id ?? `index-${index}`;

            if (!page || viewedPages.current.has(key)) {
                return;
            }

            viewedPages.current.add(key);
            trackEvent('gift_page_viewed', {
                pageId: page.id,
                pageIndex: index,
                payload: {
                    book_mode: bookMode,
                },
            });
        });
    }, [bookMode, isPublic, pageCount, pageRange.rightIndex, pageRange.startIndex, pages, phase, trackEvent]);

    useEffect(() => {
        if (!isPublic || phase !== 'ending' || completedTracked.current) {
            return;
        }

        completedTracked.current = true;
        trackEvent('gift_completed');
    }, [isPublic, phase, trackEvent]);

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
        if (phase === 'opening' || isScrapbookInteractiveTarget(event.target)) {
            touchStart.current = null;

            return;
        }

        const touch = event.changedTouches[0];

        touchStart.current = touch ? { x: touch.clientX, y: touch.clientY } : null;
    }

    function handleTouchEnd(event: TouchEvent<HTMLElement>) {
        if (phase === 'opening' || isScrapbookInteractiveTarget(event.target) || touchStart.current === null) {
            touchStart.current = null;

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
        <GiftViewerLayout assets={assetMap} theme={gift.theme?.config}>
            <ViewerTopBar gift={gift} mode={mode} theme={theme} />

            <section
                className="gift-viewer-experience mx-auto grid w-full flex-1 content-start gap-4 pb-5 pt-3 sm:pt-4"
                onTouchEnd={handleTouchEnd}
                onTouchStart={handleTouchStart}
                {...motionAttributes}
            >
                {phase === 'opening' ? (
                    <PublicGiftOpening
                        gift={gift}
                        mode={mode}
                        motionEnabled={motionEnabled}
                        onOpen={openGift}
                        theme={theme}
                    />
                ) : null}

                {phase === 'pages' ? (
                    <div className="gift-viewer-pages grid gap-3">
                        <ViewerPageHeader gift={gift} mode={mode} theme={theme} />
                        <div
                            className="gift-viewer-page-transition gift-viewer-motion"
                            key={`${bookMode}-${pageRange.startIndex}-${pageRange.rightIndex ?? 'blank'}`}
                            {...motionAttributes}
                        >
                            <BookViewerShell
                                assets={assetMap}
                                context={context}
                                direction={direction}
                                isSpread={bookMode === 'spread'}
                                motionEnabled={motionEnabled}
                                pages={pages}
                                range={pageRange}
                                theme={theme}
                            />
                        </div>
                        <div className="gift-viewer-controls">
                            <PublicGiftProgress
                                activePageIndex={pageRange.endIndex}
                                displayLabel={pageRange.label}
                                isEnding={false}
                                pageCount={pageCount}
                                progress={pageRange.progress}
                                theme={theme}
                            />
                            <PublicGiftNavigation
                                activePageIndex={pageRange.endIndex}
                                canGoNext={pageCount > 0}
                                canGoPrevious={pageRange.canGoPrevious}
                                displayLabel={pageRange.label}
                                isEnding={false}
                                nextLabel={
                                    pageRange.nextIndex === null
                                        ? 'Final'
                                        : bookMode === 'spread'
                                          ? 'Próximas páginas'
                                          : 'Próxima'
                                }
                                onNext={goNext}
                                onPrevious={goPrevious}
                                pageCount={pageCount}
                                theme={theme}
                            />
                        </div>
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
                            motionEnabled={motionEnabled}
                            onBackToLastPage={() => goToPage(Math.max(0, pageCount - 1), 'previous')}
                            onRestart={restart}
                            theme={theme}
                        />
                    </div>
                ) : null}
            </section>
        </GiftViewerLayout>
    );
}

function useMediaQuery(query: string): boolean {
    const [matches, setMatches] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
            return;
        }

        const media = window.matchMedia(query);
        const updateMatches = () => setMatches(media.matches);

        updateMatches();
        media.addEventListener('change', updateMatches);

        return () => media.removeEventListener('change', updateMatches);
    }, [query]);

    return matches;
}

type ViewerPageHeaderProps = {
    gift: ViewerGift;
    mode: 'preview' | 'public';
    theme: ReturnType<typeof normalizeThemeConfig>;
};

function ViewerPageHeader({ gift, mode, theme }: ViewerPageHeaderProps) {
    return (
        <div className="gift-viewer-page-label mx-auto flex w-full max-w-[1380px] items-end justify-between gap-4">
            <div className="min-w-0">
                <p
                    className="text-[10px] font-bold tracking-[0.16em] uppercase"
                    style={{ color: theme.tokens.colors.accent }}
                >
                    {mode === 'preview' ? 'Prévia do presente' : 'Álbum aberto'}
                </p>
                <h1 className="mt-0.5 truncate font-editorial text-xl font-semibold text-[#21162D] sm:text-2xl">
                    {gift.title}
                </h1>
            </div>
            <p className="hidden shrink-0 font-hand text-lg text-[#5F5668] sm:block">
                {gift.recipient_name ? `para ${gift.recipient_name}` : 'feito com carinho'}
                {gift.sender_name ? ` · de ${gift.sender_name}` : ''}
            </p>
        </div>
    );
}

type ViewerTopBarProps = {
    gift: ViewerGift;
    mode: 'preview' | 'public';
    theme: ReturnType<typeof normalizeThemeConfig>;
};

function ViewerTopBar({ gift, mode, theme }: ViewerTopBarProps) {
    const primaryHref = gift.urls.share ?? gift.urls.review ?? gift.urls.edit ?? gift.urls.preview ?? '/app/gifts';
    const primaryLabel = gift.urls.share ? 'Compartilhar' : 'Revisar e publicar';
    const PrimaryIcon = gift.urls.share ? Share2 : Eye;

    return (
        <header className="gift-viewer-topbar sticky top-0 z-50 -mx-3 px-3 sm:-mx-5 sm:px-5 lg:-mx-7 lg:px-7">
            <div className="mx-auto flex min-h-[70px] max-w-[1600px] items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                    {mode === 'preview' && gift.urls.edit ? (
                        <Link
                            className="gift-viewer-topbar__back inline-flex min-h-10 items-center gap-2 border px-3 text-sm font-semibold"
                            href={gift.urls.edit}
                        >
                            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
                            <span className="hidden sm:inline">Voltar para editar</span>
                        </Link>
                    ) : null}
                    <span className="gift-viewer-topbar__brand hidden items-center gap-2.5 lg:flex">
                        <BookOpen aria-hidden="true" className="h-6 w-6 text-[#B9A1E7]" />
                        <span className="font-editorial text-sm tracking-[0.08em] uppercase">
                            Álbum de coleção afetiva
                        </span>
                    </span>
                    <div className="min-w-0">
                        <p className="truncate font-editorial text-lg font-semibold text-white sm:text-xl">
                            {gift.title}
                        </p>
                        <p className="mt-0.5 flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.12em] text-[#C8BED0] uppercase">
                            <Check aria-hidden="true" className="h-3 w-3" />
                            {mode === 'preview'
                                ? `Prévia privada${gift.status ? ` · ${statusLabel(gift.status)}` : ''}`
                                : gift.recipient_name
                                  ? `Feito para ${gift.recipient_name}`
                                  : 'Um presente feito à mão'}
                        </p>
                    </div>
                </div>

                {mode === 'preview' ? (
                    <div className="flex items-center gap-2">
                        <Link
                            className="gift-viewer-topbar__primary inline-flex min-h-10 items-center gap-2 border px-3 text-sm font-bold"
                            href={primaryHref}
                            style={{ backgroundColor: theme.tokens.colors.accent }}
                        >
                            <PrimaryIcon aria-hidden="true" className="h-4 w-4" />
                            <span className="hidden sm:inline">{primaryLabel}</span>
                        </Link>
                        {gift.urls.public ? (
                            <Link
                                aria-label="Abrir link publicado"
                                className="gift-viewer-topbar__icon inline-flex min-h-10 min-w-10 items-center justify-center border"
                                href={gift.urls.public}
                            >
                                <ExternalLink aria-hidden="true" className="h-4 w-4" />
                            </Link>
                        ) : null}
                        {gift.urls.edit ? (
                            <Link
                                aria-label="Editar presente"
                                className="gift-viewer-topbar__icon hidden min-h-10 min-w-10 items-center justify-center border sm:inline-flex"
                                href={gift.urls.edit}
                            >
                                <PenLine aria-hidden="true" className="h-4 w-4" />
                            </Link>
                        ) : null}
                    </div>
                ) : (
                    <span className="hidden font-hand text-lg text-[#D5C8DB] sm:block">
                        abra devagar, esta história é sua
                    </span>
                )}
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

function isScrapbookInteractiveTarget(target: EventTarget | null): boolean {
    return target instanceof HTMLElement && target.closest('[data-scrapbook-interactive="true"]') !== null;
}
