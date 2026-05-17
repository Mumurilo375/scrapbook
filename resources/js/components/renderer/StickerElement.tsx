import type { CSSProperties } from 'react';
import type { CanvasElement } from '../../domain/canvas/schema';

type StickerElementProps = {
    element: CanvasElement;
    style: CSSProperties;
};

export function StickerElement({ element, style }: StickerElementProps) {
    const label = typeof element.label === 'string' ? element.label : '';

    return (
        <div className="absolute flex items-center justify-center rounded-[4px] bg-[#F8D8D3] px-2 text-center text-[#7A2634]" style={style}>
            {label}
        </div>
    );
}
