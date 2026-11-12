import { Params } from "react-router-dom";
import { ResultsState } from "../Interfaces/states";
import { ErrorResponse, GetResultsResponse } from "../Interfaces/responses";
import { useEffect, useRef, useState } from "react";
import { RankingType } from "../Interfaces/types";
import { isToday, useLiveUpdates } from "./live";

/** Fetches an event year's results, returning the parts of the page state they fill in. */
async function fetchResults(slug: string | undefined, year: string | undefined): Promise<Partial<ResultsState>> {
    const update: Partial<ResultsState> = {};
    const BASE_URL = import.meta.env.VITE_CHRONOKEEP_API_URL;
    const requestOptions = {
        method: 'POST',
        body: JSON.stringify({ slug: slug, year: year }),
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + import.meta.env.VITE_CHRONOKEEP_ACCESS_TOKEN
        }
    }
    await fetch(BASE_URL + 'results', requestOptions)
        .then(response => {
            update.status = response.status;
            if (response.status !== 200) {
                update.error = true;
            }
            return response.json();
        })
        .then(data => {
            if (Object.prototype.hasOwnProperty.call(data, 'count')) {
                const dta = data as GetResultsResponse
                update.count = dta.count
                update.event = dta.event
                update.years = dta.years
                update.results = dta.results
                update.year = dta.event_year
                update.participants = dta.participants.filter(i => i.first.length + i.last.length > 0)
                update.default_ranking_type = RankingType.Gun
                if (dta.event_year.ranking_type === "chip") {
                    update.default_ranking_type = RankingType.Chip
                } else if (dta.event_year.ranking_type === "mixed") {
                    update.default_ranking_type = RankingType.Mixed
                }
                update.distances = dta.distances
            } else {
                const err = data as ErrorResponse
                update.error = true
                update.message = err.message
            }
            update.loading = false
        })
        .catch(error => {
            update.error = true
            console.error("There was an error!", error)
        });
    return update;
}

/**
 * Loads an event year's results. While the event year is live, or it's the event's day,
 * the results are fetched again whenever the API says they changed, unless `watchLive`
 * is false.
 */
export function ResultsLoader(params: Params<string>, page: string, watchLive = true): { state: ResultsState, setState: React.Dispatch<React.SetStateAction<ResultsState>> } {
    const [state, setState] = useState<ResultsState>({
        page: page,
        count: 0,
        event: null,
        years: [],
        year: null,
        results: {},
        status: 0,
        loading: true,
        error: false,
        message: null,
        search: "",
        sort_by: 0,
        selected: { value: 0, label: "Sort by Ranking" },
        show_sms_modal: false,
        participants: [],
        subscription: null,
        show_sms_error_modal: false,
        subscription_success: false,
        unsubscribe_success: false,
        unsubscribe_error: false,
        rank_by_selected: false,
        default_ranking_type: RankingType.Gun,
        distances: null,
    });
    // Counts fetches so only the newest one's results are used.
    const latestFetch = useRef(0);
    useEffect(() => {
        let cancelled = false;
        // also makes any background refresh still running for the old slug or year stale
        const fetchId = ++latestFetch.current;
        setState(prev => ({ ...prev, loading: true, error: false, message: null }));
        fetchResults(params.slug, params.year).then(update => {
            if (!cancelled && fetchId === latestFetch.current) {
                setState(prev => ({ ...prev, ...update }));
            }
        }).catch(() => {});
        return () => {
            cancelled = true;
        };
    }, [params.slug, params.year]);

    // Fetch again in the background when the results change. Only the results are
    // replaced, so the page keeps its search, sort, and other choices, and a failed
    // fetch leaves the results already on screen.
    const refresh = () => {
        const fetchId = ++latestFetch.current;
        fetchResults(params.slug, params.year).then(update => {
            if (fetchId === latestFetch.current && !update.error) {
                setState(prev => ({ ...prev, ...update }));
            }
        }).catch(() => {});
    };
    const live = watchLive && !state.loading && !state.error && state.year !== null
        && (state.year.live || isToday(state.year.date_time));
    useLiveUpdates(params.slug, state.year?.year, live, refresh);
    return { state, setState };
}
