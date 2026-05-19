import type { NormalizedThemeConfig, RendererAssetMap, RendererContext } from '../../../components/renderer';
import type { NormalizedViewerPage } from '../../gifts/components/viewer/viewerTypes';
import { type BookPageRange } from './bookModeUtils';
import { OpenBookSpread } from './OpenBookSpread';

type BookViewerShellProps = {
    assets?: RendererAssetMap;
    context: RendererContext;
    isSpread: boolean;
    pages: NormalizedViewerPage[];
    range: BookPageRange;
    theme: NormalizedThemeConfig;
};

export function BookViewerShell({ assets, context, isSpread, pages, range, theme }: BookViewerShellProps) {
    const leftPage = pages[range.startIndex] ?? null;
    const rightPage = isSpread && range.rightIndex !== null ? (pages[range.rightIndex] ?? null) : null;

    return (
        <OpenBookSpread
            assets={assets}
            context={context}
            isSpread={isSpread}
            leftPage={leftPage}
            rightPage={rightPage}
            showDecorativeRightPage={isSpread && range.hasDecorativeRightPage}
            theme={theme}
        />
    );
}
