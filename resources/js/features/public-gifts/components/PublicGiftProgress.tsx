import type { NormalizedThemeConfig } from '../../../components/renderer';

type PublicGiftProgressProps = {
    activePageIndex: number;
    isEnding: boolean;
    pageCount: number;
    theme: NormalizedThemeConfig;
};

export function PublicGiftProgress({ activePageIndex, isEnding, pageCount, theme }: PublicGiftProgressProps) {
    if (pageCount <= 0) {
        return null;
    }

    const progress = isEnding ? 100 : ((activePageIndex + 1) / pageCount) * 100;

    return (
        <div className="mx-auto grid w-full max-w-[680px] gap-2">
            <div className="flex items-center justify-between text-xs font-semibold" style={{ color: theme.tokens.colors.mutedInk }}>
                <span>{isEnding ? 'Final' : `Página ${activePageIndex + 1} de ${pageCount}`}</span>
                <span>{Math.round(progress)}%</span>
            </div>
            <div
                className="h-2 overflow-hidden rounded-full"
                style={{ backgroundColor: `color-mix(in srgb, ${theme.tokens.colors.muted} 24%, transparent)` }}
            >
                <div
                    className="h-full rounded-full transition-[width] duration-300 ease-out"
                    style={{
                        backgroundColor: theme.tokens.colors.accent,
                        width: `${progress}%`,
                    }}
                />
            </div>
        </div>
    );
}
