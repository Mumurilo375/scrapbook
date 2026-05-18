import { useRef, type PointerEvent, type RefObject } from 'react';

import type { Canvas, CanvasElement } from '../../../../domain/canvas/schema';
import {
    canvasPointFromEvent,
    clampElementToCanvas,
    elementCenter,
    isElementLocked,
    minimumHeightForElement,
    minimumWidthForElement,
    normalizeRotation,
    roundNumber,
} from './canvasTransformUtils';

export type ResizeHandle = 'nw' | 'ne' | 'sw' | 'se';
export type TransformMode = 'move' | 'rotate' | ResizeHandle;

const CLICK_DRAG_THRESHOLD_PX = 6;

type UseElementTransformArgs = {
    artboardRef: RefObject<HTMLDivElement | null>;
    canvas: Canvas;
    disabled: boolean;
    onChangeElement: (elementId: string, nextElement: CanvasElement) => void;
    onElementClick?: (element: CanvasElement) => void;
    onSelectElement: (elementId: string) => void;
    onTransformEnd?: (elementId: string, mode: TransformMode) => void;
    onTransformStart?: (elementId: string, mode: TransformMode) => void;
};

type TransformSession = {
    aspectRatio: number;
    center: { x: number; y: number };
    element: CanvasElement;
    hasDragged: boolean;
    mode: TransformMode;
    pointerId: number;
    startAngle: number;
    startClientPoint: { x: number; y: number };
    startPoint: { x: number; y: number };
};

export function useElementTransform({
    artboardRef,
    canvas,
    disabled,
    onChangeElement,
    onElementClick,
    onSelectElement,
    onTransformEnd,
    onTransformStart,
}: UseElementTransformArgs) {
    const sessionRef = useRef<TransformSession | null>(null);

    function beginTransform(event: PointerEvent<HTMLElement>, element: CanvasElement, mode: TransformMode) {
        event.preventDefault();
        event.stopPropagation();
        onSelectElement(element.id);

        if (disabled || isElementLocked(element)) {
            return;
        }

        const artboardElement = artboardRef.current;

        if (!artboardElement) {
            return;
        }

        const startPoint = canvasPointFromEvent(event, artboardElement, canvas);
        const center = elementCenter(element);
        const startAngle = angleBetween(center, startPoint);

        sessionRef.current = {
            aspectRatio: element.h > 0 ? element.w / element.h : 1,
            center,
            element,
            hasDragged: mode !== 'move',
            mode,
            pointerId: event.pointerId,
            startAngle,
            startClientPoint: { x: event.clientX, y: event.clientY },
            startPoint,
        };
        event.currentTarget.setPointerCapture(event.pointerId);
        onTransformStart?.(element.id, mode);
    }

    function updateTransform(event: PointerEvent<HTMLElement>) {
        const session = sessionRef.current;

        if (!session || session.pointerId !== event.pointerId) {
            return;
        }

        const artboardElement = artboardRef.current;

        if (!artboardElement) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();

        if (
            session.mode === 'move' &&
            !session.hasDragged &&
            pointerDistance(event, session.startClientPoint) < CLICK_DRAG_THRESHOLD_PX
        ) {
            return;
        }

        session.hasDragged = true;

        const point = canvasPointFromEvent(event, artboardElement, canvas);
        const nextElement =
            session.mode === 'move'
                ? movedElement(session, point)
                : session.mode === 'rotate'
                  ? rotatedElement(session, point)
                  : resizedElement(session, point);

        onChangeElement(session.element.id, clampElementToCanvas(nextElement, canvas));
    }

    function endTransform(event: PointerEvent<HTMLElement>) {
        const session = sessionRef.current;

        if (!session || session.pointerId !== event.pointerId) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();
        sessionRef.current = null;

        if (session.mode === 'move' && !session.hasDragged) {
            onElementClick?.(session.element);

            return;
        }

        onTransformEnd?.(session.element.id, session.mode);
    }

    return {
        beginTransform,
        endTransform,
        updateTransform,
    };
}

function pointerDistance(event: PointerEvent<HTMLElement>, startPoint: { x: number; y: number }): number {
    return Math.hypot(event.clientX - startPoint.x, event.clientY - startPoint.y);
}

function movedElement(session: TransformSession, point: { x: number; y: number }): CanvasElement {
    const dx = point.x - session.startPoint.x;
    const dy = point.y - session.startPoint.y;

    return {
        ...session.element,
        x: roundNumber(session.element.x + dx),
        y: roundNumber(session.element.y + dy),
    };
}

function rotatedElement(session: TransformSession, point: { x: number; y: number }): CanvasElement {
    const angle = angleBetween(session.center, point);
    const delta = angle - session.startAngle;

    return {
        ...session.element,
        rotation: normalizeRotation(session.element.rotation + radiansToDegrees(delta)),
    };
}

function resizedElement(session: TransformSession, point: { x: number; y: number }): CanvasElement {
    const dx = point.x - session.startPoint.x;
    const dy = point.y - session.startPoint.y;
    const keepRatio = session.element.type === 'image';
    const minWidth = minimumWidthForElement(session.element);
    const minHeight = minimumHeightForElement(session.element);
    let x = session.element.x;
    let y = session.element.y;
    let w = session.element.w;
    let h = session.element.h;

    if (session.mode.includes('e')) {
        w = Math.max(minWidth, session.element.w + dx);
    }

    if (session.mode.includes('s')) {
        h = Math.max(minHeight, session.element.h + dy);
    }

    if (session.mode.includes('w')) {
        w = Math.max(minWidth, session.element.w - dx);
        x = session.element.x + (session.element.w - w);
    }

    if (session.mode.includes('n')) {
        h = Math.max(minHeight, session.element.h - dy);
        y = session.element.y + (session.element.h - h);
    }

    if (keepRatio && session.aspectRatio > 0) {
        const ratioWidth = Math.max(minWidth, w);
        const ratioHeight = Math.max(minHeight, ratioWidth / session.aspectRatio);

        if (session.mode.includes('w')) {
            x = session.element.x + (session.element.w - ratioWidth);
        }

        if (session.mode.includes('n')) {
            y = session.element.y + (session.element.h - ratioHeight);
        }

        w = ratioWidth;
        h = ratioHeight;
    }

    return {
        ...session.element,
        h: roundNumber(h),
        w: roundNumber(w),
        x: roundNumber(x),
        y: roundNumber(y),
    };
}

function angleBetween(center: { x: number; y: number }, point: { x: number; y: number }): number {
    return Math.atan2(point.y - center.y, point.x - center.x);
}

function radiansToDegrees(value: number): number {
    return (value * 180) / Math.PI;
}
