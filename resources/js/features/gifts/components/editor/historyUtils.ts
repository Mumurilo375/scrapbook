import type { Canvas } from '../../../../domain/canvas/schema';

export const EDITOR_HISTORY_LIMIT = 40;
export const EDITOR_HISTORY_DEBOUNCE_MS = 700;

export type HistoryEntry = {
    pageId: string;
    before: Canvas;
    after: Canvas;
    label?: string;
    createdAt: number;
};

export type PageHistoryState = {
    redo: HistoryEntry[];
    undo: HistoryEntry[];
};

export type EditorHistoryState = Record<string, PageHistoryState>;

export type HistoryOperationResult = {
    canvas: Canvas | null;
    entry: HistoryEntry | null;
    history: EditorHistoryState;
};

export function createHistoryEntry(
    pageId: string,
    before: Canvas,
    after: Canvas,
    label?: string,
    createdAt = Date.now(),
): HistoryEntry | null {
    if (canvasesAreEqual(before, after)) {
        return null;
    }

    return {
        pageId,
        before: cloneCanvasSnapshot(before),
        after: cloneCanvasSnapshot(after),
        label,
        createdAt,
    };
}

export function pushHistoryEntry(
    history: EditorHistoryState,
    entry: HistoryEntry | null,
    limit = EDITOR_HISTORY_LIMIT,
): EditorHistoryState {
    if (!entry) {
        return history;
    }

    const pageHistory = pageHistoryFor(history, entry.pageId);
    const undo = trimEntries([...pageHistory.undo, cloneHistoryEntry(entry)], limit);

    return {
        ...history,
        [entry.pageId]: {
            undo,
            redo: [],
        },
    };
}

export function undoHistory(
    history: EditorHistoryState,
    pageId: string,
    limit = EDITOR_HISTORY_LIMIT,
): HistoryOperationResult {
    const pageHistory = pageHistoryFor(history, pageId);
    const entry = pageHistory.undo.at(-1);

    if (!entry) {
        return { canvas: null, entry: null, history };
    }

    const undo = pageHistory.undo.slice(0, -1);
    const redo = trimEntries([...pageHistory.redo, cloneHistoryEntry(entry)], limit);
    const nextHistory = {
        ...history,
        [pageId]: {
            undo,
            redo,
        },
    };

    return {
        canvas: cloneCanvasSnapshot(entry.before),
        entry: cloneHistoryEntry(entry),
        history: nextHistory,
    };
}

export function redoHistory(
    history: EditorHistoryState,
    pageId: string,
    limit = EDITOR_HISTORY_LIMIT,
): HistoryOperationResult {
    const pageHistory = pageHistoryFor(history, pageId);
    const entry = pageHistory.redo.at(-1);

    if (!entry) {
        return { canvas: null, entry: null, history };
    }

    const redo = pageHistory.redo.slice(0, -1);
    const undo = trimEntries([...pageHistory.undo, cloneHistoryEntry(entry)], limit);
    const nextHistory = {
        ...history,
        [pageId]: {
            undo,
            redo,
        },
    };

    return {
        canvas: cloneCanvasSnapshot(entry.after),
        entry: cloneHistoryEntry(entry),
        history: nextHistory,
    };
}

export function historyAvailability(
    history: EditorHistoryState,
    pageId: string | null | undefined,
): {
    canRedo: boolean;
    canUndo: boolean;
} {
    if (!pageId) {
        return { canRedo: false, canUndo: false };
    }

    const pageHistory = pageHistoryFor(history, pageId);

    return {
        canRedo: pageHistory.redo.length > 0,
        canUndo: pageHistory.undo.length > 0,
    };
}

export function cloneCanvasSnapshot(canvas: Canvas): Canvas {
    return JSON.parse(JSON.stringify(canvas)) as Canvas;
}

function pageHistoryFor(history: EditorHistoryState, pageId: string): PageHistoryState {
    return history[pageId] ?? { redo: [], undo: [] };
}

function cloneHistoryEntry(entry: HistoryEntry): HistoryEntry {
    return {
        ...entry,
        before: cloneCanvasSnapshot(entry.before),
        after: cloneCanvasSnapshot(entry.after),
    };
}

function canvasesAreEqual(left: Canvas, right: Canvas): boolean {
    return JSON.stringify(left) === JSON.stringify(right);
}

function trimEntries(entries: HistoryEntry[], limit: number): HistoryEntry[] {
    const safeLimit = Math.max(1, Math.floor(limit));

    return entries.slice(Math.max(0, entries.length - safeLimit));
}
