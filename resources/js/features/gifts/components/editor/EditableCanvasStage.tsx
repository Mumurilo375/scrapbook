import { useRef, useState } from 'react';

import { PageRenderer } from '../../../../components/renderer';
import type { ThemeConfigInput } from '../../../../components/renderer';
import type { Canvas, CanvasElement } from '../../../../domain/canvas/schema';
import { InlineTextEditor } from './InlineTextEditor';
import { SelectionOverlay } from './SelectionOverlay';
import { isElementLocked, isTextEditableElement } from './canvasTransformUtils';

type EditableCanvasStageProps = {
    canvas: Canvas;
    disabled: boolean;
    onChangeElement: (elementId: string, nextElement: CanvasElement) => void;
    onChangeText: (element: CanvasElement, value: string) => void;
    onClearSelection: () => void;
    onElementDoubleClick?: (element: CanvasElement) => void;
    onSelectElement: (elementId: string) => void;
    maxTextLength: number;
    selectedElementId: string | null;
    theme?: ThemeConfigInput;
};

export function EditableCanvasStage({
    canvas,
    disabled,
    onChangeElement,
    onChangeText,
    onClearSelection,
    onElementDoubleClick,
    onSelectElement,
    maxTextLength,
    selectedElementId,
    theme,
}: EditableCanvasStageProps) {
    const artboardRef = useRef<HTMLDivElement | null>(null);
    const [editingElementId, setEditingElementId] = useState<string | null>(null);
    const editingElement =
        editingElementId !== null && editingElementId === selectedElementId && !disabled
            ? (canvas.elements.find((element) => element.id === editingElementId && isTextEditableElement(element)) ?? null)
            : null;

    return (
        <PageRenderer canvas={canvas} context="editor" selectedElementId={selectedElementId} theme={theme}>
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
                        if (!isTextEditableElement(element) || isElementLocked(element) || disabled) {
                            return;
                        }

                        setEditingElementId(element.id);
                    }}
                    onElementDoubleClick={onElementDoubleClick}
                    onSelectElement={(elementId) => {
                        if (elementId !== editingElementId) {
                            setEditingElementId(null);
                        }

                        onSelectElement(elementId);
                    }}
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
            </div>
        </PageRenderer>
    );
}
