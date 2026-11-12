import { Params } from "react-router-dom";
import { ErrorResponse, GetBibResultsResponse } from "../Interfaces/responses";
import { PersonState } from "../Interfaces/states";
import { useEffect, useState } from "react";

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
    useEffect(() => {
        let cancelled = false;
        setState(prev => ({ ...prev, loading: true, error: false, message: null }));
        const fetchPerson = async () => {
            const update: Partial<PersonState> = {};const BASE_URL = import.meta.env.VITE_CHRONOKEEP_API_URL;
            const requestOptions = {
                method: 'POST',
                body: JSON.stringify({ slug: params.slug, year: params.year, bib: params.bib }),
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
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                .catch(_ => {
                    update.error = true;
                });
            if (!cancelled) {
                setState(prev => ({ ...prev, ...update }));
            }
        };
        fetchPerson().catch(() => {});
        return () => {
            cancelled = true;
        };
    }, [params.slug, params.year, params.bib]);
    return state;
}