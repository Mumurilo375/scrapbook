import { usePage } from '@inertiajs/react';
import { useCallback } from 'react';

type AnalyticsSharedProps = {
    analytics?: {
        enabled?: boolean;
        eventUrl?: string;
    };
    gift?: {
        id?: string;
        analytics?: {
            enabled?: boolean;
            event_url?: string;
            visit_uuid?: string | null;
        };
    };
};

type TrackEventOptions = {
    elementId?: string;
    elementType?: string;
    eventUrl?: string;
    giftId?: string;
    pageId?: string;
    pageIndex?: number;
    payload?: Record<string, unknown>;
    sendBeacon?: boolean;
    visitUuid?: string | null;
};

export function useAnalytics() {
    const page = usePage<AnalyticsSharedProps>();
    const shared = page.props.analytics;
    const giftAnalytics = page.props.gift?.analytics;
    const giftId = page.props.gift?.id;
    const enabled = Boolean((giftAnalytics?.enabled ?? shared?.enabled) && (giftAnalytics?.event_url ?? shared?.eventUrl));
    const eventUrl = giftAnalytics?.event_url ?? shared?.eventUrl ?? null;
    const visitUuid = giftAnalytics?.visit_uuid ?? null;

    const trackEvent = useCallback(
        (eventName: string, options: TrackEventOptions = {}) => {
            if (!enabled || typeof window === 'undefined') {
                return;
            }

            const url = options.eventUrl ?? eventUrl;

            if (!url) {
                return;
            }

            const body = {
                _token: csrfToken(),
                element_id: options.elementId,
                element_type: options.elementType,
                event_name: eventName,
                event_uuid: randomUuid(),
                gift_id: options.giftId ?? giftId,
                page_id: options.pageId,
                page_index: options.pageIndex,
                payload: options.payload ?? {},
                screen_size_bucket: screenSizeBucket(),
                visit_uuid: options.visitUuid ?? visitUuid,
            };

            const encoded = JSON.stringify(body);

            if (options.sendBeacon !== false && typeof navigator.sendBeacon === 'function') {
                const blob = new Blob([encoded], { type: 'application/json' });

                if (navigator.sendBeacon(url, blob)) {
                    return;
                }
            }

            void fetch(url, {
                body: encoded,
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken(),
                    'X-Requested-With': 'XMLHttpRequest',
                },
                keepalive: true,
                method: 'POST',
            }).catch(() => undefined);
        },
        [enabled, eventUrl, giftId, visitUuid],
    );

    return { enabled, eventUrl, trackEvent, visitUuid };
}

function csrfToken(): string {
    if (typeof document === 'undefined') {
        return '';
    }

    return document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '';
}

function randomUuid(): string | null {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }

    return null;
}

function screenSizeBucket(): string | null {
    if (typeof window === 'undefined') {
        return null;
    }

    const width = window.innerWidth;

    if (width < 640) {
        return 'small';
    }

    if (width < 1024) {
        return 'medium';
    }

    return 'large';
}
