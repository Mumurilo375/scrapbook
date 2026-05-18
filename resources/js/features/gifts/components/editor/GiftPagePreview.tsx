import { ChevronLeft, ChevronRight } from 'lucide-react';

import { normalizeThemeConfig, ScrapbookStage } from '../../../../components/renderer';
import type { Canvas, CanvasElement } from '../../../../domain/canvas/schema';
import type { ThemeConfigInput } from '../../../../components/renderer';
import { EditableCanvasStage } from './EditableCanvasStage';
import type { EditorPage } from './editorTypes';

type GiftPagePreviewProps = {
    canGoNext: boolean;
    canGoPrevious: boolean;
    canvas: Canvas | null;
    disabled: boolean;
    onChangeElement: (elementId: string, nextElement: CanvasElement) => void;
    onChangeText: (element: CanvasElement, value: string) => void;
    onClearSelection: () => void;
    onElementDoubleClick?: (element: CanvasElement) => void;
    onNext: () => void;
    onPrevious: () => void;
    onSelectElement: (elementId: string) => void;
    maxTextLength: number;
    page: EditorPage | null;
    selectedElementId?: string | null;
    theme?: ThemeConfigInput;
};

export function GiftPagePreview({
    canGoNext,
    canGoPrevious,
    canvas,
    disabled,
    onChangeElement,
    onChangeText,
    onClearSelection,
    onElementDoubleClick,
    maxTextLength,
    onNext,
    onPrevious,
    onSelectElement,
    page,
    selectedElementId = null,
    theme,
}: GiftPagePreviewProps) {
    const rendererTheme = normalizeThemeConfig(theme);

    return (
        <div
            className="min-h-full rounded-[8px] border p-2 shadow-sm sm:p-4"
            style={{
                backgroundColor: `color-mix(in srgb, ${rendererTheme.tokens.colors.bookBackground} 86%, white)`,
                borderColor: rendererTheme.tokens.colors.muted,
            }}
        >
            <div className="mb-2 flex items-center justify-between gap-3 sm:mb-3">
                <div className="min-w-0">
                    <h2 className="truncate text-lg font-semibold" style={{ color: rendererTheme.tokens.colors.ink }}>
                        {page?.name ?? 'Sem página'}
                    </h2>
                    <p
                        className="mt-1 text-xs font-semibold uppercase"
                        style={{ color: rendererTheme.tokens.colors.accent }}
                    >
                        {page?.page_type ?? 'scrapbook'}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        aria-label="Página anterior"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-[6px] border border-[#CBA980] bg-[#FFF7EE] text-[#42291D] disabled:opacity-45"
                        disabled={!canGoPrevious}
                        onClick={onPrevious}
                        type="button"
                    >
                        <ChevronLeft aria-hidden="true" className="h-5 w-5" />
                    </button>
                    <button
                        aria-label="Próxima página"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-[6px] border border-[#CBA980] bg-[#FFF7EE] text-[#42291D] disabled:opacity-45"
                        disabled={!canGoNext}
                        onClick={onNext}
                        type="button"
                    >
                        <ChevronRight aria-hidden="true" className="h-5 w-5" />
                    </button>
                </div>
            </div>

            <ScrapbookStage context="editor" theme={theme}>
                {canvas ? (
                    <EditableCanvasStage
                        canvas={canvas}
                        disabled={disabled}
                        onChangeElement={onChangeElement}
                        onChangeText={onChangeText}
                        onClearSelection={onClearSelection}
                        onElementDoubleClick={onElementDoubleClick}
                        onSelectElement={onSelectElement}
                        maxTextLength={maxTextLength}
                        selectedElementId={selectedElementId}
                        theme={theme}
                    />
                ) : (
                    <div className="flex aspect-[3/4] items-center justify-center rounded-[8px] border border-dashed border-[#CBA980] bg-[#FFF7EE] text-sm font-semibold text-[#6F5A4A]">
                        Nenhuma página disponível.
                    </div>
                )}
            </ScrapbookStage>
        </div>
    );
}
