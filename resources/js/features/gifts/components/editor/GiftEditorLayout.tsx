import type { ReactNode } from 'react';

type GiftEditorLayoutProps = {
    left: ReactNode;
    center: ReactNode;
    right: ReactNode;
};

export function GiftEditorLayout({ center, left, right }: GiftEditorLayoutProps) {
    return (
        <section className="mx-auto grid max-w-[1560px] gap-3 px-2 py-3 sm:gap-4 sm:px-5 sm:py-4 lg:min-h-[calc(100vh-76px)] lg:grid-cols-[248px_minmax(0,1fr)_372px] lg:px-6">
            <aside className="order-3 min-w-0 lg:sticky lg:top-24 lg:order-1 lg:self-start">{left}</aside>
            <section className="order-1 min-w-0 lg:order-2">{center}</section>
            <aside className="order-2 min-w-0 lg:sticky lg:top-24 lg:order-3 lg:self-start">{right}</aside>
        </section>
    );
}
