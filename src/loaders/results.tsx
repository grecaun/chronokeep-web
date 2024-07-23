import { Params } from "react-router-dom";
import { ResultsState } from "../Interfaces/states";
import { ErrorResponse, GetResultsResponse } from "../Interfaces/responses";
import { useEffect, useState } from "react";

export function ResultsLoader(params: Params<string>, page: string): { state: ResultsState, setState: React.Dispatch<React.SetStateAction<ResultsState>> } {
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
    });
    useEffect(() => {
        const fetchResults = async () => {
            const BASE_URL = import.meta.env.VITE_CHRONOKEEP_API_URL;
            const requestOptions = {
                method: 'POST',
                body: JSON.stringify({ slug: params.slug, year: params.year }),
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + import.meta.env.VITE_CHRONOKEEP_ACCESS_TOKEN
                }
            }
            await fetch(BASE_URL + 'results', requestOptions)
                .then(response => {
                    state.status = response.status;
                    if (response.status !== 200) {
                        state.error = true;
                    }
                    return response.json();
                })
                .then(data => {
                    if (Object.prototype.hasOwnProperty.call(data, 'count')) {
                        const dta = data as GetResultsResponse
                        state.count = dta.count
                        state.event = dta.event
                        state.years = dta.years
                        state.results = dta.results
                        state.year = dta.event_year
                        state.participants = dta.participants
                    } else {
                        const err = data as ErrorResponse
                        state.error = true
                        state.message = err.message
                    }
                    state.loading = false
                })
                .catch(error => {
                    state.error = true
                    console.error("There was an error!", error)
                });
            setState({
                ...state
            });
        };
        fetchResults().catch(() => {});
    }, []);
    return { state, setState };
}