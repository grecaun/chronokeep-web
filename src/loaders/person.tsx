import { Params } from "react-router-dom";
import { ErrorResponse, GetBibResultsResponse } from "../Interfaces/responses";
import { PersonState } from "../Interfaces/states";
import { useEffect, useState } from "react";

export function PersonLoader(params: Params<string>): PersonState {
    const [state, setState] = useState<PersonState>({
        page: 'person',
        status: 0,
        loading: true,
        error: false,
        distance: null,
        message: null,
        event: {
            name: '',
            slug: '',
            website: '',
            image: '',
            contact_email: '',
            access_restricted: false,
            type: '',
            recent_time: ''
        },
        year: {
            year: '',
            date_time: ''
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
        }
    });
    useEffect(() => {
        const fetchPerson = async () => {const BASE_URL = import.meta.env.VITE_CHRONOKEEP_API_URL;
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
                    state.status = response.status;
                    if (response.status !== 200) {
                        state.error = true;
                    }
                    return response.json();
                })
                .then(data => {
                    if (Object.prototype.hasOwnProperty.call(data, 'results')) {
                        const dta = data as GetBibResultsResponse
                        state.event = dta.event;
                        state.year = dta.year;
                        state.results = dta.results;
                        state.person = dta.person;
                    } else {
                        const err = data as ErrorResponse
                        state.error = true;
                        state.message = err.message;
                    }
                    state.loading = false;
                })
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                .catch(_ => {
                    state.error = true;
                });
            setState({
                ...state
            });
        };
        fetchPerson().catch(() => {});
    }, []);
    return state;
}