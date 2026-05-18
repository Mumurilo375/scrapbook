import { useCallback, useEffect, useRef, useState } from 'react';

import type { Canvas } from '../../../../domain/canvas/schema';
import {
    createHistoryEntry,
    EDITOR_HISTORY_DEBOUNCE_MS,
    EDITOR_HISTORY_LIMIT,
    historyAvailability,
    pushHistoryEntry,
    redoHistory,
    undoHistory,
    type EditorHistoryState,
    type HistoryOperationResult,
} from './historyUtils';

type UseEditorHistoryOptions = {
    debounceMs?: number;
    limit?: number;
};

type PendingHistoryEntry = {
    after: Canvas;
    before: Canvas;
    label?: string;
    pageId: string;
    timeoutId: number | null;
};

export function useEditorHistory({
    debounceMs = EDITOR_HISTORY_DEBOUNCE_MS,
    limit = EDITOR_HISTORY_LIMIT,
}: UseEditorHistoryOptions = {}) {
    const [history, setHistory] = useState<EditorHistoryState>({});
    const historyRef = useRef(history);
    const pendingRef = useRef<Record<string, PendingHistoryEntry>>({});

    useEffect(() => {
        historyRef.current = history;
    }, [history]);

    const commitEntry = useCallback(
        (entry: ReturnType<typeof createHistoryEntry>) => {
            if (!entry) {
                return;
            }

            const nextHistory = pushHistoryEntry(historyRef.current, entry, limit);
            historyRef.current = nextHistory;
            setHistory(nextHistory);
        },
        [limit],
    );

    const commitPendingKey = useCallback(
        (key: string) => {
            const pending = pendingRef.current[key];

            if (!pending) {
                return;
            }

            if (pending.timeoutId !== null) {
                window.clearTimeout(pending.timeoutId);
            }

            const nextPending = { ...pendingRef.current };
            delete nextPending[key];
            pendingRef.current = nextPending;

            commitEntry(createHistoryEntry(pending.pageId, pending.before, pending.after, pending.label));
        },
        [commitEntry],
    );

    const flushPending = useCallback(
        (pageId?: string | null) => {
            Object.entries(pendingRef.current).forEach(([key, pending]) => {
                if (pageId && pending.pageId !== pageId) {
                    return;
                }

                commitPendingKey(key);
            });
        },
        [commitPendingKey],
    );

    const push = useCallback(
        (pageId: string, before: Canvas, after: Canvas, label?: string) => {
            flushPending(pageId);
            commitEntry(createHistoryEntry(pageId, before, after, label));
        },
        [commitEntry, flushPending],
    );

    const pushDebounced = useCallback(
        (pageId: string, groupKey: string, before: Canvas, after: Canvas, label?: string) => {
            const key = `${pageId}:${groupKey}`;
            const current = pendingRef.current[key];

            if (current?.timeoutId !== null && current?.timeoutId !== undefined) {
                window.clearTimeout(current.timeoutId);
            }

            const pending: PendingHistoryEntry = {
                after,
                before: current?.before ?? before,
                label: current?.label ?? label,
                pageId,
                timeoutId: null,
            };

            pending.timeoutId = window.setTimeout(() => commitPendingKey(key), debounceMs);
            pendingRef.current = {
                ...pendingRef.current,
                [key]: pending,
            };
        },
        [commitPendingKey, debounceMs],
    );

    const undo = useCallback(
        (pageId: string): HistoryOperationResult => {
            flushPending(pageId);

            const result = undoHistory(historyRef.current, pageId, limit);

            if (result.entry) {
                historyRef.current = result.history;
                setHistory(result.history);
            }

            return result;
        },
        [flushPending, limit],
    );

    const redo = useCallback(
        (pageId: string): HistoryOperationResult => {
            flushPending(pageId);

            const result = redoHistory(historyRef.current, pageId, limit);

            if (result.entry) {
                historyRef.current = result.history;
                setHistory(result.history);
            }

            return result;
        },
        [flushPending, limit],
    );

    useEffect(() => {
        return () => {
            Object.values(pendingRef.current).forEach((pending) => {
                if (pending.timeoutId !== null) {
                    window.clearTimeout(pending.timeoutId);
                }
            });
        };
    }, []);

    return {
        availability: (pageId: string | null | undefined) => historyAvailability(history, pageId),
        flushPending,
        history,
        push,
        pushDebounced,
        redo,
        undo,
    };
}
