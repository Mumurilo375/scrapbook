import type { NormalizedThemeConfig } from '../../../components/renderer';

type PublicGiftProgressProps = {
    activePageIndex: number;
    displayLabel?: string;
    isEnding: boolean;
    pageCount: number;
    progress?: number;
    theme: NormalizedThemeConfig;
};

export function PublicGiftProgress({
    activePageIndex,
    displayLabel,
    isEnding,
    pageCount,
    progress: progressOverride,
    theme,
}: PublicGiftProgressProps) {
    if (pageCount <= 0) {
        return null;
    }

    const progress = isEnding ? 100 : (progressOverride ?? ((activePageIndex + 1) / pageCount) * 100);

    return (
        <div className="gift-viewer-progress mx-auto grid w-full gap-2">
            <div className="flex items-center justify-between text-[10px] font-bold tracking-[0.12em] text-[#C8BED0] uppercase">
                <span>{isEnding ? 'Final' : (displayLabel ?? `Página ${activePageIndex + 1} de ${pageCount}`)}</span>
                <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-[3px] overflow-hidden bg-[#FFFFFF24]">
                <div
                    className="gift-viewer-progress-bar h-full transition-[width] duration-300 ease-out"
                    style={{
                        backgroundColor: theme.tokens.colors.accent,
                        width: `${progress}%`,
                    }}
                />
            </div>
        </div>
    );
}
