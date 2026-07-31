import type { CSSProperties, ReactNode } from 'react';

import {
    firstTextureLayerStyle,
    normalizeThemeConfig,
    type RendererAssetMap,
    type ThemeConfigInput,
} from '../../../../components/renderer';

type GiftViewerLayoutProps = {
    assets?: RendererAssetMap;
    children: ReactNode;
    theme?: ThemeConfigInput;
};

export function GiftViewerLayout({ assets, children, theme }: GiftViewerLayoutProps) {
    const normalizedTheme = normalizeThemeConfig(theme);
    const appTextureStyle = firstTextureLayerStyle(normalizedTheme, assets, ['fabricBackground', 'appBackground']);
    const style = {
        backgroundColor: '#E5DDED',
        backgroundImage:
            'linear-gradient(rgba(255,255,255,0.24) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px), radial-gradient(circle at 14% 18%, rgba(255,255,255,0.5), transparent 27%), radial-gradient(circle at 84% 72%, color-mix(in srgb, #4B3D59 13%, transparent), transparent 28%), linear-gradient(135deg, #E5DDED, #C9BAD8)',
        backgroundSize: '54px 54px, 54px 54px, 100% 100%, 100% 100%, 100% 100%',
        color: normalizedTheme.tokens.colors.ink,
    } as CSSProperties;

    return (
        <main className="gift-viewer-atelier relative min-h-screen overflow-hidden" style={style}>
            {appTextureStyle ? (
                <div
                    aria-hidden="true"
                    className="pointer-events-none fixed inset-0 z-0 opacity-20 mix-blend-multiply"
                    style={appTextureStyle}
                />
            ) : null}
            <div aria-hidden="true" className="gift-viewer-atelier__ruler" />
            <div aria-hidden="true" className="gift-viewer-atelier__paper-scrap">
                edição
                <br />
                única
            </div>
            <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1600px] flex-col px-3 pb-4 sm:px-5 lg:px-7">
                {children}
            </div>
        </main>
    );
}
