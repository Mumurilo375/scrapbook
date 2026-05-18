import type { Canvas } from '../../domain/canvas/schema';
import { PageRenderer } from './PageRenderer';
import type { RendererContext, ThemeConfigInput } from './theme';

type ScrapbookRendererProps = {
    context?: RendererContext;
    pages: Canvas[];
    activePageIndex?: number;
    theme?: ThemeConfigInput;
};

export function ScrapbookRenderer({ context = 'preview', pages, activePageIndex = 0, theme }: ScrapbookRendererProps) {
    const page = pages[activePageIndex];

    if (!page) {
        return null;
    }

    return <PageRenderer canvas={page} context={context} theme={theme} />;
}
