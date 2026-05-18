import { PageRenderer, ScrapbookStage, type RendererContext, type ThemeConfigInput } from '../../../../components/renderer';
import type { NormalizedViewerPage } from './viewerTypes';

type GiftViewerFrameProps = {
    context?: RendererContext;
    page: NormalizedViewerPage | null;
    theme?: ThemeConfigInput;
};

export function GiftViewerFrame({ context = 'preview', page, theme }: GiftViewerFrameProps) {
    return (
        <ScrapbookStage context={context} theme={theme}>
            {page ? (
                <PageRenderer canvas={page.canvas} context={context} theme={theme} />
            ) : (
                <div className="flex aspect-[3/4] items-center justify-center rounded-[8px] border border-dashed border-[#CBA980] bg-[#FFF7EE] px-6 text-center text-sm font-semibold text-[#6F5A4A]">
                    Nenhuma página disponível.
                </div>
            )}
        </ScrapbookStage>
    );
}
