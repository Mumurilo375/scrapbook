import { Head } from '@inertiajs/react';
import type { CSSProperties } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { normalizeThemeConfig } from '../../../../components/renderer';
import type { Canvas, CanvasElement } from '../../../../domain/canvas/schema';
import { ElementPropertiesPanel } from '../../components/editor/ElementPropertiesPanel';
import { EditorTabs } from '../../components/editor/EditorTabs';
import { GiftContentPanel } from '../../components/editor/GiftContentPanel';
import { GiftDebugPanel } from '../../components/editor/GiftDebugPanel';
import { GiftEditorLayout } from '../../components/editor/GiftEditorLayout';
import { GiftEditorTopBar } from '../../components/editor/GiftEditorTopBar';
import { GiftImagesPanel } from '../../components/editor/GiftImagesPanel';
import { GiftLayersPanel } from '../../components/editor/GiftLayersPanel';
import type { GiftMediaLibraryHandle } from '../../components/editor/GiftMediaLibrary';
import { GiftMetadataPanel, type GiftMetadataDraft } from '../../components/editor/GiftMetadataPanel';
import { GiftPagePreview } from '../../components/editor/GiftPagePreview';
import { GiftPageSidebar } from '../../components/editor/GiftPageSidebar';
import {
    patchCanvasElement,
    patchElementStyle,
    textFieldForElement,
    type ElementPatch,
} from '../../components/editor/canvasTransformUtils';
import type {
    EditableTextElement,
    EditorMediaItem,
    EditorPage,
    EditorTab,
    ImageUploadTarget,
    SaveStatus,
} from '../../components/editor/editorTypes';
import {
    applyMediaToImageElement,
    canvasesAreEqual,
    cloneCanvas,
    normalizeCanvas,
    textElementsFromCanvas,
    updateCanvasText,
} from '../../components/editor/editorUtils';
import { applyLayerAction, normalizeCanvasLayerOrder, type LayerAction } from '../../components/editor/layerUtils';
import {
    AutosaveRequestError,
    clearLocalDraft,
    debugAutosave,
    firstAutosaveError,
    patchJson,
    readLocalDraft,
    useAutosave,
    useOnlineStatus,
    writeLocalDraft,
} from '../../components/editor/useAutosave';
import { useCanvasSelection } from '../../components/editor/useCanvasSelection';
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
    success: boolean;
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
    const recoveredMetadataDraft = useMemo(() => {
        const key = metadataDraftKey(gift.id);
        const draft = readLocalDraft<GiftMetadataDraft>(key);

        if (!draft || localDraftIsNewer(draft.savedAt, gift.last_edited_at)) {
            return draft;
        }

        clearLocalDraft(key);

        return null;
    }, [gift.id, gift.last_edited_at]);
    const recoveredPageDrafts = useMemo(() => {
        const drafts: Record<string, Canvas> = {};

        for (const page of editorPages) {
            const key = pageDraftKey(gift.id, page.id);
            const draft = readLocalDraft<Canvas>(key);

            if (!draft) {
                continue;
            }

            if (localDraftIsNewer(draft.savedAt, page.updated_at ?? gift.last_edited_at)) {
                drafts[page.id] = normalizeCanvas(draft.value);

                continue;
            }

            clearLocalDraft(key);
        }

        return drafts;
    }, [editorPages, gift.id, gift.last_edited_at]);

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
    const selection = useCanvasSelection(selectedCanvas);
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
    const selectedMediaItem = selectedMediaId ? (mediaItems.find((item) => item.id === selectedMediaId) ?? null) : null;
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
        debugAutosave('metadata-save-started');

        try {
            const response = await patchJson<AutosaveResponse<MetadataSaveData>>(gift.update_url, snapshot);

            if (metadataSaveTokenRef.current !== saveToken) {
                return;
            }

            const savedDraft = metadataFromResponse(response.data.gift, snapshot);
            const currentDraft = metadataRef.current;
            const latestMatchesSnapshot = metadataEquals(currentDraft, snapshot);
            setSavedMetadata(savedDraft);
            savedMetadataRef.current = savedDraft;

            if (latestMatchesSnapshot) {
                setMetadata(savedDraft);
                metadataRef.current = savedDraft;
                clearLocalDraft(metadataDraftKey(gift.id));
            }

            setMetadataStatus(latestMatchesSnapshot ? 'saved' : 'dirty');
            debugAutosave('metadata-save-succeeded', { hasNewerChanges: !latestMatchesSnapshot });
        } catch (error) {
            if (metadataSaveTokenRef.current !== saveToken) {
                return;
            }

            setMetadataErrors(metadataErrorsFrom(error));
            setMetadataStatus(navigator.onLine ? 'error' : 'offline');
            debugAutosave('metadata-save-failed', { message: errorMessageFrom(error, 'Erro ao salvar metadados.') });
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
            debugAutosave('page-save-started', { pageId });

            try {
                const response = await patchJson<AutosaveResponse<PageSaveData>>(page.update_url, { canvas: snapshot });
                const savedCanvasFromServer = normalizeCanvas(response.data.page.canvas);

                if (pageSaveTokensRef.current[pageId] !== saveToken) {
                    return;
                }

                const latestCanvas = pageCanvasesRef.current[pageId] ?? snapshot;
                const latestMatchesSnapshot = canvasesAreEqual(latestCanvas, snapshot);
                setSavedCanvases((current) => ({ ...current, [pageId]: cloneCanvas(savedCanvasFromServer) }));
                savedCanvasesRef.current = {
                    ...savedCanvasesRef.current,
                    [pageId]: cloneCanvas(savedCanvasFromServer),
                };

                if (latestMatchesSnapshot) {
                    setPageCanvases((current) => ({ ...current, [pageId]: cloneCanvas(savedCanvasFromServer) }));
                    pageCanvasesRef.current = {
                        ...pageCanvasesRef.current,
                        [pageId]: cloneCanvas(savedCanvasFromServer),
                    };
                    clearLocalDraft(pageDraftKey(gift.id, pageId));
                }

                setPageSaveStates((current) => ({ ...current, [pageId]: latestMatchesSnapshot ? 'saved' : 'dirty' }));
                debugAutosave('page-save-succeeded', { hasNewerChanges: !latestMatchesSnapshot, pageId });
            } catch (error) {
                if (pageSaveTokensRef.current[pageId] !== saveToken) {
                    return;
                }

                setPageErrors((current) => ({
                    ...current,
                    [pageId]: errorMessageFrom(error, 'Não foi possível salvar esta página.'),
                }));
                setPageSaveStates((current) => ({ ...current, [pageId]: navigator.onLine ? 'error' : 'offline' }));
                debugAutosave('page-save-failed', {
                    message: errorMessageFrom(error, 'Não foi possível salvar esta página.'),
                    pageId,
                });
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
        label: 'metadata',
        onSave: autosaveMetadata,
    });
    useAutosave({
        enabled: canEditGift && online && dirtyPageIds.length > 0,
        label: 'pages',
        onSave: autosavePages,
    });

    function selectPage(pageId: string) {
        setSelectedPageId(pageId);
        selection.clearSelection();
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

    function addUploadedMedia(mediaItem: EditorMediaItem, target: ImageUploadTarget | null) {
        setMediaItems((current) => [mediaItem, ...current.filter((item) => item.id !== mediaItem.id)]);
        setSelectedMediaId(mediaItem.id);

        if (!target) {
            return;
        }

        applyMediaToPage(target.pageId, target.elementId, mediaItem);

        if (target.pageId === selectedPageId) {
            selection.selectElement(target.elementId);
        }
    }

    function changeElementFromStage(elementId: string, nextElement: CanvasElement) {
        if (!selectedPage || editorDisabled) {
            return;
        }

        updatePageCanvas(selectedPage.id, (canvas) => ({
            ...canvas,
            elements: canvas.elements.map((element) => (element.id === elementId ? nextElement : element)),
        }));
    }

    function patchSelectedElement(patch: ElementPatch) {
        if (!selectedPage || !selection.selectedElement || editorDisabled) {
            return;
        }

        const elementId = selection.selectedElement.id;

        updatePageCanvas(selectedPage.id, (canvas) => {
            const nextCanvas = patchCanvasElement(canvas, elementId, patch);

            return patch.z === undefined ? nextCanvas : normalizeCanvasLayerOrder(nextCanvas);
        });
    }

    function patchSelectedElementStyle(stylePatch: Record<string, unknown>) {
        if (!selectedPage || !selection.selectedElement || editorDisabled) {
            return;
        }

        const elementId = selection.selectedElement.id;

        updatePageCanvas(selectedPage.id, (canvas) => patchElementStyle(canvas, elementId, stylePatch));
    }

    function changeSelectedElementText(element: CanvasElement, value: string) {
        if (!selectedPage || editorDisabled) {
            return;
        }

        const field = textFieldForElement(element);

        updatePageCanvas(selectedPage.id, (canvas) => updateCanvasText(canvas, element.id, field, value));
    }

    function changeSelectedElementLayer(action: LayerAction) {
        if (!selectedPage || !selection.selectedElement || editorDisabled) {
            return;
        }

        const elementId = selection.selectedElement.id;

        updatePageCanvas(selectedPage.id, (canvas) => applyLayerAction(canvas, elementId, action));
    }

    function selectElementFromCanvas(elementId: string) {
        selection.selectElement(elementId);
    }

    function replaceSelectedImage() {
        if (!selectedPage || !selection.selectedElement || selection.selectedElement.type !== 'image' || editorDisabled) {
            return;
        }

        mediaLibraryRef.current?.openFilePicker({ pageId: selectedPage.id, elementId: selection.selectedElement.id });
    }

    function handleElementDoubleClick(element: CanvasElement) {
        if (!selectedPage || editorDisabled || element.type !== 'image') {
            return;
        }

        mediaLibraryRef.current?.openFilePicker({ pageId: selectedPage.id, elementId: element.id });
    }

    function useSelectedMediaOnSelectedImage() {
        if (!selectedPage || !selection.selectedElement || selection.selectedElement.type !== 'image' || !selectedMediaItem) {
            return;
        }

        applyMediaToPage(selectedPage.id, selection.selectedElement.id, selectedMediaItem);
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
                                disabled={editorDisabled}
                                maxTextLength={selectedPage?.text_max_length ?? 1000}
                                onChangeElement={changeElementFromStage}
                                onChangeText={changeSelectedElementText}
                                onClearSelection={selection.clearSelection}
                                onElementDoubleClick={handleElementDoubleClick}
                                onNext={() => goToPage(1)}
                                onPrevious={() => goToPage(-1)}
                                onSelectElement={selectElementFromCanvas}
                                page={selectedPage}
                                selectedElementId={selection.selectedElementId}
                                theme={gift.theme?.config}
                            />
                        </div>
                    }
                    right={
                        <div className="rounded-[8px] border border-[#D8B991] bg-[#FFF7EE]/95 p-2 shadow-sm sm:p-3">
                            <ElementPropertiesPanel
                                disabled={editorDisabled}
                                element={selection.selectedElement}
                                maxTextLength={selectedPage?.text_max_length ?? 1000}
                                onChangeText={changeSelectedElementText}
                                onLayerAction={changeSelectedElementLayer}
                                onPatchElement={patchSelectedElement}
                                onPatchStyle={patchSelectedElementStyle}
                                onReplaceImage={replaceSelectedImage}
                                onUseSelectedMedia={useSelectedMediaOnSelectedImage}
                                selectedMediaItem={selectedMediaItem}
                            />
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
                                        mediaItems={mediaItems}
                                        mediaLibraryRef={mediaLibraryRef}
                                        onSelectMedia={setSelectedMediaId}
                                        onUploaded={addUploadedMedia}
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
                                {activeTab === 'layers' ? (
                                    <GiftLayersPanel
                                        canvas={selectedCanvas}
                                        disabled={editorDisabled}
                                        onLayerAction={changeSelectedElementLayer}
                                        onSelectElement={selectElementFromCanvas}
                                        selectedElementId={selection.selectedElementId}
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

function localDraftIsNewer(localSavedAt: string, serverSavedAt: string | null): boolean {
    const localTime = Date.parse(localSavedAt);

    if (!Number.isFinite(localTime)) {
        return false;
    }

    if (!serverSavedAt) {
        return true;
    }

    const serverTime = Date.parse(serverSavedAt);

    if (!Number.isFinite(serverTime)) {
        return true;
    }

    return localTime > serverTime;
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
