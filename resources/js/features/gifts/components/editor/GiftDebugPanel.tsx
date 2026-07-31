import type { Canvas } from '../../../../domain/canvas/schema';

type GiftDebugPanelProps = {
    canvas: Canvas | null;
    pageId: string | null;
};

export function GiftDebugPanel({ canvas, pageId }: GiftDebugPanelProps) {
    if (!canvas) {
        return (
            <section className="gift-editor-inspector-section border-b border-[#D8D2DE] py-5 text-sm text-[#645D68]">
                Nenhum canvas selecionado.
            </section>
        );
    }

    return (
        <section className="gift-editor-inspector-section grid text-[#342E38]">
            <header className="border-b border-[#D8D2DE] pb-4">
                <h2 className="font-display text-lg font-bold tracking-[-0.02em] text-[#21162D]">Debug</h2>
                <p className="mt-1 text-sm text-[#746D78]">Visível apenas em ambiente local/dev.</p>
            </header>
            <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-3 border-b border-[#D8D2DE] py-3 text-xs">
                <dt className="font-semibold text-[#746D78]">Página</dt>
                <dd className="truncate text-right font-bold text-[#21162D]">{pageId ?? 'sem seleção'}</dd>
            </dl>
            <pre className="max-h-[520px] overflow-auto border-y border-[#3C2C47] bg-[#21162D] p-3 text-xs leading-5 text-[#F5F1F7]">
                {JSON.stringify(canvas, null, 2)}
            </pre>
        </section>
    );
}
