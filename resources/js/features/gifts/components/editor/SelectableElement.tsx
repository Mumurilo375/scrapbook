import type { PointerEvent } from 'react';
import { Lock } from 'lucide-react';

import type { Canvas, CanvasElement } from '../../../../domain/canvas/schema';
import { elementLabel, isElementLocked } from './canvasTransformUtils';
import { TransformHandles } from './TransformHandles';
import type { TransformMode } from './useElementTransform';

type SelectableElementProps = {
    canvas: Canvas;
    disabled: boolean;
    element: CanvasElement;
    onDoubleClick?: (element: CanvasElement) => void;
    onPointerDown: (event: PointerEvent<HTMLElement>, element: CanvasElement, mode: TransformMode) => void;
    selected: boolean;
};

export function SelectableElement({
    canvas,
    disabled,
    element,
    onDoubleClick,
    onPointerDown,
    selected,
}: SelectableElementProps) {
    const locked = disabled || isElementLocked(element);
    const style = {
        left: `${toPercent(element.x, canvas.artboard.width)}%`,
        top: `${toPercent(element.y, canvas.artboard.height)}%`,
        width: `${toPercent(element.w, canvas.artboard.width)}%`,
        height: `${toPercent(element.h, canvas.artboard.height)}%`,
        transform: `rotate(${element.rotation}deg)`,
        zIndex: safeZ(element.z) + (selected ? 1000 : 0),
    };
    const label = elementLabel(element);

    return (
        <div
            aria-label={`${label} selecionável`}
            aria-pressed={selected}
            className={`absolute touch-none outline-none transition ${
                locked ? 'cursor-default' : selected ? 'cursor-move' : 'cursor-pointer'
            }`}
            onDoubleClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onDoubleClick?.(element);
            }}
            onPointerDown={(event) => onPointerDown(event, element, 'move')}
            role="button"
            style={style}
            tabIndex={0}
        >
            <span
                className={`pointer-events-none absolute inset-0 rounded-[6px] ${
                    selected
                        ? 'border-2 border-[#FF765B] shadow-[0_8px_24px_rgba(33,22,45,0.2)]'
                        : 'border border-transparent hover:border-[#FF765B]/55'
                }`}
            />
            {selected ? (
                <>
                    <span className="pointer-events-none absolute -top-7 left-0 max-w-full truncate rounded-[4px] bg-[#21162D] px-2 py-1 text-[11px] font-bold text-[#FBFAF6] shadow-[0_4px_10px_rgba(33,22,45,0.24)]">
                        {label}
                    </span>
                    {locked ? (
                        <span className="pointer-events-none absolute right-1 top-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#21162D] text-white shadow-sm">
                            <Lock aria-hidden="true" className="h-3.5 w-3.5" />
                        </span>
                    ) : (
                        <TransformHandles disabled={locked} element={element} onPointerDown={onPointerDown} />
                    )}
                </>
            ) : null}
        </div>
    );
}

function toPercent(value: number, total: number): number {
    if (!Number.isFinite(value) || !Number.isFinite(total) || total <= 0) {
        return 0;
    }

    return (value / total) * 100;
}

function safeZ(value: number): number {
    return Number.isFinite(value) ? value : 0;
}
