import type { NormalizedThemeConfig, RendererAssetMap, RendererContext } from '../../../components/renderer';
import type { NormalizedViewerPage } from '../../gifts/components/viewer/viewerTypes';
import type { BookMotionDirection } from './bookMotionUtils';
import { type BookPageRange } from './bookModeUtils';
import { OpenBookSpread } from './OpenBookSpread';

type BookViewerShellProps = {
    assets?: RendererAssetMap;
    context: RendererContext;
    direction: BookMotionDirection;
    isSpread: boolean;
    motionEnabled: boolean;
    pages: NormalizedViewerPage[];
    range: BookPageRange;
    theme: NormalizedThemeConfig;
};

export function BookViewerShell({
    assets,
    context,
    direction,
    isSpread,
    motionEnabled,
    pages,
    range,
    theme,
}: BookViewerShellProps) {
    const leftPage = pages[range.startIndex] ?? null;
    const rightPage = isSpread && range.rightIndex !== null ? (pages[range.rightIndex] ?? null) : null;

    return (
        <OpenBookSpread
            assets={assets}
            context={context}
            direction={direction}
            isSpread={isSpread}
            leftPage={leftPage}
            motionEnabled={motionEnabled}
            rightPage={rightPage}
            showDecorativeRightPage={isSpread && range.hasDecorativeRightPage}
            theme={theme}
        />
    );
}
