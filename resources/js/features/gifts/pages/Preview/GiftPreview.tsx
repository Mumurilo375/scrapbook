import { Head } from '@inertiajs/react';

import { GiftViewerLayout } from '../../components/viewer/GiftViewerLayout';
import { GiftViewerStage } from '../../components/viewer/GiftViewerStage';
import { GiftViewerTopBar } from '../../components/viewer/GiftViewerTopBar';
import type { ViewerGift } from '../../components/viewer/viewerTypes';

type GiftPreviewProps = {
    gift: ViewerGift;
};

export default function GiftPreview({ gift }: GiftPreviewProps) {
    return (
        <>
            <Head title={`Preview ${gift.title}`}>
                <meta content="noindex,nofollow" name="robots" />
            </Head>
            <GiftViewerLayout>
                <GiftViewerTopBar
                    createUrl={gift.urls.create}
                    editUrl={gift.urls.edit}
                    mode="preview"
                    status={gift.status}
                    title={gift.title}
                />
                <GiftViewerStage gift={gift} />
            </GiftViewerLayout>
        </>
    );
}
