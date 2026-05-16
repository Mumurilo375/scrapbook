import type { CSSProperties } from 'react';
import type { CanvasElement } from '../../domain/canvas/schema';

type MusicElementProps = {
    element: CanvasElement;
    style: CSSProperties;
};

export function MusicElement({ element, style }: MusicElementProps) {
    const title = typeof element.title === 'string' ? element.title : 'Musica';

    return (
        <div className="absolute flex items-center rounded-md border border-current px-3 text-sm" style={style}>
            {title}
        </div>
    );
}
