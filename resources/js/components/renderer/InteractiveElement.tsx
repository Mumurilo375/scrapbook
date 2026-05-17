import type { CSSProperties } from 'react';
import type { CanvasElement } from '../../domain/canvas/schema';

type InteractiveElementProps = {
    element: CanvasElement;
    style: CSSProperties;
};

export function InteractiveElement({ element, style }: InteractiveElementProps) {
    const label = typeof element.label === 'string' ? element.label : '';

    return (
        <button className="absolute rounded-[4px] border border-[#CBA980] bg-[#FFF7EE] px-3 text-[#42291D]" style={style} type="button">
            {label}
        </button>
    );
}
