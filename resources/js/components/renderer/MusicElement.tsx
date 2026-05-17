import type { CSSProperties } from 'react';
import type { CanvasElement } from '../../domain/canvas/schema';

type MusicElementProps = {
    element: CanvasElement;
    style: CSSProperties;
};

export function MusicElement({ element, style }: MusicElementProps) {
    const title = typeof element.title === 'string' ? element.title : 'Musica';

    return (
        <div className="absolute flex items-center rounded-[4px] border border-[#7E8F68] bg-[#E7EBD8] px-3 text-sm text-[#48573A]" style={style}>
            {title}
        </div>
    );
}
