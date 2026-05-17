import { ImagePlus } from 'lucide-react';

import type { EditableImageElement, EditorMediaItem } from './editorTypes';

type GiftImageElementEditorProps = {
    disabled: boolean;
    elements: EditableImageElement[];
    mediaItems: EditorMediaItem[];
    onApplyMedia: () => void;
    onSelectElement: (elementId: string) => void;
    selectedElementId: string | null;
    selectedMediaId: string | null;
};

export function GiftImageElementEditor({
    disabled,
    elements,
    mediaItems,
    onApplyMedia,
    onSelectElement,
    selectedElementId,
    selectedMediaId,
}: GiftImageElementEditorProps) {
    const selectedElement = elements.find((element) => element.id === selectedElementId) ?? elements[0] ?? null;
    const selectedMedia = mediaItems.find((mediaItem) => mediaItem.id === selectedMediaId) ?? null;
    const currentMedia = selectedElement?.mediaItemId
        ? mediaItems.find((mediaItem) => mediaItem.id === selectedElement.mediaItemId)
        : null;

    return (
        <section className="rounded-[8px] border border-[#D8B991] bg-[#FFF7EE] p-4 text-[#1F150A] shadow-sm">
            <h2 className="text-sm font-semibold uppercase text-[#7A2634]">Imagens da página</h2>

            {elements.length > 0 ? (
                <div className="mt-4 grid gap-3">
                    <label className="grid gap-1 text-sm font-semibold text-[#42291D]">
                        Espaço de imagem
                        <select
                            className="rounded-[6px] border border-[#CBA980] bg-[#FFFBF6] px-3 py-2 text-sm font-medium text-[#1F150A] outline-none focus:border-[#7A2634] focus:ring-2 focus:ring-[#7A263433]"
                            disabled={disabled}
                            onChange={(event) => onSelectElement(event.target.value)}
                            value={selectedElement?.id ?? ''}
                        >
                            {elements.map((element) => (
                                <option key={element.id} value={element.id}>
                                    {element.label}
                                </option>
                            ))}
                        </select>
                    </label>

                    <div className="rounded-[6px] border border-[#E5D0B8] bg-[#FFFBF6] p-3 text-sm text-[#6F5A4A]">
                        Atual: <span className="font-semibold text-[#42291D]">{currentMedia?.originalFilename ?? 'sem imagem'}</span>
                    </div>

                    <button
                        className="inline-flex items-center justify-center gap-2 rounded-[6px] bg-[#7A2634] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#641D2A] disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={disabled || !selectedElement || !selectedMedia}
                        onClick={onApplyMedia}
                        type="button"
                    >
                        <ImagePlus aria-hidden="true" className="h-4 w-4" />
                        Aplicar imagem selecionada
                    </button>
                </div>
            ) : (
                <div className="mt-4 rounded-[6px] border border-dashed border-[#CBA980] bg-[#FFFBF6] px-4 py-5 text-center text-sm font-semibold text-[#6F5A4A]">
                    Esta página não tem elemento de imagem.
                </div>
            )}
        </section>
    );
}
