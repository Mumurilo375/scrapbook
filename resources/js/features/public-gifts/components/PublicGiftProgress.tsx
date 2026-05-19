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
        <div className="mx-auto grid w-full max-w-[920px] gap-2">
            <div
                className="flex items-center justify-between text-xs font-semibold"
                style={{ color: theme.tokens.colors.mutedInk }}
            >
                <span>{isEnding ? 'Final' : (displayLabel ?? `Página ${activePageIndex + 1} de ${pageCount}`)}</span>
                <span>{Math.round(progress)}%</span>
            </div>
            <div
                className="h-2 overflow-hidden rounded-full"
                style={{ backgroundColor: `color-mix(in srgb, ${theme.tokens.colors.muted} 24%, transparent)` }}
            >
                <div
                    className="gift-viewer-progress-bar h-full rounded-full transition-[width] duration-300 ease-out"
                    style={{
                        backgroundColor: theme.tokens.colors.accent,
                        width: `${progress}%`,
                    }}
                />
            </div>
        </div>
    );
}
