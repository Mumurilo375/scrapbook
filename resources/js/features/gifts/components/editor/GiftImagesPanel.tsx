import type { RefObject } from 'react';

import type { EditorMediaItem, ImageUploadTarget } from './editorTypes';
import { GiftMediaLibrary, type GiftMediaLibraryHandle } from './GiftMediaLibrary';

type GiftImagesPanelProps = {
    disabled: boolean;
    mediaItems: EditorMediaItem[];
    mediaLibraryRef: RefObject<GiftMediaLibraryHandle | null>;
    onSelectMedia: (mediaItemId: string) => void;
    onUploaded: (mediaItem: EditorMediaItem, target: ImageUploadTarget | null) => void;
    selectedMediaId: string | null;
    uploadUrl: string;
};

export function GiftImagesPanel({
    disabled,
    mediaItems,
    mediaLibraryRef,
    onSelectMedia,
    onUploaded,
    selectedMediaId,
    uploadUrl,
}: GiftImagesPanelProps) {
    return (
        <section className="grid gap-5">
            <div>
                <h2 className="text-base font-semibold text-[#1F150A]">Biblioteca de imagens</h2>
                <p className="mt-1 text-sm text-[#6F5A4A]">
                    Envie imagens para sua biblioteca. Para substituir uma foto da página, selecione a imagem e use
                    Trocar foto.
                </p>
            </div>

            <GiftMediaLibrary
                disabled={disabled}
                mediaItems={mediaItems}
                onSelectMedia={onSelectMedia}
                onUploaded={onUploaded}
                ref={mediaLibraryRef}
                selectedMediaId={selectedMediaId}
                uploadUrl={uploadUrl}
            />
        </section>
    );
}
