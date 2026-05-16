import type { Canvas } from '../../domain/canvas/schema';
import { PageRenderer } from './PageRenderer';

type ScrapbookRendererProps = {
    pages: Canvas[];
    activePageIndex?: number;
};

export function ScrapbookRenderer({ pages, activePageIndex = 0 }: ScrapbookRendererProps) {
    const page = pages[activePageIndex];

    if (!page) {
        return null;
    }

    return <PageRenderer canvas={page} />;
}
