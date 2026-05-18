import type { Canvas } from '../../../../domain/canvas/schema';

type GiftDebugPanelProps = {
    canvas: Canvas | null;
    pageId: string | null;
};

export function GiftDebugPanel({ canvas, pageId }: GiftDebugPanelProps) {
    if (!canvas) {
        return (
            <section className="rounded-[6px] border border-dashed border-[#CBA980] bg-[#FFFBF6] p-3 text-sm text-[#6F5A4A]">
                Nenhum canvas selecionado.
            </section>
        );
    }

    return (
        <section className="grid gap-3 text-[#1F150A]">
            <div>
                <h2 className="text-base font-semibold">Debug</h2>
                <p className="mt-1 text-sm text-[#6F5A4A]">Visível apenas em ambiente local/dev.</p>
            </div>
            <div className="rounded-[6px] border border-[#E5D0B8] bg-[#FFFBF6] p-3 text-xs font-semibold text-[#6F5A4A]">
                Página: <span className="text-[#42291D]">{pageId ?? 'sem seleção'}</span>
            </div>
            <pre className="max-h-[520px] overflow-auto rounded-[6px] border border-[#E5D0B8] bg-[#FFFBF6] p-3 text-xs leading-5 text-[#42291D]">
                {JSON.stringify(canvas, null, 2)}
            </pre>
        </section>
    );
}
