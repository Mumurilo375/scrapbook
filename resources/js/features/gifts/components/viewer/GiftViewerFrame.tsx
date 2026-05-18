import {
    normalizeThemeConfig,
    PageRenderer,
    ScrapbookStage,
    type RendererAssetMap,
    type RendererContext,
    type ThemeConfigInput,
} from '../../../../components/renderer';
import type { NormalizedViewerPage } from './viewerTypes';

type GiftViewerFrameProps = {
    assets?: RendererAssetMap;
    context?: RendererContext;
    page: NormalizedViewerPage | null;
    theme?: ThemeConfigInput;
};

export function GiftViewerFrame({ assets, context = 'preview', page, theme }: GiftViewerFrameProps) {
    const normalizedTheme = normalizeThemeConfig(theme);

    return (
        <ScrapbookStage context={context} theme={theme}>
            {page ? (
                <PageRenderer assets={assets} canvas={page.canvas} context={context} theme={theme} />
            ) : (
                <div
                    className="flex aspect-[4/5] items-center justify-center rounded-[10px] border border-dashed px-6 text-center text-sm font-semibold shadow-sm"
                    style={{
                        backgroundColor: normalizedTheme.tokens.colors.paper,
                        borderColor: normalizedTheme.tokens.colors.muted,
                        color: normalizedTheme.tokens.colors.mutedInk,
                    }}
                >
                    Esta página ainda está em branco.
                </div>
            )}
        </ScrapbookStage>
    );
}
