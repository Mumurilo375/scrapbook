import { ChevronLeft, ChevronRight } from 'lucide-react';

type GiftViewerControlsProps = {
    activePageIndex: number;
    pageCount: number;
    onNext: () => void;
    onPrevious: () => void;
};

export function GiftViewerControls({ activePageIndex, pageCount, onNext, onPrevious }: GiftViewerControlsProps) {
    const canGoPrevious = activePageIndex > 0;
    const canGoNext = activePageIndex < pageCount - 1;

    return (
        <div className="flex items-center justify-center gap-3">
            <button
                aria-label="Página anterior"
                className="inline-flex h-11 w-11 items-center justify-center rounded-[6px] border border-[#B78D5C] bg-[#FFF7EE] text-[#42291D] shadow-sm hover:bg-[#EAD2B8] disabled:cursor-not-allowed disabled:opacity-45"
                disabled={!canGoPrevious}
                onClick={onPrevious}
                type="button"
            >
                <ChevronLeft aria-hidden="true" className="h-5 w-5" />
            </button>

            <p className="min-w-24 text-center text-sm font-semibold text-[#42291D]">
                {pageCount > 0 ? `${activePageIndex + 1} / ${pageCount}` : '0 / 0'}
            </p>

            <button
                aria-label="Próxima página"
                className="inline-flex h-11 w-11 items-center justify-center rounded-[6px] border border-[#B78D5C] bg-[#FFF7EE] text-[#42291D] shadow-sm hover:bg-[#EAD2B8] disabled:cursor-not-allowed disabled:opacity-45"
                disabled={!canGoNext}
                onClick={onNext}
                type="button"
            >
                <ChevronRight aria-hidden="true" className="h-5 w-5" />
            </button>
        </div>
    );
}
