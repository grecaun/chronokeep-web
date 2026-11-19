import { useContext, useEffect, useRef } from "react";
import { LiveContext } from "../Parts/liveContext";
import { TimeResult } from "../Interfaces/types";

/** How often to check for new results when the live stream isn't available. */
export const LIVE_POLL_INTERVAL = 30000;

/**
 * How long the live stream may go without a message (the API pings every 30 seconds)
 * before it's taken as dead and a new one is opened.
 */
export const LIVE_STREAM_TIMEOUT = 75000;

/** How recently a read must have happened for a race to count as possibly live. */
export const LIVE_WINDOW = 6 * 60 * 60 * 1000;

/** Whether a result marks its runner DNF (3 or 30) or DNS (31) rather than being a read. */
export function isDnfOrDns(result: TimeResult): boolean {
    return result.type === 3 || result.type >= 30;
}

// local_time is sent as ISO 8601 with its UTC offset, and with up to seven fractional digits
const LOCAL_TIME = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})(?:\.(\d+))?(Z|[+-]\d{2}:\d{2})$/;

/**
 * When a read happened, in milliseconds since the epoch, from its local_time. Returns null
 * when local_time isn't an ISO 8601 time with a UTC offset, since the moment can't be known.
 */
export function readTime(localTime: string | undefined | null): number | null {
    const match = LOCAL_TIME.exec(localTime?.trim() ?? '');
    if (match === null) {
        return null;
    }
    // Date only promises to read three fractional digits
    const fraction = match[2] ? `.${match[2].substring(0, 3).padEnd(3, '0')}` : '';
    const time = Date.parse(`${match[1]}${fraction}${match[3]}`);
    return Number.isNaN(time) ? null : time;
}

/**
 * Whether a race might be live, from the results a page has: someone is still out on the
 * course (they have no finish and aren't marked DNF or DNS), and a read (other than a DNF
 * or DNS) happened within LIVE_WINDOW of `now`.
 */
export function mightBeLive(results: TimeResult[], now: number = Date.now()): boolean {
    const done = new Set<string>();
    const seen = new Set<string>();
    let recentRead = false;
    for (const result of results) {
        seen.add(result.person_id);
        if (result.finish || isDnfOrDns(result)) {
            done.add(result.person_id);
        }
        if (!isDnfOrDns(result)) {
            const time = readTime(result.local_time);
            if (time !== null && now - time < LIVE_WINDOW) {
                recentRead = true;
            }
        }
    }
    return recentRead && done.size < seen.size;
}

/**
 * While `enabled`, watches the results API's stream for an event year and calls `onUpdate`
 * whenever its results change, so the page can fetch them again. If the stream drops and
 * reconnects, `onUpdate` is called too, since a change may have been missed in between.
 * A stream that goes quiet for LIVE_STREAM_TIMEOUT is replaced with a new one.
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
        const url = `${import.meta.env.VITE_CHRONOKEEP_API_URL}results/stream?${query.toString()}`;
        let source: EventSource | null = null;
        let watchdog: ReturnType<typeof setTimeout> | null = null;
        let connectedBefore = false;
        const stopWatchdog = () => {
            if (watchdog !== null) {
                clearTimeout(watchdog);
                watchdog = null;
            }
        };
        // The server pings every 30 seconds. If nothing arrives for LIVE_STREAM_TIMEOUT, the
        // connection may look open but be dead, which the browser won't notice by itself,
        // so start a new one. Its ready event fetches anything missed in between.
        const heard = () => {
            stopWatchdog();
            watchdog = setTimeout(() => {
                watchdog = null;
                source?.close();
                connect();
            }, LIVE_STREAM_TIMEOUT);
        };
        const connect = () => {
            const current = new EventSource(url);
            source = current;
            current.addEventListener('ready', () => {
                heard();
                // a second ready means the stream reconnected and may have missed a change
                if (connectedBefore) {
                    update.current();
                }
                connectedBefore = true;
            });
            current.addEventListener('results', () => {
                heard();
                update.current();
            });
            current.addEventListener('ping', heard);
            current.onerror = () => {
                // the browser retries dropped streams by itself; a closed one won't come back
                if (current.readyState === EventSource.CLOSED) {
                    stopWatchdog();
                    startPolling();
                }
            };
            heard();
        };
        connect();
        return () => {
            stopWatchdog();
            source?.close();
            if (poll !== null) {
                clearInterval(poll);
            }
        };
    }, [slug, year, enabled]);
}
