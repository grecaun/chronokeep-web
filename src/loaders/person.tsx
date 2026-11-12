import { Params } from "react-router-dom";
import { ErrorResponse, GetBibResultsResponse } from "../Interfaces/responses";
import { PersonState } from "../Interfaces/states";
import { useEffect, useRef, useState } from "react";
import { isToday, useLiveUpdates } from "./live";

/** Fetches one person's results, returning the parts of the page state they fill in. */
async function fetchPerson(slug: string | undefined, year: string | undefined, bib: string | undefined): Promise<Partial<PersonState>> {
    const update: Partial<PersonState> = {};
    const BASE_URL = import.meta.env.VITE_CHRONOKEEP_API_URL;
    const requestOptions = {
        method: 'POST',
        body: JSON.stringify({ slug: slug, year: year, bib: bib }),
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + import.meta.env.VITE_CHRONOKEEP_ACCESS_TOKEN
        }
    }
    await fetch(BASE_URL + 'results/bib', requestOptions)
        .then(response => {
            update.status = response.status;
            if (response.status !== 200) {
                update.error = true;
            }
            return response.json();
        })
        .then(data => {
            if (Object.prototype.hasOwnProperty.call(data, 'results')) {
                const dta = data as GetBibResultsResponse
                update.event = dta.event;
                update.year = dta.year;
                update.results = dta.results;
                update.person = dta.person;
                update.single_distance = dta.single_distance;
                update.segments = dta.segments;
                update.cert_distance = dta.distance;
            } else {
                const err = data as ErrorResponse
                update.error = true;
                update.message = err.message;
            }
            update.loading = false;
        })
        .catch(() => {
            update.error = true;
        });
    return update;
}

export function PersonLoader(params: Params<string>): PersonState {
    const [state, setState] = useState<PersonState>({
        page: params.page === undefined ? 'results' : params.page,
        status: 0,
        loading: true,
        error: false,
        distance: null,
        message: null,
        event: {
            name: '',
            cert_name: '',
            slug: '',
            website: '',
            image: '',
            contact_email: '',
            access_restricted: false,
            type: '',
            recent_time: '',
        },
        year: {
            year: '',
            date_time: '',
            live: false,
            days_allowed: 1,
            ranking_type: "gun"
        },
        results: [],
        person: {
            bib: '',
            first: '',
            last: '',
            gender: '',
            anonymous: false,
            distance: '',
            age: 0
        },
        single_distance: false,
        segments: [],
        cert_distance: null,
    });
    // Counts fetches so only the newest one's results are used.
    const latestFetch = useRef(0);
    useEffect(() => {
        let cancelled = false;
        // also makes any background refresh still running for the old person stale
        const fetchId = ++latestFetch.current;
        setState(prev => ({ ...prev, loading: true, error: false, message: null }));
        fetchPerson(params.slug, params.year, params.bib).then(update => {
            if (!cancelled && fetchId === latestFetch.current) {
                setState(prev => ({ ...prev, ...update }));
            }
        }).catch(() => {});
        return () => {
            cancelled = true;
        };
    }, [params.slug, params.year, params.bib]);

    // While the event is live, fetch this person's results again when they change,
    // keeping what's on screen if a background fetch fails.
    const refresh = () => {
        const fetchId = ++latestFetch.current;
        fetchPerson(params.slug, params.year, params.bib).then(update => {
            if (fetchId === latestFetch.current && !update.error) {
                setState(prev => ({ ...prev, ...update }));
            }
        }).catch(() => {});
    };
    const live = !state.loading && !state.error && (state.year.live || isToday(state.year.date_time));
    useLiveUpdates(params.slug, state.year.year || params.year, live, refresh);
    return state;
}