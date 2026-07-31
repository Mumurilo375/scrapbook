import type { CSSProperties } from 'react';

import {
    firstTextureLayerStyle,
    type NormalizedThemeConfig,
    type RendererAssetMap,
    type RendererContext,
} from '../../../components/renderer';
import type { NormalizedViewerPage } from '../../gifts/components/viewer/viewerTypes';
import type { BookMotionDirection } from './bookMotionUtils';
import { BookPageSlot } from './BookPageSlot';
import { BookSpine } from './BookSpine';

type OpenBookSpreadProps = {
    assets?: RendererAssetMap;
    context: RendererContext;
    direction: BookMotionDirection;
    isSpread: boolean;
    leftPage: NormalizedViewerPage | null;
    motionEnabled: boolean;
    rightPage: NormalizedViewerPage | null;
    showDecorativeRightPage: boolean;
    theme: NormalizedThemeConfig;
};

export function OpenBookSpread({
    assets,
    context,
    direction,
    isSpread,
    leftPage,
    motionEnabled,
    rightPage,
    showDecorativeRightPage,
    theme,
}: OpenBookSpreadProps) {
    const bookTextureStyle = firstTextureLayerStyle(theme, assets, ['bookSurface', 'kraftSurface']);
    const referenceCanvas = leftPage?.canvas ?? rightPage?.canvas ?? null;
    const spreadStyle = {
        '--book-bg': theme.tokens.colors.bookBackground,
        '--book-page-bg': theme.page.backgroundColor,
        '--book-gap': `${theme.book.spreadGap}px`,
        maxWidth: isSpread ? 'min(100%, 1380px)' : 'min(100%, 720px)',
    } as CSSProperties;

    return (
        <div
            className="gift-book-shell mx-auto w-full transition duration-300 ease-out"
            data-spread={isSpread ? 'true' : 'false'}
            data-motion={motionEnabled ? 'on' : 'off'}
            style={spreadStyle}
        >
            <div aria-hidden="true" className="gift-book-shell__cover" style={bookTextureStyle ?? undefined} />
            <div aria-hidden="true" className="gift-book-shell__stack gift-book-shell__stack--back" />
            <div aria-hidden="true" className="gift-book-shell__stack gift-book-shell__stack--middle" />
            <div
                className={`gift-book-shell__spread relative z-10 grid min-w-0 items-start ${
                    isSpread ? 'grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-[var(--book-gap)]' : 'grid-cols-1'
                }`}
            >
                <BookPageSlot
                    assets={assets}
                    context={context}
                    isSpread={isSpread}
                    page={leftPage}
                    referenceCanvas={referenceCanvas}
                    side={isSpread ? 'left' : 'single'}
                    theme={theme}
                />
                {isSpread ? (
                    <BookPageSlot
                        assets={assets}
                        context={context}
                        isSpread={isSpread}
                        page={rightPage}
                        referenceCanvas={referenceCanvas}
                        side="right"
                        theme={theme}
                    />
                ) : null}
            </div>
            {isSpread ? <BookSpine assets={assets} theme={theme} /> : null}
            {isSpread ? (
                <div
                    aria-hidden="true"
                    className="gift-book-motion-shadow pointer-events-none absolute inset-0 z-20 hidden md:block"
                    data-direction={direction}
                    data-motion={motionEnabled ? 'on' : 'off'}
                />
            ) : null}
            {isSpread && showDecorativeRightPage ? (
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute bottom-[10%] right-[7%] top-[10%] z-20 hidden w-px bg-[rgba(58,36,24,0.10)] md:block"
                />
            ) : null}
            <span aria-hidden="true" className="gift-book-shell__curl" />
        </div>
    );
}
