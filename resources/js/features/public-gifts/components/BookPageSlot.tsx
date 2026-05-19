import type { CSSProperties } from 'react';

import {
    CanvasElementLayer,
    PageSurface,
    ThemedArtboard,
    type NormalizedThemeConfig,
    type RendererAssetMap,
    type RendererContext,
} from '../../../components/renderer';
import type { Canvas } from '../../../domain/canvas/schema';
import type { NormalizedViewerPage } from '../../gifts/components/viewer/viewerTypes';

type BookPageSlotProps = {
    assets?: RendererAssetMap;
    context: RendererContext;
    isSpread: boolean;
    page: NormalizedViewerPage | null;
    referenceCanvas?: Canvas | null;
    side: 'left' | 'right' | 'single';
    theme: NormalizedThemeConfig;
};

export function BookPageSlot({ assets, context, isSpread, page, referenceCanvas, side, theme }: BookPageSlotProps) {
    const canvas = page?.canvas ?? referenceCanvas ?? emptyCanvas();
    const sideClass =
        isSpread && side === 'left' ? 'md:origin-right' : isSpread && side === 'right' ? 'md:origin-left' : '';
    const radius =
        isSpread && side === 'left'
            ? `${theme.page.borderRadius + 6}px ${Math.max(12, theme.page.borderRadius - 8)}px ${Math.max(12, theme.page.borderRadius - 8)}px ${theme.page.borderRadius + 6}px`
            : isSpread && side === 'right'
              ? `${Math.max(12, theme.page.borderRadius - 8)}px ${theme.page.borderRadius + 6}px ${theme.page.borderRadius + 6}px ${Math.max(12, theme.page.borderRadius - 8)}px`
              : `${theme.page.borderRadius + 8}px`;
    const curlTransform =
        theme.book.pageCurl === 'subtle' && isSpread
            ? side === 'left'
                ? 'perspective(1200px) rotateY(1.6deg)'
                : 'perspective(1200px) rotateY(-1.6deg)'
            : undefined;
    const style = {
        aspectRatio: `${canvas.artboard.width} / ${canvas.artboard.height}`,
        borderRadius: radius,
        transform: curlTransform,
    } as CSSProperties;

    return (
        <div className={`relative min-w-0 overflow-visible ${sideClass}`} style={style}>
            <div
                className="relative h-full w-full overflow-hidden border border-[rgba(58,36,24,0.16)] bg-[var(--book-page-bg)]"
                style={{
                    borderRadius: radius,
                    boxShadow: pageShadow(side, isSpread, theme),
                }}
            >
                <PageSurface assets={assets} canvas={canvas} context={context} theme={theme}>
                    <ThemedArtboard canvas={canvas} theme={theme}>
                        {page ? (
                            <CanvasElementLayer assets={assets} canvas={canvas} context={context} theme={theme} />
                        ) : null}
                    </ThemedArtboard>
                </PageSurface>
                {page ? null : (
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-[11%] rounded-[14px] border border-dashed opacity-30"
                        style={{ borderColor: theme.tokens.colors.muted }}
                    />
                )}
            </div>
            {isSpread ? <FoldShade side={side} theme={theme} /> : null}
        </div>
    );
}

type FoldShadeProps = {
    side: 'left' | 'right' | 'single';
    theme: NormalizedThemeConfig;
};

function FoldShade({ side, theme }: FoldShadeProps) {
    if (side === 'single' || !theme.book.foldShadow) {
        return null;
    }

    const isLeft = side === 'left';

    return (
        <div
            aria-hidden="true"
            className={`pointer-events-none absolute bottom-[1.2%] top-[1.2%] z-20 hidden w-[14%] md:block ${
                isLeft ? 'right-[-0.5%]' : 'left-[-0.5%]'
            }`}
            style={{
                backgroundImage: isLeft
                    ? 'linear-gradient(90deg, transparent, rgba(58,36,24,0.17))'
                    : 'linear-gradient(90deg, rgba(58,36,24,0.20), transparent)',
                borderRadius: isLeft ? '0 18px 18px 0' : '18px 0 0 18px',
                mixBlendMode: 'multiply',
            }}
        />
    );
}

function pageShadow(side: BookPageSlotProps['side'], isSpread: boolean, theme: NormalizedThemeConfig): string {
    if (!isSpread) {
        return `0 24px 70px ${theme.tokens.colors.shadow}, inset 0 0 0 1px rgba(255,255,255,0.36)`;
    }

    if (side === 'left') {
        return `-18px 20px 46px rgba(58,36,24,0.12), inset -18px 0 26px rgba(58,36,24,0.10), inset 0 0 0 1px rgba(255,255,255,0.28)`;
    }

    return `18px 20px 46px rgba(58,36,24,0.12), inset 18px 0 28px rgba(58,36,24,0.12), inset 0 0 0 1px rgba(255,255,255,0.28)`;
}

function emptyCanvas(): Canvas {
    return {
        schemaVersion: 1,
        version: 1,
        artboard: {
            width: 1080,
            height: 1350,
            unit: 'px',
            background: { type: 'theme' },
            safeArea: { top: 80, right: 80, bottom: 80, left: 80 },
        },
        elements: [],
    };
}
