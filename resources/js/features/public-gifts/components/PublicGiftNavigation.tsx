import { ChevronLeft, ChevronRight } from 'lucide-react';

import type { NormalizedThemeConfig } from '../../../components/renderer';

type PublicGiftNavigationProps = {
    activePageIndex: number;
    isEnding: boolean;
    onNext: () => void;
    onPrevious: () => void;
    pageCount: number;
    theme: NormalizedThemeConfig;
};

export function PublicGiftNavigation({
    activePageIndex,
    isEnding,
    onNext,
    onPrevious,
    pageCount,
    theme,
}: PublicGiftNavigationProps) {
    const canGoPrevious = isEnding || activePageIndex > 0;
    const canGoNext = pageCount > 0 && !isEnding;

    return (
        <div className="mx-auto flex w-full max-w-[680px] items-center justify-between gap-3">
            <button
                aria-label="Página anterior"
                className="inline-flex h-11 min-w-11 items-center justify-center gap-2 rounded-[6px] border px-3 text-sm font-semibold shadow-sm transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
                disabled={!canGoPrevious}
                onClick={onPrevious}
                style={{
                    backgroundColor: theme.tokens.colors.paper,
                    borderColor: theme.tokens.colors.muted,
                    color: theme.tokens.colors.ink,
                }}
                type="button"
            >
                <ChevronLeft aria-hidden="true" className="h-5 w-5" />
                <span className="hidden sm:inline">Anterior</span>
            </button>

            <p className="min-w-24 text-center text-sm font-semibold" style={{ color: theme.tokens.colors.ink }}>
                {pageCount > 0 ? (isEnding ? 'Final' : `${activePageIndex + 1} / ${pageCount}`) : 'Sem páginas'}
            </p>

            <button
                aria-label={activePageIndex >= pageCount - 1 ? 'Ver final' : 'Próxima página'}
                className="inline-flex h-11 min-w-11 items-center justify-center gap-2 rounded-[6px] border px-3 text-sm font-semibold shadow-sm transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
                disabled={!canGoNext}
                onClick={onNext}
                style={{
                    backgroundColor: theme.tokens.colors.paper,
                    borderColor: theme.tokens.colors.muted,
                    color: theme.tokens.colors.ink,
                }}
                type="button"
            >
                <span className="hidden sm:inline">{activePageIndex >= pageCount - 1 ? 'Final' : 'Próxima'}</span>
                <ChevronRight aria-hidden="true" className="h-5 w-5" />
            </button>
        </div>
    );
}
