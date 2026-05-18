import { Head } from '@inertiajs/react';
import type { CSSProperties } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { normalizeThemeConfig } from '../../../../components/renderer';
import type { Canvas } from '../../../../domain/canvas/schema';
import { EditorTabs } from '../../components/editor/EditorTabs';
import { GiftContentPanel } from '../../components/editor/GiftContentPanel';
import { GiftDebugPanel } from '../../components/editor/GiftDebugPanel';
import { GiftEditorLayout } from '../../components/editor/GiftEditorLayout';
import { GiftEditorTopBar } from '../../components/editor/GiftEditorTopBar';
import { GiftImagesPanel } from '../../components/editor/GiftImagesPanel';
import type { GiftMediaLibraryHandle } from '../../components/editor/GiftMediaLibrary';
import { GiftMetadataPanel, type GiftMetadataDraft } from '../../components/editor/GiftMetadataPanel';
import { GiftPagePreview } from '../../components/editor/GiftPagePreview';
import { GiftPageSidebar } from '../../components/editor/GiftPageSidebar';
import type {
    EditorMediaItem,
    EditorPage,
    EditorTab,
    ImageUploadTarget,
    SaveStatus,
    EditableTextElement,
} from '../../components/editor/editorTypes';
import {
    applyMediaToImageElement,
    canvasesAreEqual,
    cloneCanvas,
    imageElementsFromCanvas,
    normalizeCanvas,
    textElementsFromCanvas,
    updateCanvasText,
} from '../../components/editor/editorUtils';
import {
    AutosaveRequestError,
    clearLocalDraft,
    firstAutosaveError,
    patchJson,
    readLocalDraft,
    useAutosave,
    useOnlineStatus,
    writeLocalDraft,
} from '../../components/editor/useAutosave';
import { useUnsavedChangesWarning } from '../../components/editor/useUnsavedChangesWarning';
import type { EditableGift, GiftPageSummary } from '../../types';

type GiftEditProps = {
    debugEnabled: boolean;
    gift: EditableGift;
    media: EditorMediaItem[];
    pages: GiftPageSummary[];
};

type AutosaveResponse<TData> = {
    data: TData;
};

type MetadataSaveData = {
    gift: {
        last_edited_at: string | null;
        recipient_name: string | null;
        sender_name: string | null;
        title: string;
    };
};

type PageSaveData = {
    page: {
        canvas: Canvas | Record<string, unknown>;
        id: string;
        updated_at: string | null;
    };
};

