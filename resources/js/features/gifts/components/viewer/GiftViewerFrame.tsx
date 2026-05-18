import { PageRenderer } from '../../../../components/renderer';
import type { NormalizedViewerPage } from './viewerTypes';

type GiftViewerFrameProps = {
    page: NormalizedViewerPage | null;
};

export function GiftViewerFrame({ page }: GiftViewerFrameProps) {
    return (
        <div className="mx-auto w-full max-w-[430px]">
            {page ? (
                <PageRenderer canvas={page.canvas} />
            ) : (
                <div className="flex aspect-[390/844] items-center justify-center rounded-[8px] border border-dashed border-[#CBA980] bg-[#FFF7EE] px-6 text-center text-sm font-semibold text-[#6F5A4A]">
                    Nenhuma página disponível.
                </div>
            )}
        </div>
    );
}
