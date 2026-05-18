import type { Canvas } from '../../domain/canvas/schema';
import { ElementRenderer } from './ElementRenderer';

type PageRendererProps = {
    canvas: Canvas;
    onElementClick?: (element: Canvas['elements'][number]) => void;
    onMediaDrop?: (element: Canvas['elements'][number], mediaItemId: string) => void;
    selectedElementId?: string | null;
};

export function PageRenderer({ canvas, onElementClick, onMediaDrop, selectedElementId = null }: PageRendererProps) {
    const width = canvas.artboard.width;
    const height = canvas.artboard.height;

    return (
        <div
            className="paper-texture relative w-full overflow-hidden border border-[#D8B991] bg-[#FFF7EE] shadow-[0_18px_42px_#221C191F]"
            style={{
                aspectRatio: `${width} / ${height}`,
                backgroundColor: backgroundColor(canvas.background),
            }}
        >
            {[...canvas.elements]
                .sort((a, b) => a.z - b.z)
                .map((element) => (
                    <ElementRenderer
                        artboard={{ height, width }}
                        element={element}
                        key={element.id}
                        onElementClick={onElementClick}
                        onMediaDrop={onMediaDrop}
                        selectedElementId={selectedElementId}
                    />
                ))}
        </div>
    );
}

function backgroundColor(background: Canvas['background']): string | undefined {
    if (!background) {
        return undefined;
    }

    if (background.color === 'var(--paper)' || background.value === 'paper') {
        return '#FFF7EE';
    }

    if (background.color === 'var(--kraft)' || background.value === 'kraft') {
        return '#EAD2B8';
    }

    return typeof background.color === 'string' && /^#[0-9a-f]{3,8}$/i.test(background.color)
        ? background.color
        : undefined;
}
