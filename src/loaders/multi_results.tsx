import { Params } from "react-router-dom";
import { MultiResultsState } from "../Interfaces/states";
import { ErrorResponse, GetMultiResultsResponse } from "../Interfaces/responses";
import { useEffect, useState } from "react";

export function MultiResultsLoader(params: Params<string>, page: string): { state: MultiResultsState, setState: React.Dispatch<React.SetStateAction<MultiResultsState>> } {
    const [state, setState] = useState<MultiResultsState>({
        page: page,
        event: null,
        results: {},
        status: 0,
        loading: true,
        error: false,
        message: null,
    });
    useEffect(() => {
        const fetchResults = async () => {
            const BASE_URL = import.meta.env.VITE_CHRONOKEEP_API_URL;
            const requestOptions = {
                method: 'POST',
                body: JSON.stringify({ slug: params.slug, years: [
                    "2021",
                    ""
                ] }),
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
                        const dta = data as GetMultiResultsResponse
                        state.event = dta.event
                        state.results = dta.results
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