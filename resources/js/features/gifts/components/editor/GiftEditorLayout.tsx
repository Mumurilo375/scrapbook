import type { ReactNode } from 'react';

type GiftEditorLayoutProps = {
    left: ReactNode;
    center: ReactNode;
    right: ReactNode;
};

export function GiftEditorLayout({ center, left, right }: GiftEditorLayoutProps) {
    return (
        <section className="mx-auto grid max-w-[1440px] gap-4 px-4 py-5 sm:px-6 lg:grid-cols-[260px_minmax(0,1fr)_340px] lg:px-8">
            <aside className="min-w-0">{left}</aside>
            <section className="min-w-0">{center}</section>
            <aside className="min-w-0">{right}</aside>
        </section>
    );
}
