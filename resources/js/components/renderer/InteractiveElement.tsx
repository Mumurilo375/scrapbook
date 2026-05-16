import type { CSSProperties } from 'react';
import type { CanvasElement } from '../../domain/canvas/schema';

type InteractiveElementProps = {
    element: CanvasElement;
    style: CSSProperties;
};

export function InteractiveElement({ element, style }: InteractiveElementProps) {
    const label = typeof element.label === 'string' ? element.label : '';

    return (
        <button className="absolute rounded-md border border-current px-3" style={style} type="button">
            {label}
        </button>
    );
}
