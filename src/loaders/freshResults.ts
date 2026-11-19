import { useCallback, useEffect, useRef, useState } from "react";
import { TimeResult } from "../Interfaces/types";

/** How long a new or changed result stays tinted, in milliseconds. Matches the fade in style.css. */
export const FRESH_FADE = 5000;

/** Identifies a runner's result within an event year's results. */
export function freshKey(result: TimeResult): string {
    return `${result.distance}|${result.person_id}`;
}

// What makes a result look different on the page: a new read, time, place along the course, or status.
function signature(result: TimeResult): string {
    return [
        result.local_time, result.seconds, result.milliseconds, result.chip_seconds, result.chip_milliseconds,
        result.location, result.segment, result.occurence, result.finish, result.type,
    ].join('|');
}

/**
 * The keys (see freshKey) of results in `next` that weren't in `previous` or have changed since,
 * such as a runner's first read, a new split or their finish. Changes in rankings alone, which
 * shift as others finish, don't count.
 */
export function changedResults(previous: TimeResult[], next: TimeResult[]): string[] {
    const before = new Map<string, string>();
    for (const result of previous) {
        before.set(freshKey(result), signature(result));
    }
    const changed: string[] = [];
    for (const result of next) {
        const key = freshKey(result);
        if (before.get(key) !== signature(result)) {
            changed.push(key);
        }
    }
    return changed;
}

/**
 * Tracks which results just changed, so the tables can tint them for FRESH_FADE. Call `mark`
 * with the results before and after a live refresh. `fresh` maps each tinted result's key to
 * when it changed; tables key the row by that too, so a result that changes again fades again.
 */
export function useFreshResults(): { fresh: ReadonlyMap<string, number>, mark: (previous: TimeResult[], next: TimeResult[]) => void } {
    const [fresh, setFresh] = useState<ReadonlyMap<string, number>>(() => new Map());
    const timers = useRef(new Set<ReturnType<typeof setTimeout>>());

    useEffect(() => {
        const pending = timers.current;
        return () => {
            pending.forEach(timer => { clearTimeout(timer); });
            pending.clear();
        };
    }, []);

    const mark = useCallback((previous: TimeResult[], next: TimeResult[]) => {
        // nothing was on screen before, so there's nothing to compare with
        if (previous.length === 0) {
            return;
        }
        const changed = changedResults(previous, next);
        if (changed.length === 0) {
            return;
        }
        const stamp = Date.now();
        setFresh(current => {
            const updated = new Map(current);
            for (const key of changed) {
                updated.set(key, stamp);
            }
            return updated;
        });
        const timer = setTimeout(() => {
            timers.current.delete(timer);
            setFresh(current => {
                const updated = new Map(current);
                for (const key of changed) {
                    // a later change keeps it tinted for its own fade
                    if (updated.get(key) === stamp) {
                        updated.delete(key);
                    }
                }
                return updated;
            });
        }, FRESH_FADE);
        timers.current.add(timer);
    }, []);

    return { fresh, mark };
}
