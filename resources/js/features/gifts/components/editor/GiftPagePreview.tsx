import { ChevronLeft, ChevronRight, LockKeyhole, MousePointer2 } from 'lucide-react';

import { PageRenderer } from '../../../../components/renderer';
import type { RendererAssetMap } from '../../../../components/renderer';
import type { Canvas, CanvasElement } from '../../../../domain/canvas/schema';
import type { ThemeConfigInput } from '../../../../components/renderer';
import { EditableCanvasStage } from './EditableCanvasStage';
import { EditorOpenBookSpread } from './EditorOpenBookSpread';
import type { EditorPage } from './editorTypes';
import type { TransformMode } from './useElementTransform';

type GiftPagePreviewProps = {
    activeSide: 'left' | 'right';
    canGoNext: boolean;
    canGoPrevious: boolean;
    assets?: RendererAssetMap;
    canvas: Canvas | null;
    companionCanvas?: Canvas | null;
    companionPage?: EditorPage | null;
    companionPageNumber?: number;
    direction: 'next' | 'previous';
    disabled: boolean;
    imageReplacing?: boolean;
    onChangeElement: (elementId: string, nextElement: CanvasElement) => void;
    onChangeText: (element: CanvasElement, value: string) => void;
    onClearSelection: () => void;
    onElementDoubleClick?: (element: CanvasElement) => void;
    onElementClick?: (element: CanvasElement) => void;
    onNext: () => void;
    onPrevious: () => void;
    onSelectCompanion?: () => void;
    onReplaceImage?: (element: CanvasElement) => void;
    onSelectElement: (elementId: string) => void;
    onTransformEnd?: (elementId: string, mode: TransformMode) => void;
    onTransformStart?: (elementId: string, mode: TransformMode) => void;
    maxTextLength: number;
    page: EditorPage | null;
    pageNumber: number;
    selectedElementId?: string | null;
    theme?: ThemeConfigInput;
};

export function GiftPagePreview({
    activeSide,
    assets,
    canGoNext,
    canGoPrevious,
    canvas,
    companionCanvas = null,
    companionPage,
    companionPageNumber,
    direction,
    disabled,
    imageReplacing = false,
    onChangeElement,
    onChangeText,
    onClearSelection,
    onElementDoubleClick,
    onElementClick,
    maxTextLength,
    onNext,
    onPrevious,
    onSelectCompanion,
    onReplaceImage,
    onSelectElement,
    onTransformEnd,
    onTransformStart,
    page,
    pageNumber,
    selectedElementId = null,
    theme,
}: GiftPagePreviewProps) {
    return (
        <section className="gift-editor-canvas" aria-label="Página em edição">
            <header className="gift-editor-canvas-heading">
                <div className="flex min-w-0 items-center gap-3">
                    <span className="gift-editor-page-number" aria-hidden="true">
                        {String(pageNumber).padStart(2, '0')}
                    </span>
                    <div className="min-w-0">
                        <h2 className="truncate font-display text-base font-bold text-[#21162D] sm:text-lg">
                            {page?.name ?? 'Sem página'}
                        </h2>
                        <p className="mt-0.5 flex items-center gap-1.5 text-xs font-semibold text-[#746D78]">
                            {disabled ? (
                                <>
                                    <LockKeyhole aria-hidden="true" className="h-3.5 w-3.5" />
                                    Somente leitura
                                </>
                            ) : (
                                <>
                                    <MousePointer2 aria-hidden="true" className="h-3.5 w-3.5" />
                                    Toque em qualquer item para editar
                                </>
                            )}
                        </p>
                    </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                    <button
                        aria-label="Página anterior"
                        className="gift-editor-page-turn gift-editor-page-turn--previous"
                        disabled={!canGoPrevious}
                        onClick={onPrevious}
                        type="button"
                    >
                        <ChevronLeft aria-hidden="true" className="h-5 w-5" />
                    </button>
                    <button
                        aria-label="Próxima página"
                        className="gift-editor-page-turn gift-editor-page-turn--next"
                        disabled={!canGoNext}
                        onClick={onNext}
                        type="button"
                    >
                        <ChevronRight aria-hidden="true" className="h-5 w-5" />
                    </button>
                </div>
            </header>

            <div className="gift-editor-artifact-stage">
                <div className="gift-editor-registration-mark gift-editor-registration-mark--top" aria-hidden="true" />
                <div
                    className="gift-editor-registration-mark gift-editor-registration-mark--bottom"
                    aria-hidden="true"
                />
                <div className="gift-editor-page-motion" data-direction={direction} key={page?.id ?? 'empty'}>
                    {canvas ? (
                        <EditorOpenBookSpread
                            activeCanvas={canvas}
                            activePage={
                                <EditableCanvasStage
                                    assets={assets}
                                    canvas={canvas}
                                    disabled={disabled}
                                    framed={false}
                                    imageReplacing={imageReplacing}
                                    maxTextLength={maxTextLength}
                                    onChangeElement={onChangeElement}
                                    onChangeText={onChangeText}
                                    onClearSelection={onClearSelection}
                                    onElementClick={onElementClick}
                                    onElementDoubleClick={onElementDoubleClick}
                                    onReplaceImage={onReplaceImage}
                                    onSelectElement={onSelectElement}
                                    onTransformEnd={onTransformEnd}
                                    onTransformStart={onTransformStart}
                                    selectedElementId={selectedElementId}
                                    theme={theme}
                                />
                            }
                            activePageNumber={pageNumber}
                            activeSide={activeSide}
                            companionCanvas={companionCanvas}
                            companionPage={
                                companionCanvas ? (
                                    <PageRenderer
                                        assets={assets}
                                        canvas={companionCanvas}
                                        context="editor"
                                        framed={false}
                                        theme={theme}
                                    />
                                ) : undefined
                            }
                            companionPageNumber={companionPage ? companionPageNumber : undefined}
                            direction={direction}
                            onSelectCompanion={onSelectCompanion}
                        />
                    ) : (
                        <div className="grid aspect-[3/4] place-items-center border border-dashed border-[#C9C1CD] bg-[#FBFAF6] p-6 text-center text-sm font-semibold text-[#746D78]">
                            Nenhuma página disponível para edição.
                        </div>
                    )}
                </div>
            </div>
            <footer className="gift-editor-canvas-footer">
                <span>{page ? pageTypeLabel(page.page_type) : 'Sem página'}</span>
                <span aria-hidden="true">•</span>
                <span>Alterações salvas automaticamente</span>
            </footer>
        </section>
    );
}

function pageTypeLabel(type: string): string {
    const labels: Record<string, string> = {
        birthday: 'Aniversário',
        cover: 'Capa',
        final: 'Final',
        gallery: 'Galeria',
        letter: 'Carta',
        love_list: 'Lista afetiva',
        music: 'Música',
    };

    return labels[type] ?? 'Página';
}
