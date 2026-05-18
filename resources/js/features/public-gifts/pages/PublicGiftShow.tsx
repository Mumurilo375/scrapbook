import { Head } from '@inertiajs/react';

import type { ViewerGift } from '../../gifts/components/viewer/viewerTypes';
import { PublicGiftViewerShell } from '../components/PublicGiftViewerShell';

type PublicGiftShowProps = {
    gift: ViewerGift;
};

export default function PublicGiftShow({ gift }: PublicGiftShowProps) {
    return (
        <>
            <Head title={gift.title}>
                <meta content="noindex,nofollow" name="robots" />
            </Head>
            <PublicGiftViewerShell gift={gift} mode="public" />
        </>
    );
}
