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
        backgroundColor: normalizedTheme.tokens.colors.appBackground,
        backgroundImage: `radial-gradient(circle at 12% 10%, color-mix(in srgb, ${normalizedTheme.tokens.colors.bookBackground} 42%, transparent), transparent 25%), radial-gradient(circle at 88% 18%, color-mix(in srgb, ${normalizedTheme.tokens.colors.accentSoft} 30%, transparent), transparent 22%), linear-gradient(180deg, ${normalizedTheme.tokens.colors.appBackground}, color-mix(in srgb, ${normalizedTheme.tokens.colors.bookBackground} 24%, ${normalizedTheme.tokens.colors.appBackground}))`,
        color: normalizedTheme.tokens.colors.ink,
    } as CSSProperties;

    return (
        <main className="relative min-h-screen overflow-hidden" style={style}>
            {appTextureStyle ? (
                <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0" style={appTextureStyle} />
            ) : null}
            <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1180px] flex-col px-4 py-4 sm:px-6 lg:px-8">
                {children}
            </div>
        </main>
    );
}
