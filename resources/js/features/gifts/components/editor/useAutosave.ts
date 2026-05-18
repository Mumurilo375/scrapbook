import { useEffect, useState } from 'react';

export const AUTOSAVE_DELAY_MS = 900;

type UseAutosaveOptions = {
    delayMs?: number;
    enabled: boolean;
    label?: string;
    onSave: () => void | Promise<void>;
};

type AutosavePayloadError = Record<string, string[] | string>;

type AutosaveErrorPayload = {
    data?: unknown;
    errors?: AutosavePayloadError;
    message?: string;
    success?: unknown;
};

export class AutosaveRequestError extends Error {
    errors: AutosavePayloadError;
    status: number;

    constructor(message: string, status: number, errors: AutosavePayloadError = {}) {
        super(message);
        this.name = 'AutosaveRequestError';
        this.status = status;
        this.errors = errors;
    }
}

export function useAutosave({
    delayMs = AUTOSAVE_DELAY_MS,
    enabled,
    label = 'draft',
    onSave,
}: UseAutosaveOptions): void {
    useEffect(() => {
        if (!enabled) {
            return;
        }

        debugAutosave('scheduled', { label });

        const timeoutId = window.setTimeout(() => {
            debugAutosave('debounce-fired', { label });
            void onSave();
        }, delayMs);

        return () => window.clearTimeout(timeoutId);
    }, [delayMs, enabled, label, onSave]);
}

export function useOnlineStatus(): boolean {
    const [online, setOnline] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine));

    useEffect(() => {
        function handleOnline() {
            setOnline(true);
        }

        function handleOffline() {
            setOnline(false);
        }

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return online;
}

export async function patchJson<TResponse>(url: string, payload: unknown): Promise<TResponse> {
    debugAutosave('request-started', { url });

    const response = await fetch(url, {
        method: 'PATCH',
        credentials: 'same-origin',
        body: JSON.stringify(payload),
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken(),
            'X-Requested-With': 'XMLHttpRequest',
        },
    });
    const responsePayload = (await response.json().catch(() => null)) as (AutosaveErrorPayload & TResponse) | null;

    if (!responsePayload || typeof responsePayload !== 'object') {
        debugAutosave('response-validation-failed', { status: response.status, url });

        throw new AutosaveRequestError('Resposta inválida do servidor.', response.status);
    }

    if (!response.ok) {
        debugAutosave('request-failed', { status: response.status, url });

        throw new AutosaveRequestError(
            firstAutosaveError(responsePayload.errors) ?? responsePayload.message ?? 'Não foi possível salvar.',
            response.status,
            responsePayload.errors,
        );
    }

    if (responsePayload.success === false || responsePayload.data === undefined) {
        debugAutosave('response-validation-failed', { status: response.status, url });

        throw new AutosaveRequestError(responsePayload.message ?? 'Resposta inesperada do servidor.', response.status);
    }

    debugAutosave('request-succeeded', { status: response.status, url });

    return responsePayload as TResponse;
}

export function firstAutosaveError(errors: AutosavePayloadError | undefined): string | null {
    if (!errors) {
        return null;
    }

    return (
        Object.values(errors)
            .flat()
            .find((message): message is string => typeof message === 'string' && message !== '') ?? null
    );
}

export type LocalDraft<TValue> = {
    schemaVersion: 1;
    savedAt: string;
    value: TValue;
};

export function readLocalDraft<TValue>(key: string): LocalDraft<TValue> | null {
    if (!hasLocalStorage()) {
        return null;
    }

    try {
        const rawDraft = window.localStorage.getItem(key);

        if (!rawDraft) {
            return null;
        }

        const parsed = JSON.parse(rawDraft) as Partial<LocalDraft<TValue>>;

        if (parsed.schemaVersion !== 1 || typeof parsed.savedAt !== 'string' || parsed.value === undefined) {
            return null;
        }

        return parsed as LocalDraft<TValue>;
    } catch {
        return null;
    }
}

export function writeLocalDraft<TValue>(key: string, value: TValue): void {
    if (!hasLocalStorage()) {
        return;
    }

    try {
        window.localStorage.setItem(
            key,
            JSON.stringify({
                schemaVersion: 1,
                savedAt: new Date().toISOString(),
                value,
            } satisfies LocalDraft<TValue>),
        );
    } catch {
        // localStorage is only a recovery fallback; autosave server errors remain visible elsewhere.
    }
}

export function clearLocalDraft(key: string): void {
    if (!hasLocalStorage()) {
        return;
    }

    try {
        window.localStorage.removeItem(key);
    } catch {
        // Ignore storage cleanup failures.
    }
}

export function debugAutosave(event: string, context: Record<string, unknown> = {}): void {
    if (!import.meta.env.DEV) {
        return;
    }

    console.debug('[autosave]', event, context);
}

function csrfToken(): string {
    return document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '';
}

function hasLocalStorage(): boolean {
    return typeof window !== 'undefined' && 'localStorage' in window;
}
