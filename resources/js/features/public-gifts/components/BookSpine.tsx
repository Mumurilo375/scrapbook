import type { CSSProperties } from 'react';

import {
    buildTextureLayerStyle,
    type NormalizedThemeConfig,
    type RendererAssetMap,
} from '../../../components/renderer';

type BookSpineProps = {
    assets?: RendererAssetMap;
    theme: NormalizedThemeConfig;
};

export function BookSpine({ assets, theme }: BookSpineProps) {
    const spineTextureStyle =
        buildTextureLayerStyle(theme, assets, 'bookSpine') ?? buildTextureLayerStyle(theme, assets, 'bookSurface');
    const style = {
        '--book-spine-width': `${theme.book.spineWidth}px`,
        '--book-spine-color': theme.book.spineColor,
    } as CSSProperties;

    return (
        <div
            aria-hidden="true"
            className="gift-book-spine pointer-events-none absolute bottom-[2.2%] left-1/2 top-[2.2%] z-30 hidden -translate-x-1/2 md:block"
            style={{
                ...style,
                width: 'var(--book-spine-width)',
            }}
        >
            <span
                className="gift-book-spine__crease absolute inset-y-0 left-1/2 -translate-x-1/2"
                style={spineTextureStyle ?? undefined}
            />
            {[18, 39, 61, 82].map((top) => (
                <span className="gift-book-spine__ring" key={top} style={{ top: `${top}%` }}>
                    <span />
                </span>
            ))}
        </div>
    );
}
