import type { Canvas } from '../../domain/canvas/schema';
import type { RendererAssetMap } from './assetTypes';
import { PageRenderer } from './PageRenderer';
import type { RendererContext, ThemeConfigInput } from './theme';

type ScrapbookRendererProps = {
    context?: RendererContext;
    pages: Canvas[];
    activePageIndex?: number;
    assets?: RendererAssetMap;
    theme?: ThemeConfigInput;
};

export function ScrapbookRenderer({ assets, context = 'preview', pages, activePageIndex = 0, theme }: ScrapbookRendererProps) {
    const page = pages[activePageIndex];

    if (!page) {
        return null;
    }

    return <PageRenderer assets={assets} canvas={page} context={context} theme={theme} />;
}
