import { TimeResult } from "../Interfaces/types";
import { isDnfOrDns, readTime } from "../loaders/live";
import FormatTime from "./FormatTime";

/** How many recent changes the live badge lists. */
export const RECENT_CHANGES = 10;

/** A runner's latest read, as listed under the live badge. */
export interface RecentChange {
    key: string
    /** The runner's name, or their bib when they've asked to be anonymous. */
    name: string
    /** What happened, like "Finished 10K" or "Turnaround · Half Marathon". */
    detail: string
    /** Their time: the ranked time for a finish, the clock time otherwise. */
    time: string
    /** When the read happened, in milliseconds since the epoch. */
    at: number
    /** Their results page. */
    link: string
}

/**
 * The most recent reads in a set of results, newest first. Each result is a runner's latest
 * read, so this is who most recently finished or passed a timing location. DNFs and DNSs,
 * and results without a usable read time, are left out.
 */
export function recentChanges(
    results: TimeResult[],
    slug: string,
    year: string,
    rankByChip: boolean,
    limit: number = RECENT_CHANGES,
): RecentChange[] {
    const reads: { result: TimeResult, at: number }[] = [];
    for (const result of results) {
        if (isDnfOrDns(result)) {
            continue;
        }
        const at = readTime(result.local_time);
        if (at !== null) {
            reads.push({ result, at });
        }
    }
    reads.sort((a, b) => b.at - a.at);
    return reads.slice(0, limit).map(({ result, at }) => {
        const chip = rankByChip && result.finish;
        const where = result.segment || result.location;
        return {
            key: `${result.person_id}|${result.distance}|${result.location}|${result.occurence}`,
            name: result.anonymous ? `Bib ${result.bib}` : `${result.first} ${result.last}`.trim() || `Bib ${result.bib}`,
            detail: result.finish
                ? `Finished ${result.distance}`.trim()
                : [where, result.distance].filter(part => part).join(' · '),
            time: FormatTime(
                chip ? result.chip_seconds : result.seconds,
                chip ? result.chip_milliseconds : result.milliseconds,
                result, false, true,
            ),
            at,
            link: `/results/${slug}/${year}/${result.bib}`,
        };
    });
}

/** How long ago something happened, like "just now", "45s ago", "12m ago" or "2h 5m ago". */
export function timeAgo(at: number, now: number = Date.now()): string {
    const seconds = Math.max(0, Math.floor((now - at) / 1000));
    if (seconds < 10) {
        return 'just now';
    }
    if (seconds < 60) {
        return `${seconds}s ago`;
    }
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
        return `${minutes}m ago`;
    }
    const hours = Math.floor(minutes / 60);
    return minutes % 60 > 0 ? `${hours}h ${minutes % 60}m ago` : `${hours}h ago`;
}
