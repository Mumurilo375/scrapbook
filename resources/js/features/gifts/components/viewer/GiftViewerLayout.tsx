import type { ReactNode } from 'react';

type GiftViewerLayoutProps = {
    children: ReactNode;
};

export function GiftViewerLayout({ children }: GiftViewerLayoutProps) {
    return (
        <main className="scrapbook-background min-h-screen bg-[#F4E8D9] text-[#221C19]">
            <div className="mx-auto flex min-h-screen w-full max-w-[1180px] flex-col px-4 py-4 sm:px-6 lg:px-8">
                {children}
            </div>
        </main>
    );
}
