import type { CSSProperties, ReactNode } from 'react';

import { normalizeThemeConfig, type RendererContext, type ThemeConfigInput } from './theme';

type ScrapbookStageProps = {
    children: ReactNode;
    className?: string;
    context?: RendererContext;
    theme?: ThemeConfigInput;
};

export function ScrapbookStage({ children, className = '', context = 'preview', theme }: ScrapbookStageProps) {
    const normalizedTheme = normalizeThemeConfig(theme);
    const isEditor = context === 'editor';
    const style = {
        '--scrap-app-bg': normalizedTheme.tokens.colors.appBackground,
        '--scrap-book-bg': normalizedTheme.tokens.colors.bookBackground,
        '--scrap-shadow': normalizedTheme.tokens.colors.shadow,
    } as CSSProperties;

    return (
        <div
            className={`relative mx-auto w-full ${isEditor ? 'max-w-[775px]' : 'max-w-[850px]'} ${className}`}
            style={style}
        >
            <div
                className="absolute inset-x-2 bottom-[-1.5%] top-[4%] rounded-[28px] bg-[var(--scrap-book-bg)] opacity-80"
                style={{ boxShadow: `0 26px 80px ${normalizedTheme.tokens.colors.shadow}` }}
            />
            <div className="absolute inset-x-[7%] bottom-[-3.5%] h-[8%] rounded-[50%] bg-[rgba(58,36,24,0.18)] blur-xl" />
            <div
                aria-hidden="true"
                className="absolute inset-x-[5%] top-[7%] h-[84%] rounded-[28px] opacity-40"
                style={{
                    backgroundImage:
                        'linear-gradient(90deg, rgba(255,255,255,0.18), transparent 18%, transparent 82%, rgba(58,36,24,0.12)), radial-gradient(circle at 22% 18%, rgba(255,255,255,0.22), transparent 20%)',
                }}
            />
            <div className="relative">{children}</div>
        </div>
    );
}
