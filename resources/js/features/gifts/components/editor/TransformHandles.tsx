import type { PointerEvent } from 'react';

import type { CanvasElement } from '../../../../domain/canvas/schema';
import type { ResizeHandle, TransformMode } from './useElementTransform';

type TransformHandlesProps = {
    disabled: boolean;
    element: CanvasElement;
    onPointerDown: (event: PointerEvent<HTMLElement>, element: CanvasElement, mode: TransformMode) => void;
};

const RESIZE_HANDLES: Array<{ id: ResizeHandle; className: string; label: string }> = [
    { id: 'nw', className: '-left-2 -top-2 cursor-nwse-resize', label: 'Redimensionar pelo canto superior esquerdo' },
    { id: 'ne', className: '-right-2 -top-2 cursor-nesw-resize', label: 'Redimensionar pelo canto superior direito' },
    { id: 'sw', className: '-bottom-2 -left-2 cursor-nesw-resize', label: 'Redimensionar pelo canto inferior esquerdo' },
    { id: 'se', className: '-bottom-2 -right-2 cursor-nwse-resize', label: 'Redimensionar pelo canto inferior direito' },
];

export function TransformHandles({ disabled, element, onPointerDown }: TransformHandlesProps) {
    if (disabled) {
        return null;
    }

    return (
        <>
            {RESIZE_HANDLES.map((handle) => (
                <button
                    aria-label={handle.label}
                    className={`absolute h-4 w-4 rounded-full border border-white bg-[#7A2634] shadow-[0_2px_6px_rgba(31,21,10,0.28)] ${handle.className}`}
                    key={handle.id}
                    onPointerDown={(event) => onPointerDown(event, element, handle.id)}
                    title={handle.label}
                    type="button"
                />
            ))}
            <button
                aria-label="Rotacionar elemento"
                className="absolute left-1/2 top-[-42px] h-5 w-5 -translate-x-1/2 rounded-full border border-white bg-[#D93632] shadow-[0_2px_6px_rgba(31,21,10,0.28)]"
                onPointerDown={(event) => onPointerDown(event, element, 'rotate')}
                title="Rotacionar"
                type="button"
            />
            <span className="pointer-events-none absolute left-1/2 top-[-28px] h-7 w-px -translate-x-1/2 bg-[#D93632]" />
        </>
    );
}
