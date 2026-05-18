import { Layers } from 'lucide-react';

import type { Canvas, CanvasElement } from '../../../../domain/canvas/schema';
import { elementLabel, isTransformableElement } from './canvasTransformUtils';
import { LayerControls } from './LayerControls';
import type { LayerAction } from './layerUtils';
import { sortedElements } from './layerUtils';

type GiftLayersPanelProps = {
    canvas: Canvas | null;
    disabled: boolean;
    onLayerAction: (action: LayerAction) => void;
    onSelectElement: (elementId: string) => void;
    selectedElementId: string | null;
};

export function GiftLayersPanel({
    canvas,
    disabled,
    onLayerAction,
    onSelectElement,
    selectedElementId,
}: GiftLayersPanelProps) {
    const elements = canvas ? sortedElements(canvas).filter(isTransformableElement).reverse() : [];
    const selectedElement = elements.find((element) => element.id === selectedElementId) ?? null;

    return (
        <section className="grid gap-4">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h2 className="text-base font-semibold text-[#1F150A]">Camadas</h2>
                    <p className="mt-1 text-sm text-[#6F5A4A]">{elements.length} elemento(s) na página</p>
                </div>
                <Layers aria-hidden="true" className="h-4 w-4 text-[#7A2634]" />
            </div>

            <LayerControls disabled={disabled || !selectedElement} onAction={onLayerAction} />

            {elements.length > 0 ? (
                <div className="grid gap-2">
                    {elements.map((element) => (
                        <LayerRow
                            element={element}
                            key={element.id}
                            onSelectElement={onSelectElement}
                            selected={element.id === selectedElementId}
                        />
                    ))}
                </div>
            ) : (
                <p className="rounded-[6px] border border-dashed border-[#CBA980] bg-[#FFFBF6] p-3 text-sm text-[#6F5A4A]">
                    Esta página ainda não possui elementos editáveis.
                </p>
            )}
        </section>
    );
}

type LayerRowProps = {
    element: CanvasElement;
    onSelectElement: (elementId: string) => void;
    selected: boolean;
};

function LayerRow({ element, onSelectElement, selected }: LayerRowProps) {
    return (
        <button
            className={`flex min-h-12 items-center justify-between gap-3 rounded-[6px] border px-3 text-left transition ${
                selected
                    ? 'border-[#7A2634] bg-[#FFF0EC] text-[#7A2634]'
                    : 'border-[#D8B991] bg-white text-[#42291D] hover:bg-[#FFF8EF]'
            }`}
            onClick={() => onSelectElement(element.id)}
            type="button"
        >
            <span className="min-w-0">
                <span className="block truncate text-sm font-semibold">{elementLabel(element)}</span>
                <span className="block text-xs font-semibold uppercase text-[#6F5A4A]">{typeLabel(element.type)}</span>
            </span>
            <span className="text-xs font-semibold text-[#6F5A4A]">{element.z}</span>
        </button>
    );
}

function typeLabel(type: string): string {
    if (type === 'text') {
        return 'Texto';
    }

    if (type === 'image') {
        return 'Imagem';
    }

    if (type === 'sticker') {
        return 'Sticker';
    }

    return type;
}
