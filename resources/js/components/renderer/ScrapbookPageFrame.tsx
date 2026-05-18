import type { CSSProperties, ReactNode } from 'react';

import type { Canvas } from '../../domain/canvas/schema';
import type { NormalizedThemeConfig, RendererContext } from './theme';

type ScrapbookPageFrameProps = {
    canvas: Canvas;
    children: ReactNode;
    context?: RendererContext;
    theme: NormalizedThemeConfig;
};

export function ScrapbookPageFrame({ canvas, children, context = 'preview', theme }: ScrapbookPageFrameProps) {
    const width = canvas.artboard.width;
    const height = canvas.artboard.height;
    const radius = Math.max(0, theme.page.borderRadius);
    const frameInset = context === 'editor' ? '3.4%' : '4%';
    const showTape = theme.page.decorations.cornerTape;
    const style = {
        aspectRatio: `${width} / ${height}`,
        '--scrap-book-bg': theme.tokens.colors.bookBackground,
        '--scrap-frame-radius': `${radius + 16}px`,
        '--scrap-binding-color': theme.book.spineColor,
        '--scrap-tape-color': theme.tokens.colors.tape,
        '--scrap-tape-alt': theme.tokens.colors.accentSoft,
        '--scrap-muted': theme.tokens.colors.muted,
        '--scrap-shadow': theme.tokens.colors.shadow,
    } as CSSProperties;

    return (
        <div className="relative w-full px-[1.2%] py-[1.4%]" style={style}>
            <div
                className="absolute inset-[0.2%] rotate-[-1.4deg] rounded-[var(--scrap-frame-radius)] opacity-45"
                style={{ backgroundColor: `color-mix(in srgb, ${theme.tokens.colors.bookBackground} 72%, #8B5E3C)`, boxShadow: `0 28px 72px ${theme.tokens.colors.shadow}` }}
            />
            <div
                className="absolute inset-[1.2%] rotate-[0.9deg] rounded-[var(--scrap-frame-radius)] opacity-80"
                style={{ backgroundColor: `color-mix(in srgb, ${theme.tokens.colors.bookBackground} 82%, white)`, boxShadow: '0 14px 28px rgba(58,36,24,0.12)' }}
            />
            <div
                className="absolute inset-[2.1%] rounded-[var(--scrap-frame-radius)] border border-[rgba(58,36,24,0.12)]"
                style={{ backgroundImage: 'linear-gradient(90deg,rgba(58,36,24,0.10),transparent 7%,transparent 93%,rgba(255,255,255,0.18))' }}
            />
            {theme.book.binding === 'left' ? (
                <>
                    <div className="absolute bottom-[5.2%] left-[1.8%] top-[5.2%] z-10 w-[5.1%] rounded-full bg-[linear-gradient(90deg,rgba(58,36,24,0.32),var(--scrap-binding-color)_46%,rgba(255,255,255,0.26))] shadow-[inset_-12px_0_18px_rgba(58,36,24,0.20),6px_0_18px_rgba(58,36,24,0.14)]" />
                    {[18, 50, 82].map((top) => (
                        <div
                            aria-hidden="true"
                            className="absolute left-[3.15%] z-20 h-[2.9%] w-[2.9%] rounded-full border border-[rgba(255,255,255,0.42)] bg-[rgba(58,36,24,0.28)] shadow-[inset_0_2px_5px_rgba(58,36,24,0.22)]"
                            key={top}
                            style={{ top: `${top}%` }}
                        />
                    ))}
                </>
            ) : null}
            {showTape ? (
                <>
                    <div className="absolute left-[16%] top-[1.4%] z-30 h-[5.8%] w-[24%] rotate-[-5deg] rounded-[3px] bg-[var(--scrap-tape-color)] opacity-78 shadow-[0_8px_16px_rgba(58,36,24,0.12)]" />
                    <div className="absolute right-[11%] top-[2.4%] z-30 h-[5.1%] w-[18%] rotate-[6deg] rounded-[3px] bg-[var(--scrap-tape-alt)] opacity-72 shadow-[0_8px_16px_rgba(58,36,24,0.12)]" />
                    <div className="absolute bottom-[1.8%] right-[18%] z-30 h-[4.4%] w-[16%] rotate-[-4deg] rounded-[3px] bg-[var(--scrap-tape-color)] opacity-45 shadow-[0_7px_14px_rgba(58,36,24,0.10)]" />
                </>
            ) : null}
            <div className="absolute" style={{ inset: frameInset }}>
                {children}
            </div>
        </div>
    );
}