export default function GiftEdit({ debugEnabled, gift, media, pages }: GiftEditProps) {
    const normalizedTheme = useMemo(() => normalizeThemeConfig(gift.theme?.config), [gift.theme?.config]);
    const editorPages = useMemo<EditorPage[]>(
        () =>
            pages.map((page) => ({
                ...page,
                canvas: normalizeCanvas(page.canvas),
            })),
        [pages],
    );
    const editorPageById = useMemo(() => new Map(editorPages.map((page) => [page.id, page] as const)), [editorPages]);
    const initialMetadata = useMemo(() => metadataFromGift(gift), [gift]);
    const recoveredMetadataDraft = useMemo(
        () => readLocalDraft<GiftMetadataDraft>(metadataDraftKey(gift.id)),
        [gift.id],
    );
    const recoveredPageDrafts = useMemo(() => {
        const drafts: Record<string, Canvas> = {};

        for (const page of editorPages) {
            const draft = readLocalDraft<Canvas>(pageDraftKey(gift.id, page.id));

            if (draft) {
                drafts[page.id] = normalizeCanvas(draft.value);
            }
        }

        return drafts;
    }, [editorPages, gift.id]);

    const [selectedPageId, setSelectedPageId] = useState<string | null>(editorPages[0]?.id ?? null);
    const [activeTab, setActiveTab] = useState<EditorTab>('content');
    const [pageCanvases, setPageCanvases] = useState<Record<string, Canvas>>(() =>
        Object.fromEntries(
            editorPages.map((page) => [page.id, cloneCanvas(recoveredPageDrafts[page.id] ?? page.canvas)]),
        ),
    );
    const [savedCanvases, setSavedCanvases] = useState<Record<string, Canvas>>(() =>
        Object.fromEntries(editorPages.map((page) => [page.id, cloneCanvas(page.canvas)])),
    );
    const [pageSaveStates, setPageSaveStates] = useState<Record<string, SaveStatus>>(() =>
        Object.fromEntries(Object.keys(recoveredPageDrafts).map((pageId) => [pageId, 'dirty' as SaveStatus])),
    );
    const [pageErrors, setPageErrors] = useState<Record<string, string>>({});
    const [mediaItems, setMediaItems] = useState<EditorMediaItem[]>(media);
    const [selectedMediaId, setSelectedMediaId] = useState<string | null>(media[0]?.id ?? null);
    const [selectedImageElementId, setSelectedImageElementId] = useState<string | null>(null);
    const [metadata, setMetadata] = useState<GiftMetadataDraft>(() =>
        metadataDraftFromLocal(recoveredMetadataDraft?.value, initialMetadata),
    );
    const [savedMetadata, setSavedMetadata] = useState<GiftMetadataDraft>(initialMetadata);
    const [metadataStatus, setMetadataStatus] = useState<SaveStatus>(recoveredMetadataDraft ? 'dirty' : 'idle');
    const [metadataErrors, setMetadataErrors] = useState<Partial<Record<keyof GiftMetadataDraft, string>>>({});
    const [localDraftNotice, setLocalDraftNotice] = useState(
        () => Boolean(recoveredMetadataDraft) || Object.keys(recoveredPageDrafts).length > 0,
    );
    const mediaLibraryRef = useRef<GiftMediaLibraryHandle | null>(null);
    const metadataSaveTokenRef = useRef(0);
    const pageSaveTokensRef = useRef<Record<string, number>>({});
    const pageCanvasesRef = useRef(pageCanvases);
    const savedCanvasesRef = useRef(savedCanvases);
    const metadataRef = useRef(metadata);
    const savedMetadataRef = useRef(savedMetadata);
    const online = useOnlineStatus();
    const canEditGift = gift.status === 'draft';

    useEffect(() => {
        pageCanvasesRef.current = pageCanvases;
    }, [pageCanvases]);

    useEffect(() => {
        savedCanvasesRef.current = savedCanvases;
    }, [savedCanvases]);

    useEffect(() => {
        metadataRef.current = metadata;
    }, [metadata]);

    useEffect(() => {
        savedMetadataRef.current = savedMetadata;
    }, [savedMetadata]);

    useEffect(() => {
        if (!debugEnabled && activeTab === 'debug') {
            setActiveTab('content');
        }
    }, [activeTab, debugEnabled]);

    const selectedPageIndex = editorPages.findIndex((page) => page.id === selectedPageId);
    const selectedPage = selectedPageIndex >= 0 ? editorPages[selectedPageIndex] : null;
    const selectedCanvas = selectedPage ? (pageCanvases[selectedPage.id] ?? selectedPage.canvas) : null;
    const metadataDirty = !metadataEquals(metadata, savedMetadata);
    const dirtyPageIds = useMemo(
        () =>
            editorPages
                .filter((page) => {
                    const currentCanvas = pageCanvases[page.id] ?? page.canvas;
                    const savedCanvas = savedCanvases[page.id] ?? page.canvas;

                    return !canvasesAreEqual(currentCanvas, savedCanvas);
                })
                .map((page) => page.id),
        [editorPages, pageCanvases, savedCanvases],
    );
    const dirtyPageIdSet = useMemo(() => new Set(dirtyPageIds), [dirtyPageIds]);
    const effectivePageStatuses = useMemo(
        () =>
            Object.fromEntries(
                editorPages.map((page) => {
                    const dirty = dirtyPageIdSet.has(page.id);
                    const savedState = pageSaveStates[page.id] ?? 'idle';

                    if (!online && dirty) {
                        return [page.id, 'offline' as SaveStatus];
                    }

                    if (dirty && savedState !== 'saving' && savedState !== 'error') {
                        return [page.id, 'dirty' as SaveStatus];
                    }

                    if (!dirty && savedState === 'dirty') {
                        return [page.id, 'idle' as SaveStatus];
                    }

                    return [page.id, savedState];
                }),
            ),
        [dirtyPageIdSet, editorPages, online, pageSaveStates],
    );
    const selectedPageSaveStatus = selectedPage ? (effectivePageStatuses[selectedPage.id] ?? 'idle') : 'idle';
    const selectedPageError = selectedPage ? (pageErrors[selectedPage.id] ?? null) : null;
    const textElements =
        selectedCanvas && selectedPage ? textElementsFromCanvas(selectedCanvas, selectedPage.text_max_length) : [];
    const imageElements = selectedCanvas ? imageElementsFromCanvas(selectedCanvas) : [];
    const activeImageElementId =
        selectedImageElementId && imageElements.some((element) => element.id === selectedImageElementId)
            ? selectedImageElementId
            : (imageElements[0]?.id ?? null);
    const editorDisabled = Boolean(selectedPage?.locked || !canEditGift);
    const hasSaving =
        metadataStatus === 'saving' || Object.values(pageSaveStates).some((status) => status === 'saving');
    const hasError = metadataStatus === 'error' || Object.values(pageSaveStates).some((status) => status === 'error');
    const hasDirtyPages = dirtyPageIds.length > 0;
    const hasUnsavedChanges = metadataDirty || hasDirtyPages || hasSaving || hasError;
    const globalSaveStatus = globalStatus({
        hasDirty: metadataDirty || hasDirtyPages,
        hasError,
        hasSaving,
        online,
    });
    const globalSaveDetail = saveDetail(
        globalSaveStatus,
        firstVisibleError(metadataErrors, pageErrors),
        localDraftNotice,
    );
    const pageAutosaveSignature = useMemo(
        () => dirtyPageIds.map((pageId) => JSON.stringify(pageCanvases[pageId] ?? null)).join('|'),
        [dirtyPageIds, pageCanvases],
    );
    const metadataAutosaveSignature = useMemo(() => JSON.stringify(metadata), [metadata]);

    useUnsavedChangesWarning(hasUnsavedChanges);

    const saveMetadataDraft = useCallback(async () => {
        if (!canEditGift || !online) {
            return;
        }

        const snapshot = metadataRef.current;

        if (metadataEquals(snapshot, savedMetadataRef.current)) {
            return;
        }

        const saveToken = metadataSaveTokenRef.current + 1;
        metadataSaveTokenRef.current = saveToken;
        setMetadataStatus('saving');
        setMetadataErrors({});

        try {
            const response = await patchJson<AutosaveResponse<MetadataSaveData>>(gift.update_url, snapshot);

            if (metadataSaveTokenRef.current !== saveToken) {
                return;
            }

            const savedDraft = metadataFromResponse(response.data.gift, snapshot);
            const currentDraft = metadataRef.current;
            setSavedMetadata(savedDraft);
            savedMetadataRef.current = savedDraft;
            setMetadataStatus(metadataEquals(currentDraft, savedDraft) ? 'saved' : 'dirty');

            if (metadataEquals(currentDraft, savedDraft)) {
                clearLocalDraft(metadataDraftKey(gift.id));
            }
        } catch (error) {
            if (metadataSaveTokenRef.current !== saveToken) {
                return;
            }

            setMetadataErrors(metadataErrorsFrom(error));
            setMetadataStatus(navigator.onLine ? 'error' : 'offline');
        }
    }, [canEditGift, gift.id, gift.update_url, online]);

    const savePageById = useCallback(
        async (pageId: string) => {
            const page = editorPageById.get(pageId);

            if (!page || page.locked || !canEditGift || !online) {
                return;
            }

            const currentCanvas = pageCanvasesRef.current[pageId] ?? page.canvas;
            const savedCanvas = savedCanvasesRef.current[pageId] ?? page.canvas;

            if (canvasesAreEqual(currentCanvas, savedCanvas)) {
                return;
            }

            const snapshot = cloneCanvas(currentCanvas);
            const saveToken = (pageSaveTokensRef.current[pageId] ?? 0) + 1;
            pageSaveTokensRef.current[pageId] = saveToken;
            setPageSaveStates((current) => ({ ...current, [pageId]: 'saving' }));
            setPageErrors((current) => withoutKey(current, pageId));

            try {
                const response = await patchJson<AutosaveResponse<PageSaveData>>(page.update_url, { canvas: snapshot });
                const savedCanvasFromServer = normalizeCanvas(response.data.page.canvas);

                if (pageSaveTokensRef.current[pageId] !== saveToken) {
                    return;
                }

                const latestCanvas = pageCanvasesRef.current[pageId] ?? snapshot;
                const latestIsSaved = canvasesAreEqual(latestCanvas, savedCanvasFromServer);
                setSavedCanvases((current) => ({ ...current, [pageId]: cloneCanvas(savedCanvasFromServer) }));
                savedCanvasesRef.current = {
                    ...savedCanvasesRef.current,
                    [pageId]: cloneCanvas(savedCanvasFromServer),
                };
                setPageSaveStates((current) => ({ ...current, [pageId]: latestIsSaved ? 'saved' : 'dirty' }));

                if (latestIsSaved) {
                    clearLocalDraft(pageDraftKey(gift.id, pageId));
                }
            } catch (error) {
                if (pageSaveTokensRef.current[pageId] !== saveToken) {
                    return;
                }

                setPageErrors((current) => ({
                    ...current,
                    [pageId]: errorMessageFrom(error, 'Não foi possível salvar esta página.'),
                }));
                setPageSaveStates((current) => ({ ...current, [pageId]: navigator.onLine ? 'error' : 'offline' }));
            }
        },
        [canEditGift, editorPageById, gift.id, online],
    );

    const autosaveMetadata = useCallback(() => {
        void metadataAutosaveSignature;
        void saveMetadataDraft();
    }, [metadataAutosaveSignature, saveMetadataDraft]);

    const autosavePages = useCallback(() => {
        void pageAutosaveSignature;
        dirtyPageIds.forEach((pageId) => {
            void savePageById(pageId);
        });
    }, [dirtyPageIds, pageAutosaveSignature, savePageById]);

    useAutosave({
        enabled: canEditGift && online && metadataDirty,
        onSave: autosaveMetadata,
    });
    useAutosave({
        enabled: canEditGift && online && dirtyPageIds.length > 0,
        onSave: autosavePages,
    });

    function selectPage(pageId: string) {
        setSelectedPageId(pageId);
        setSelectedImageElementId(null);
    }

    function goToPage(offset: number) {
        const nextPage = editorPages[selectedPageIndex + offset];

        if (nextPage) {
            selectPage(nextPage.id);
        }
    }

    function changeText(element: EditableTextElement, value: string) {
        if (!selectedPage || editorDisabled) {
            return;
        }

        updatePageCanvas(selectedPage.id, (canvas) => updateCanvasText(canvas, element.id, element.field, value));
    }

    function applySelectedMediaToImage() {
        if (!selectedPage || !activeImageElementId || editorDisabled) {
            return;
        }

        const mediaItem = mediaItems.find((item) => item.id === selectedMediaId);

        if (!mediaItem) {
            return;
        }

        applyMediaToPage(selectedPage.id, activeImageElementId, mediaItem);
    }

    function addUploadedMedia(mediaItem: EditorMediaItem, target: ImageUploadTarget | null) {
        setMediaItems((current) => [mediaItem, ...current.filter((item) => item.id !== mediaItem.id)]);
        setSelectedMediaId(mediaItem.id);

        if (!target) {
            return;
        }

        applyMediaToPage(target.pageId, target.elementId, mediaItem);

        if (target.pageId === selectedPageId) {
            setSelectedImageElementId(target.elementId);
        }
    }

    function selectImageElementFromPreview(elementId: string) {
        if (!selectedPage || editorDisabled) {
            return;
        }

        setSelectedImageElementId(elementId);
        mediaLibraryRef.current?.openFilePicker({ pageId: selectedPage.id, elementId });
    }

    function applyMediaToImageElementFromDrop(elementId: string, mediaItemId: string) {
        if (!selectedPage || editorDisabled) {
            return;
        }

        const mediaItem = mediaItems.find((item) => item.id === mediaItemId);

        if (!mediaItem) {
            return;
        }

        setSelectedImageElementId(elementId);
        setSelectedMediaId(mediaItem.id);
        applyMediaToPage(selectedPage.id, elementId, mediaItem);
    }

    function changeMetadata(field: keyof GiftMetadataDraft, value: string) {
        if (!canEditGift) {
            return;
        }

        setMetadata((current) => {
            const next = { ...current, [field]: value };
            writeLocalDraft(metadataDraftKey(gift.id), next);

            return next;
        });
        setMetadataErrors({});
        setMetadataStatus('dirty');
    }

    function applyMediaToPage(pageId: string, elementId: string, mediaItem: EditorMediaItem) {
        updatePageCanvas(pageId, (canvas) => applyMediaToImageElement(canvas, elementId, mediaItem));
    }

    function updatePageCanvas(pageId: string, updater: (canvas: Canvas) => Canvas) {
        const page = editorPageById.get(pageId);

        if (!page || page.locked || !canEditGift) {
            return;
        }

        setPageCanvases((current) => {
            const baseCanvas = current[pageId] ?? page.canvas;
            const nextCanvas = updater(baseCanvas);
            writeLocalDraft(pageDraftKey(gift.id, pageId), nextCanvas);

            return {
                ...current,
                [pageId]: nextCanvas,
            };
        });
        setPageErrors((current) => withoutKey(current, pageId));
        setPageSaveStates((current) => ({ ...current, [pageId]: 'dirty' }));
    }

    return (
        <>
            <Head title={`Editar ${metadata.title}`} />
            <main
                className="min-h-screen"
                style={
                    {
                        backgroundColor: normalizedTheme.tokens.colors.appBackground,
                        backgroundImage: `radial-gradient(circle at 18% 8%, color-mix(in srgb, ${normalizedTheme.tokens.colors.bookBackground} 36%, transparent), transparent 26%), linear-gradient(180deg, ${normalizedTheme.tokens.colors.appBackground}, color-mix(in srgb, ${normalizedTheme.tokens.colors.bookBackground} 20%, ${normalizedTheme.tokens.colors.appBackground}))`,
                        color: normalizedTheme.tokens.colors.ink,
                    } as CSSProperties
                }
            >
                <GiftEditorTopBar
                    dashboardUrl={gift.dashboard_url}
                    orderUrl={gift.order_url}
                    previewUrl={gift.preview_url}
                    publicUrl={gift.public_url}
                    reviewUrl={gift.review_url}
                    saveDetail={globalSaveDetail}
                    saveStatus={globalSaveStatus}
                    status={gift.status}
                    title={metadata.title}
                />

                <GiftEditorLayout
                    left={
                        <GiftPageSidebar
                            onSelectPage={selectPage}
                            pageStatuses={effectivePageStatuses}
                            pages={editorPages}
                            selectedPageId={selectedPageId}
                        />
                    }
                    center={
                        <div className="grid gap-3">
                            {localDraftNotice ? (
                                <LocalDraftNotice onDismiss={() => setLocalDraftNotice(false)} />
                            ) : null}
                            <GiftPagePreview
                                canGoNext={selectedPageIndex < editorPages.length - 1}
                                canGoPrevious={selectedPageIndex > 0}
                                canvas={selectedCanvas}
                                onDropMediaOnImage={applyMediaToImageElementFromDrop}
                                onNext={() => goToPage(1)}
                                onPrevious={() => goToPage(-1)}
                                onSelectImageElement={selectImageElementFromPreview}
                                page={selectedPage}
                                selectedImageElementId={activeImageElementId}
                                theme={gift.theme?.config}
                            />
                        </div>
                    }
                    right={
                        <div className="rounded-[8px] border border-[#D8B991] bg-[#FFF7EE]/95 p-3 shadow-sm">
                            <EditorTabs activeTab={activeTab} onChange={setActiveTab} showDebug={debugEnabled} />
                            <div className="mt-5">
                                {activeTab === 'content' ? (
                                    <GiftContentPanel
                                        disabled={editorDisabled}
                                        elements={textElements}
                                        error={selectedPageError}
                                        onChangeText={changeText}
                                        saveStatus={selectedPageSaveStatus}
                                    />
                                ) : null}
                                {activeTab === 'images' ? (
                                    <GiftImagesPanel
                                        disabled={editorDisabled}
                                        elements={imageElements}
                                        mediaItems={mediaItems}
                                        mediaLibraryRef={mediaLibraryRef}
                                        onApplyMedia={applySelectedMediaToImage}
                                        onSelectElement={setSelectedImageElementId}
                                        onSelectMedia={setSelectedMediaId}
                                        onUploaded={addUploadedMedia}
                                        selectedElementId={activeImageElementId}
                                        selectedMediaId={selectedMediaId}
                                        uploadUrl={gift.media_store_url}
                                    />
                                ) : null}
                                {activeTab === 'gift' ? (
                                    <GiftMetadataPanel
                                        disabled={!canEditGift}
                                        errors={metadataErrors}
                                        metadata={metadata}
                                        onChange={changeMetadata}
                                    />
                                ) : null}
                                {activeTab === 'debug' && debugEnabled ? (
                                    <GiftDebugPanel canvas={selectedCanvas} pageId={selectedPageId} />
                                ) : null}
                            </div>
                        </div>
                    }
                />
            </main>
        </>
    );
}

