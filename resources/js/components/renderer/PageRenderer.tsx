import type { Canvas } from '../../domain/canvas/schema';
import { ElementRenderer } from './ElementRenderer';

type PageRendererProps = {
    canvas: Canvas;
};

export function PageRenderer({ canvas }: PageRendererProps) {
    return (
        <div
            className="relative overflow-hidden bg-white"
            style={{
                aspectRatio: `${canvas.artboard.width} / ${canvas.artboard.height}`,
            }}
        >
            {[...canvas.elements]
                .sort((a, b) => a.z - b.z)
                .map((element) => (
                    <ElementRenderer element={element} key={element.id} />
                ))}
        </div>
    );
}
