import type { CSSProperties, ReactNode } from 'react';

import type { Canvas } from '../../domain/canvas/schema';
import type { RendererAssetMap } from './assetTypes';
import type { NormalizedThemeConfig, RendererContext } from './theme';
import { firstTextureLayerStyle } from './themeTextureUtils';

type ScrapbookPageFrameProps = {
    assets?: RendererAssetMap;
    canvas: Canvas;
    children: ReactNode;
    context?: RendererContext;
    theme: NormalizedThemeConfig;
};

export function ScrapbookPageFrame({ assets, canvas, children, context = 'preview', theme }: ScrapbookPageFrameProps) {
    const width = canvas.artboard.width;
    const height = canvas.artboard.height;
    const radius = Math.max(0, theme.page.borderRadius);
    const frameInset = context === 'editor' ? '3.4%' : '4%';
    const showTape = theme.page.decorations.cornerTape;
    const bookTextureStyle = firstTextureLayerStyle(theme, assets, ['bookSurface', 'kraftSurface']);
    const spineTextureStyle = firstTextureLayerStyle(theme, assets, ['bookSpine', 'bookSurface']);
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
        <div className="scrapbook-page-frame relative w-full px-[1.2%] py-[1.4%]" data-context={context} style={style}>
            <div
                className="absolute inset-[0.2%] rotate-[-1.4deg] rounded-[var(--scrap-frame-radius)] opacity-45"
                style={{
                    backgroundColor: `color-mix(in srgb, ${theme.tokens.colors.bookBackground} 72%, #43283D)`,
                    boxShadow: `0 28px 72px ${theme.tokens.colors.shadow}`,
                }}
            />
            <div
                className="absolute inset-[1.2%] rotate-[0.9deg] rounded-[var(--scrap-frame-radius)] opacity-80"
                style={{
                    backgroundColor: `color-mix(in srgb, ${theme.tokens.colors.bookBackground} 82%, white)`,
                    boxShadow: '0 14px 28px color-mix(in srgb, var(--scrap-shadow) 46%, transparent)',
                }}
            />
            <div
                className="absolute inset-[2.1%] rounded-[var(--scrap-frame-radius)] border border-[#CFC1AE]/50"
                style={{
                    backgroundImage:
                        'linear-gradient(90deg,color-mix(in srgb, var(--scrap-shadow) 42%, transparent),transparent 7%,transparent 93%,rgba(255,255,255,0.18))',
                }}
            >
                {bookTextureStyle ? (
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 rounded-[inherit]"
                        style={bookTextureStyle}
                    />
                ) : null}
            </div>
            {theme.book.binding === 'left' ? (
                <>
                    <div className="absolute bottom-[5.2%] left-[1.8%] top-[5.2%] z-10 w-[5.1%] overflow-hidden rounded-full bg-[linear-gradient(90deg,rgba(58,36,24,0.32),var(--scrap-binding-color)_46%,rgba(255,255,255,0.26))] shadow-[inset_-12px_0_18px_rgba(58,36,24,0.20),6px_0_18px_rgba(58,36,24,0.14)]">
                        {spineTextureStyle ? (
                            <span
                                aria-hidden="true"
                                className="pointer-events-none absolute inset-0"
                                style={spineTextureStyle}
                            />
                        ) : null}
                    </div>
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
