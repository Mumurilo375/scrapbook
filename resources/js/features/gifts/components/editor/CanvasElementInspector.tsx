import type { Canvas } from '../../../../domain/canvas/schema';

type CanvasElementInspectorProps = {
    canvas: Canvas | null;
};

export function CanvasElementInspector({ canvas }: CanvasElementInspectorProps) {
    if (!canvas) {
        return null;
    }

    return (
        <details className="rounded-[8px] border border-[#D8B991] bg-[#FFF7EE] p-4 text-[#1F150A] shadow-sm">
            <summary className="cursor-pointer text-sm font-semibold uppercase text-[#7A2634]">Debug JSON</summary>
            <pre className="mt-3 max-h-80 overflow-auto rounded-[6px] border border-[#E5D0B8] bg-[#FFFBF6] p-3 text-xs leading-5 text-[#42291D]">
                {JSON.stringify(canvas, null, 2)}
            </pre>
        </details>
    );
}
