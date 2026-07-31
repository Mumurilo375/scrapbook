import { ChevronLeft, ChevronRight } from 'lucide-react';

import type { NormalizedThemeConfig } from '../../../components/renderer';

type PublicGiftNavigationProps = {
    activePageIndex: number;
    canGoNext?: boolean;
    canGoPrevious?: boolean;
    displayLabel?: string;
    isEnding: boolean;
    nextLabel?: string;
    onNext: () => void;
    onPrevious: () => void;
    pageCount: number;
    previousLabel?: string;
    theme: NormalizedThemeConfig;
};

export function PublicGiftNavigation({
    activePageIndex,
    canGoNext: canGoNextOverride,
    canGoPrevious: canGoPreviousOverride,
    displayLabel,
    isEnding,
    nextLabel,
    onNext,
    onPrevious,
    pageCount,
    previousLabel = 'Anterior',
}: PublicGiftNavigationProps) {
    const canGoPrevious = canGoPreviousOverride ?? (isEnding || activePageIndex > 0);
    const canGoNext = canGoNextOverride ?? (pageCount > 0 && !isEnding);
    const resolvedNextLabel = nextLabel ?? (activePageIndex >= pageCount - 1 ? 'Final' : 'Próxima');

    return (
        <div className="gift-viewer-navigation mx-auto flex w-full items-center justify-between gap-3">
            <button
                aria-label="Página anterior"
                className="gift-viewer-action gift-viewer-navigation__button inline-flex h-11 min-w-11 items-center justify-center gap-2 border px-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"
                disabled={!canGoPrevious}
                onClick={onPrevious}
                style={{
                    backgroundColor: 'rgba(255,253,247,0.08)',
                    borderColor: 'rgba(255,255,255,0.28)',
                    color: '#FBF7ED',
                }}
                type="button"
            >
                <ChevronLeft aria-hidden="true" className="h-5 w-5" />
                <span className="hidden sm:inline">{previousLabel}</span>
            </button>

            <p className="min-w-24 text-center font-hand text-lg text-[#F0E8F2]">
                {pageCount > 0
                    ? isEnding
                        ? 'Final'
                        : (displayLabel ?? `${activePageIndex + 1} / ${pageCount}`)
                    : 'Sem páginas'}
            </p>

            <button
                aria-label={resolvedNextLabel === 'Final' ? 'Ver final' : 'Próxima página'}
                className="gift-viewer-action gift-viewer-navigation__button inline-flex h-11 min-w-11 items-center justify-center gap-2 border px-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"
                disabled={!canGoNext}
                onClick={onNext}
                style={{
                    backgroundColor: 'rgba(255,253,247,0.08)',
                    borderColor: 'rgba(255,255,255,0.28)',
                    color: '#FBF7ED',
                }}
                type="button"
            >
                <span className="hidden sm:inline">{resolvedNextLabel}</span>
                <ChevronRight aria-hidden="true" className="h-5 w-5" />
            </button>
        </div>
    );
}
