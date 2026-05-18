import { ChevronLeft, ChevronRight } from 'lucide-react';

import { PageRenderer } from '../../../../components/renderer';
import type { Canvas, CanvasElement } from '../../../../domain/canvas/schema';
import type { EditorPage } from './editorTypes';

type GiftPagePreviewProps = {
    canGoNext: boolean;
    canGoPrevious: boolean;
    canvas: Canvas | null;
    onNext: () => void;
    onPrevious: () => void;
    onDropMediaOnImage?: (elementId: string, mediaItemId: string) => void;
    onSelectImageElement?: (elementId: string) => void;
    page: EditorPage | null;
    selectedImageElementId?: string | null;
};

export function GiftPagePreview({
    canGoNext,
    canGoPrevious,
    canvas,
    onNext,
    onPrevious,
    onDropMediaOnImage,
    onSelectImageElement,
    page,
    selectedImageElementId = null,
}: GiftPagePreviewProps) {
    function selectElement(element: CanvasElement) {
        if (element.type === 'image') {
            onSelectImageElement?.(element.id);
        }
    }

    function dropMediaOnElement(element: CanvasElement, mediaItemId: string) {
        if (element.type === 'image') {
            onDropMediaOnImage?.(element.id, mediaItemId);
        }
    }

    return (
        <div className="rounded-[8px] border border-[#D8B991] bg-[#EAD2B8] p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                    <h2 className="truncate text-lg font-semibold text-[#1F150A]">{page?.name ?? 'Sem página'}</h2>
                    <p className="mt-1 text-xs font-semibold uppercase text-[#7A2634]">Preview do scrapbook</p>
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

            <div className="mx-auto w-full max-w-[430px]">
                {canvas ? (
                    <PageRenderer
                        canvas={canvas}
                        onElementClick={selectElement}
                        onMediaDrop={dropMediaOnElement}
                        selectedElementId={selectedImageElementId}
                    />
                ) : (
                    <div className="flex aspect-[390/844] items-center justify-center rounded-[8px] border border-dashed border-[#CBA980] bg-[#FFF7EE] text-sm font-semibold text-[#6F5A4A]">
                        Nenhuma página disponível.
                    </div>
                )}
            </div>
        </div>
    );
}