type LocalDraftNoticeProps = {
    onDismiss: () => void;
};

function LocalDraftNotice({ onDismiss }: LocalDraftNoticeProps) {
    return (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[8px] border border-[#CBA980] bg-[#FFF7EE] px-4 py-3 text-sm text-[#42291D] shadow-sm">
            <span className="font-semibold">
                Rascunho local recuperado. Ele será sincronizado automaticamente quando o salvamento terminar.
            </span>
            <button
                className="min-h-9 rounded-[6px] border border-[#CBA980] bg-white px-3 text-sm font-semibold text-[#42291D] hover:bg-[#F6E4CF]"
                onClick={onDismiss}
                type="button"
            >
                Entendi
            </button>
        </div>
    );
}

function metadataFromGift(gift: EditableGift): GiftMetadataDraft {
    return {
        title: gift.title,
        recipient_name: gift.recipient_name ?? '',
        sender_name: gift.sender_name ?? '',
    };
}

function metadataDraftFromLocal(value: GiftMetadataDraft | undefined, fallback: GiftMetadataDraft): GiftMetadataDraft {
    if (!value || typeof value.title !== 'string') {
        return fallback;
    }

    return {
        title: value.title,
        recipient_name: typeof value.recipient_name === 'string' ? value.recipient_name : fallback.recipient_name,
        sender_name: typeof value.sender_name === 'string' ? value.sender_name : fallback.sender_name,
    };
}

function metadataFromResponse(value: MetadataSaveData['gift'], fallback: GiftMetadataDraft): GiftMetadataDraft {
    return {
        title: value.title ?? fallback.title,
        recipient_name: value.recipient_name ?? '',
        sender_name: value.sender_name ?? '',
    };
}

function metadataEquals(left: GiftMetadataDraft, right: GiftMetadataDraft): boolean {
    return (
        left.title === right.title &&
        left.recipient_name === right.recipient_name &&
        left.sender_name === right.sender_name
    );
}

function metadataErrorsFrom(error: unknown): Partial<Record<keyof GiftMetadataDraft, string>> {
    if (!(error instanceof AutosaveRequestError)) {
        return {};
    }

    return {
        title: firstString(error.errors.title),
        recipient_name: firstString(error.errors.recipient_name),
        sender_name: firstString(error.errors.sender_name),
    };
}

function errorMessageFrom(error: unknown, fallback: string): string {
    if (error instanceof AutosaveRequestError) {
        return firstAutosaveError(error.errors) ?? error.message ?? fallback;
    }

    return fallback;
}

function firstString(value: string[] | string | undefined): string | undefined {
    if (typeof value === 'string') {
        return value;
    }

    return value?.find((message) => typeof message === 'string' && message !== '');
}

function withoutKey<TValue>(record: Record<string, TValue>, key: string): Record<string, TValue> {
    const next = { ...record };
    delete next[key];

    return next;
}

function metadataDraftKey(giftId: string): string {
    return `scrapbook:gifts:${giftId}:metadata`;
}

function pageDraftKey(giftId: string, pageId: string): string {
    return `scrapbook:gifts:${giftId}:pages:${pageId}:canvas`;
}

function globalStatus({
    hasDirty,
    hasError,
    hasSaving,
    online,
}: {
    hasDirty: boolean;
    hasError: boolean;
    hasSaving: boolean;
    online: boolean;
}): SaveStatus {
    if (!online) {
        return 'offline';
    }

    if (hasSaving) {
        return 'saving';
    }

    if (hasError) {
        return 'error';
    }

    if (hasDirty) {
        return 'dirty';
    }

    return 'saved';
}

function saveDetail(status: SaveStatus, visibleError: string | null, hasRecoveredLocalDraft: boolean): string | null {
    if (status === 'error') {
        return visibleError;
    }

    if (status === 'dirty') {
        return 'Autosave em instantes';
    }

    if (status === 'offline') {
        return hasRecoveredLocalDraft ? 'Rascunho local recuperado' : 'Rascunho local protegido';
    }

    return null;
}

function firstVisibleError(
    metadataErrors: Partial<Record<keyof GiftMetadataDraft, string>>,
    pageErrors: Record<string, string>,
): string | null {
    return Object.values(metadataErrors).find(Boolean) ?? Object.values(pageErrors).find(Boolean) ?? null;
}
