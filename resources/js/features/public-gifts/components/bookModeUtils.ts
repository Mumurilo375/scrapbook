export type BookViewMode = 'single' | 'spread';

export type BookPageRange = {
    canAdvanceWithinPages: boolean;
    canGoPrevious: boolean;
    endIndex: number;
    hasDecorativeRightPage: boolean;
    label: string;
    mode: BookViewMode;
    nextIndex: number | null;
    previousIndex: number | null;
    progress: number;
    rightIndex: number | null;
    startIndex: number;
};

export function resolveBookPageRange(activePageIndex: number, pageCount: number, mode: BookViewMode): BookPageRange {
    if (pageCount <= 0) {
        return {
            canAdvanceWithinPages: false,
            canGoPrevious: false,
            endIndex: 0,
            hasDecorativeRightPage: false,
            label: 'Sem páginas',
            mode,
            nextIndex: null,
            previousIndex: null,
            progress: 0,
            rightIndex: null,
            startIndex: 0,
        };
    }

    const startIndex = normalizeBookStartIndex(activePageIndex, pageCount, mode);

    if (mode === 'single') {
        const canGoPrevious = startIndex > 0;
        const canAdvanceWithinPages = startIndex < pageCount - 1;

        return {
            canAdvanceWithinPages,
            canGoPrevious,
            endIndex: startIndex,
            hasDecorativeRightPage: false,
            label: `Página ${startIndex + 1} de ${pageCount}`,
            mode,
            nextIndex: canAdvanceWithinPages ? startIndex + 1 : null,
            previousIndex: canGoPrevious ? startIndex - 1 : null,
            progress: ((startIndex + 1) / pageCount) * 100,
            rightIndex: null,
            startIndex,
        };
    }

    const rightIndex = startIndex + 1 < pageCount ? startIndex + 1 : null;
    const endIndex = rightIndex ?? startIndex;
    const canGoPrevious = startIndex > 0;
    const canAdvanceWithinPages = endIndex < pageCount - 1;
    const rangeLabel =
        rightIndex === null
            ? `Página ${startIndex + 1} de ${pageCount}`
            : `Páginas ${startIndex + 1}–${rightIndex + 1} de ${pageCount}`;

    return {
        canAdvanceWithinPages,
        canGoPrevious,
        endIndex,
        hasDecorativeRightPage: rightIndex === null,
        label: rangeLabel,
        mode,
        nextIndex: canAdvanceWithinPages ? startIndex + 2 : null,
        previousIndex: canGoPrevious ? Math.max(0, startIndex - 2) : null,
        progress: ((endIndex + 1) / pageCount) * 100,
        rightIndex,
        startIndex,
    };
}

export function normalizeBookStartIndex(activePageIndex: number, pageCount: number, mode: BookViewMode): number {
    if (pageCount <= 0) {
        return 0;
    }

    const clampedIndex = Math.max(0, Math.min(Math.floor(activePageIndex), pageCount - 1));

    if (mode === 'single') {
        return clampedIndex;
    }

    return Math.min(lastBookStartIndex(pageCount, mode), clampedIndex - (clampedIndex % 2));
}

export function lastBookStartIndex(pageCount: number, mode: BookViewMode): number {
    if (pageCount <= 0) {
        return 0;
    }

    if (mode === 'single') {
        return pageCount - 1;
    }

    return Math.floor((pageCount - 1) / 2) * 2;
}
