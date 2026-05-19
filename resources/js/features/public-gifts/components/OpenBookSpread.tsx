import type { CSSProperties } from 'react';

import {
    firstTextureLayerStyle,
    type NormalizedThemeConfig,
    type RendererAssetMap,
    type RendererContext,
} from '../../../components/renderer';
import type { NormalizedViewerPage } from '../../gifts/components/viewer/viewerTypes';
import { BookPageSlot } from './BookPageSlot';
import { BookSpine } from './BookSpine';

type OpenBookSpreadProps = {
    assets?: RendererAssetMap;
    context: RendererContext;
    isSpread: boolean;
    leftPage: NormalizedViewerPage | null;
    rightPage: NormalizedViewerPage | null;
    showDecorativeRightPage: boolean;
    theme: NormalizedThemeConfig;
};

export function OpenBookSpread({
    assets,
    context,
    isSpread,
    leftPage,
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
        maxWidth: isSpread ? 'min(100%, 1180px)' : 'min(100%, 620px)',
    } as CSSProperties;

    return (
        <div className="mx-auto w-full transition duration-300 ease-out" style={spreadStyle}>
            <div
                className={`relative overflow-hidden border border-[rgba(58,36,24,0.16)] bg-[var(--book-bg)] shadow-[0_34px_96px_rgba(58,36,24,0.24)] ${
                    isSpread ? 'rounded-[30px] p-3 sm:p-4 lg:p-5' : 'rounded-[28px] p-3 sm:p-4'
                }`}
                style={{
                    backgroundImage:
                        'radial-gradient(circle at 18% 12%, rgba(255,255,255,0.24), transparent 24%), linear-gradient(135deg, rgba(255,255,255,0.16), transparent 44%, rgba(58,36,24,0.12))',
                }}
            >
                {bookTextureStyle ? (
                    <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={bookTextureStyle} />
                ) : null}
                <div className="absolute inset-x-[7%] bottom-[-4%] h-[11%] rounded-[50%] bg-[rgba(58,36,24,0.22)] blur-2xl" />
                <div
                    className={`relative z-10 grid min-w-0 items-start ${
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
                {isSpread && showDecorativeRightPage ? (
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute bottom-[10%] right-[7%] top-[10%] z-20 hidden w-px bg-[rgba(58,36,24,0.10)] md:block"
                    />
                ) : null}
            </div>
        </div>
    );
}
