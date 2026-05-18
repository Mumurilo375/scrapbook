import type { ReactNode } from 'react';

type GiftEditorLayoutProps = {
    left: ReactNode;
    center: ReactNode;
    right: ReactNode;
};

export function GiftEditorLayout({ center, left, right }: GiftEditorLayoutProps) {
    return (
        <section className="mx-auto grid max-w-[1560px] gap-4 px-3 py-4 sm:px-5 lg:min-h-[calc(100vh-76px)] lg:grid-cols-[248px_minmax(0,1fr)_372px] lg:px-6">
            <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">{left}</aside>
            <section className="min-w-0">{center}</section>
            <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">{right}</aside>
        </section>
    );
}
