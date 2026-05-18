import { useEffect, useMemo, useState } from 'react';

import { assetMapFromList, normalizeThemeConfig, type RendererContext } from '../../../../components/renderer';
import { GiftPageNavigator } from './GiftPageNavigator';
import { GiftViewerControls } from './GiftViewerControls';
import { GiftViewerFrame } from './GiftViewerFrame';
import type { ViewerGift } from './viewerTypes';
import { normalizeViewerPages } from './viewerUtils';

type GiftViewerStageProps = {
    context?: RendererContext;
    gift: ViewerGift;
    showHeader?: boolean;
};

export function GiftViewerStage({ context = 'preview', gift, showHeader = true }: GiftViewerStageProps) {
    const pages = useMemo(() => normalizeViewerPages(gift.pages), [gift.pages]);
    const theme = useMemo(() => normalizeThemeConfig(gift.theme?.config), [gift.theme?.config]);
    const assetMap = useMemo(() => assetMapFromList(gift.assets), [gift.assets]);
    const [activePageIndex, setActivePageIndex] = useState(0);
    const activePage = pages[activePageIndex] ?? null;

    function goToPage(index: number) {
        setActivePageIndex(Math.max(0, Math.min(index, pages.length - 1)));
    }

    function goNext() {
        goToPage(activePageIndex + 1);
    }

    function goPrevious() {
        goToPage(activePageIndex - 1);
    }

    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === 'ArrowLeft') {
                setActivePageIndex((current) => Math.max(0, current - 1));
            }

            if (event.key === 'ArrowRight') {
                setActivePageIndex((current) => Math.min(Math.max(0, pages.length - 1), current + 1));
            }
        }

        window.addEventListener('keydown', handleKeyDown);

        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [pages.length]);

    return (
        <section className="grid flex-1 content-start gap-5 py-6">
            {showHeader ? (
                <div className="mx-auto max-w-[680px] text-center">
                    <p className="text-xs font-semibold uppercase" style={{ color: theme.tokens.colors.accent }}>
                        {gift.theme?.name ?? 'Scrapbook digital'}
                    </p>
                    <h1 className="mt-2 font-editorial text-3xl font-semibold sm:text-4xl" style={{ color: theme.elements.text.headingColor }}>
                        {gift.title}
                    </h1>
                    <p className="mt-2 text-sm font-semibold" style={{ color: theme.tokens.colors.mutedInk }}>
                        {gift.recipient_name ? `Para ${gift.recipient_name}` : 'Um presente especial'}
                        {gift.sender_name ? `, de ${gift.sender_name}` : ''}
                    </p>
                </div>
            ) : null}

            <GiftViewerFrame assets={assetMap} context={context} page={activePage} theme={gift.theme?.config} />
            <GiftViewerControls
                activePageIndex={activePageIndex}
                onNext={goNext}
                onPrevious={goPrevious}
                pageCount={pages.length}
            />
            <GiftPageNavigator activePageIndex={activePageIndex} onSelectPage={goToPage} pages={pages} />
        </section>
    );
}
