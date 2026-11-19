import { TimeResult } from "../Interfaces/types";
import { freshKey } from "../loaders/freshResults";

/**
 * A results row's React key. A row that just changed gets a new key, so it's drawn afresh and
 * its tint fades in from the start, even when it changes again before the last fade ends.
 */
export function freshRowKey(result: TimeResult, fresh: ReadonlyMap<string, number> | undefined): string {
    const stamp = fresh?.get(freshKey(result));
    return stamp === undefined ? result.bib : `${result.bib}-${stamp}`;
}

/** The class that tints a results row that just changed, which fades away (see .result-new in style.css). */
export function freshRowClass(result: TimeResult, fresh: ReadonlyMap<string, number> | undefined): string | undefined {
    return fresh?.has(freshKey(result)) ? 'result-new' : undefined;
}
