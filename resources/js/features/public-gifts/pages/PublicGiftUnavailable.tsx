import { Head } from '@inertiajs/react';

import { PublicGiftUnavailable as PublicGiftUnavailableView } from '../components/PublicGiftUnavailable';

type PublicGiftUnavailableProps = {
    createUrl: string;
};

export default function PublicGiftUnavailable({ createUrl }: PublicGiftUnavailableProps) {
    return (
        <>
            <Head title="Presente indisponível">
                <meta content="noindex,nofollow" name="robots" />
            </Head>
            <PublicGiftUnavailableView createUrl={createUrl} />
        </>
    );
}
