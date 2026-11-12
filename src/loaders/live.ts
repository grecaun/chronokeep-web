import { useContext, useEffect, useRef } from "react";
import { LiveContext } from "../Parts/liveContext";

/** How often to check for new results when the live stream isn't available. */
export const LIVE_POLL_INTERVAL = 30000;

/** Whether a date-time from the API falls on the viewer's today. */
export function isToday(dateTime: string | undefined | null): boolean {
    if (!dateTime) {
        return false;
    }
    const now = new Date();
    const today = `${now.getFullYear()}-${`${now.getMonth() + 1}`.padStart(2, '0')}-${`${now.getDate()}`.padStart(2, '0')}`;
    return dateTime.substring(0, 10) === today;
}

/**
 * While `enabled`, watches the results API's stream for an event year and calls `onUpdate`
 * whenever its results change, so the page can fetch them again. If the stream drops and
 * reconnects, `onUpdate` is called too, since a change may have been missed in between.
 * If the stream can't be used at all, it checks every LIVE_POLL_INTERVAL instead.
 */
export function useLiveUpdates(slug: string | undefined, year: string | undefined, enabled: boolean, onUpdate: () => void) {
    // keep the latest callback without reconnecting every time the page renders
    const update = useRef(onUpdate);
    update.current = onUpdate;
    const liveStatus = useContext(LiveContext);

    // let the page show it's live, and guard against refreshes, while watching
    useEffect(() => {
        if (!enabled || !slug || liveStatus === null) {
            return;
        }
        return liveStatus.watch();
    }, [enabled, slug, liveStatus]);

    useEffect(() => {
        if (!enabled || !slug) {
            return;
        }
        let poll: ReturnType<typeof setInterval> | null = null;
        const startPolling = () => {
            if (poll === null) {
                poll = setInterval(() => { update.current(); }, LIVE_POLL_INTERVAL);
            }
        };
        if (typeof EventSource === 'undefined') {
            startPolling();
            return () => {
                if (poll !== null) {
                    clearInterval(poll);
                }
            };
        }
        const query = new URLSearchParams({ slug: slug, key: import.meta.env.VITE_CHRONOKEEP_ACCESS_TOKEN });
        if (year) {
            query.set('year', year);
        }
        const source = new EventSource(`${import.meta.env.VITE_CHRONOKEEP_API_URL}results/stream?${query.toString()}`);
        let connectedBefore = false;
        source.addEventListener('ready', () => {
            // a second ready means the stream reconnected and may have missed a change
            if (connectedBefore) {
                update.current();
            }
            connectedBefore = true;
        });
        source.addEventListener('results', () => { update.current(); });
        source.onerror = () => {
            // the browser retries dropped streams by itself; a closed one won't come back
            if (source.readyState === EventSource.CLOSED) {
                startPolling();
            }
        };
        return () => {
            source.close();
            if (poll !== null) {
                clearInterval(poll);
            }
        };
    }, [slug, year, enabled]);
}
