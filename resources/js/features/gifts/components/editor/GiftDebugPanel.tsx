import type { Canvas } from '../../../../domain/canvas/schema';

type GiftDebugPanelProps = {
    canvas: Canvas | null;
    pageId: string | null;
};

export function GiftDebugPanel({ canvas, pageId }: GiftDebugPanelProps) {
    if (!canvas) {
        return (
            <section className="rounded-[6px] border border-dashed border-[#C9C1CD] bg-[#EFEBF3] p-4 text-sm text-[#342E38]">
                Nenhum canvas selecionado.
            </section>
        );
    }

    return (
        <section className="grid gap-4 text-[#342E38]">
            <div>
                <h2 className="font-display text-lg font-bold tracking-[-0.02em] text-[#21162D]">Debug</h2>
                <p className="mt-1 text-sm text-[#746D78]">Visível apenas em ambiente local/dev.</p>
            </div>
            <div className="rounded-[6px] border border-[#C9C1CD] bg-[#EFEBF3] p-3 text-xs font-semibold text-[#342E38]">
                Página: <span className="text-[#21162D]">{pageId ?? 'sem seleção'}</span>
            </div>
            <pre className="max-h-[520px] overflow-auto rounded-[6px] bg-[#21162D] p-3 text-xs leading-5 text-[#F5F1F7]">
                {JSON.stringify(canvas, null, 2)}
            </pre>
        </section>
    );
}
