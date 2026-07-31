import { Images } from 'lucide-react';
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
        <section
            aria-labelledby="gift-images-panel-title"
            className="gift-editor-inspector -m-4 min-w-0 overflow-hidden rounded-[16px_4px_16px_16px] bg-white text-[#342E38]"
        >
            <header className="gift-editor-inspector-header px-4 py-5">
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                        <h2
                            className="font-display text-lg font-bold tracking-[-0.02em] text-[#21162D]"
                            id="gift-images-panel-title"
                        >
                            Fotos
                        </h2>
                        <p className="mt-1 max-w-[34ch] text-sm leading-5 text-[#645D68]">
                            Envie suas imagens e selecione uma para usar ao trocar a foto da página.
                        </p>
                    </div>
                    <Images aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-[#FF765B]" />
                </div>
            </header>

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
