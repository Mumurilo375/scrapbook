import { Head } from '@inertiajs/react';

import { PublicGiftViewerShell } from '../../../public-gifts/components/PublicGiftViewerShell';
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
            <PublicGiftViewerShell gift={gift} mode="preview" />
        </>
    );
}
