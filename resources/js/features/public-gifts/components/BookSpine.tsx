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
            className="pointer-events-none absolute bottom-[2.2%] left-1/2 top-[2.2%] z-30 hidden -translate-x-1/2 overflow-hidden rounded-full shadow-[inset_12px_0_20px_rgba(255,255,255,0.18),inset_-14px_0_22px_rgba(58,36,24,0.30),0_0_22px_rgba(58,36,24,0.18)] md:block"
            style={{
                ...style,
                background:
                    'linear-gradient(90deg, rgba(58,36,24,0.34), var(--book-spine-color) 46%, rgba(255,255,255,0.22))',
                width: 'var(--book-spine-width)',
            }}
        >
            {spineTextureStyle ? <span className="absolute inset-0" style={spineTextureStyle} /> : null}
            <span className="absolute inset-y-0 left-1/2 w-px bg-[rgba(255,255,255,0.22)]" />
        </div>
    );
}
