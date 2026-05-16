import { Head } from '@inertiajs/react';

import { LandingPage } from '../features/marketing/landing/LandingPage';

export default function Home() {
    return (
        <>
            <Head title="Scrapbook digital artesanal" />
            <LandingPage />
        </>
    );
}
