import { useRef, useState } from 'react';

import { PageRenderer } from '../../../../components/renderer';
import type { RendererAssetMap } from '../../../../components/renderer';
import type { ThemeConfigInput } from '../../../../components/renderer';
import type { Canvas, CanvasElement } from '../../../../domain/canvas/schema';
import { InlineTextEditor } from './InlineTextEditor';
import { SelectionOverlay } from './SelectionOverlay';
import { isElementHidden, isElementLocked, isTextEditableElement } from './canvasTransformUtils';
import type { TransformMode } from './useElementTransform';

type EditableCanvasStageProps = {
    canvas: Canvas;
    assets?: RendererAssetMap;
    disabled: boolean;
    imageReplacing?: boolean;
    onChangeElement: (elementId: string, nextElement: CanvasElement) => void;
    onChangeText: (element: CanvasElement, value: string) => void;
    onClearSelection: () => void;
    onElementDoubleClick?: (element: CanvasElement) => void;
    onElementClick?: (element: CanvasElement) => void;
    onSelectElement: (elementId: string) => void;
    onReplaceImage?: (element: CanvasElement) => void;
    onTransformEnd?: (elementId: string, mode: TransformMode) => void;
    onTransformStart?: (elementId: string, mode: TransformMode) => void;
    maxTextLength: number;
    selectedElementId: string | null;
    theme?: ThemeConfigInput;
};

export function EditableCanvasStage({
    assets,
    canvas,
    disabled,
    imageReplacing = false,
    onChangeElement,
    onChangeText,
    onClearSelection,
    onElementDoubleClick,
    onElementClick,
    onReplaceImage,
    onSelectElement,
    onTransformEnd,
    onTransformStart,
    maxTextLength,
    selectedElementId,
    theme,
}: EditableCanvasStageProps) {
    const artboardRef = useRef<HTMLDivElement | null>(null);
    const [editingElementId, setEditingElementId] = useState<string | null>(null);
    const editingElement =
        editingElementId !== null && editingElementId === selectedElementId && !disabled
            ? (canvas.elements.find((element) => element.id === editingElementId && isTextEditableElement(element)) ??
              null)
            : null;
    const selectedImageElement =
        !disabled && selectedElementId
            ? (canvas.elements.find(
                  (element) =>
                      element.id === selectedElementId &&
                      element.type === 'image' &&
                      !isElementLocked(element) &&
                      !isElementHidden(element),
              ) ?? null)
            : null;

    return (
        <PageRenderer
            assets={assets}
            canvas={canvas}
            context="editor"
            selectedElementId={selectedElementId}
            theme={theme}
        >
            <div className="absolute inset-0" ref={artboardRef}>
                <SelectionOverlay
                    artboardRef={artboardRef}
                    canvas={canvas}
                    disabled={disabled}
                    onChangeElement={onChangeElement}
                    onClearSelection={() => {
                        setEditingElementId(null);
                        onClearSelection();
                    }}
                    onElementClick={(element) => {
                        if (isElementLocked(element) || disabled) {
                            return;
                        }

                        if (isTextEditableElement(element)) {
                            setEditingElementId(element.id);

                            return;
                        }

                        onElementClick?.(element);
                    }}
                    onElementDoubleClick={onElementDoubleClick}
                    onSelectElement={(elementId) => {
                        if (elementId !== editingElementId) {
                            setEditingElementId(null);
                        }

                        onSelectElement(elementId);
                    }}
                    onTransformEnd={onTransformEnd}
                    onTransformStart={onTransformStart}
                    selectedElementId={selectedElementId}
                />
                {editingElement ? (
                    <InlineTextEditor
                        canvas={canvas}
                        disabled={disabled}
                        element={editingElement}
                        maxLength={maxTextLength}
                        onChangeText={onChangeText}
                        onClose={() => setEditingElementId(null)}
                        theme={theme}
                    />
                ) : null}
                {selectedImageElement && onReplaceImage ? (
                    <ImageReplaceButton
                        canvas={canvas}
                        disabled={imageReplacing}
                        element={selectedImageElement}
                        onClick={() => onReplaceImage(selectedImageElement)}
                    />
                ) : null}
            </div>
        </PageRenderer>
    );
}

type ImageReplaceButtonProps = {
    canvas: Canvas;
    disabled: boolean;
    element: CanvasElement;
    onClick: () => void;
};

function ImageReplaceButton({ canvas, disabled, element, onClick }: ImageReplaceButtonProps) {
    const centerX = clamp(element.x + element.w / 2, 96, canvas.artboard.width - 96);
    const top = clamp(element.y + element.h + 28, 0, canvas.artboard.height - 58);

    return (
        <button
            className="absolute z-[3400] inline-flex min-h-10 -translate-x-1/2 items-center justify-center rounded-[6px] border border-[#7A2634] bg-[#FFF7EE] px-3 text-sm font-semibold text-[#7A2634] shadow-[0_8px_22px_rgba(31,21,10,0.18)] transition hover:bg-[#FFF0EC] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={disabled}
            onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onClick();
            }}
            onPointerDown={(event) => {
                event.preventDefault();
                event.stopPropagation();
            }}
            style={{
                left: `${toPercent(centerX, canvas.artboard.width)}%`,
                top: `${toPercent(top, canvas.artboard.height)}%`,
            }}
            type="button"
        >
            {disabled ? 'Enviando...' : 'Trocar foto'}
        </button>
    );
}

function toPercent(value: number, total: number): number {
    if (!Number.isFinite(value) || !Number.isFinite(total) || total <= 0) {
        return 0;
    }

    return (value / total) * 100;
}

function clamp(value: number, min: number, max: number): number {
    if (!Number.isFinite(value)) {
        return min;
    }

    if (max < min) {
        return Math.max(0, value);
    }

    return Math.min(Math.max(value, min), max);
}
