import { Params } from "react-router-dom";
import { MultiResultsState } from "../Interfaces/states";
import { ErrorResponse, GetMultiResultsResponse } from "../Interfaces/responses";
import { useEffect, useState } from "react";
import { SeriesYear } from "../Interfaces/types";

export function MultiResultsLoader(params: Params<string>, page: string): { state: MultiResultsState, setState: React.Dispatch<React.SetStateAction<MultiResultsState>> } {
    const [state, setState] = useState<MultiResultsState>({
        page: page,
        event: null,
        results: {},
        status: 0,
        loading: true,
        error: false,
        message: null,
        years: null,
        selected_year: null,
    });
    useEffect(() => {
        const fetchResults = async () => {
            await fetch(`https://downloads.chronokeep.com/series/${params.slug}.js`)
                .then(response => {
                    if (response.status !== 200) {
                        state.error = true
                        state.message = 'No information file found.'
                        return null;
                    }
                    return response.json();
                })
                .then(data => {
                    if (data !== null) {
                        const years = data as SeriesYear[]
                        state.years = years
                        for (const year of state.years) {
                            if ((params.year !== undefined && params.year === year.display_year.toString())
                                || (params.year === undefined && (state.selected_year === null || state.selected_year.display_year < year.display_year))) {
                                state.selected_year = year;
                            }
                        }
                    } else {
                        state.status = 404
                        state.error = true
                        state.message = "Not Found"
                    }
                })
                .catch(error => {
                    state.error = true
                    console.error("There was an error!", error)
                });
            if (state.selected_year !== null) {
                const BASE_URL = import.meta.env.VITE_CHRONOKEEP_API_URL;
                const years: { [index: string]: boolean } = {}
                for (const series of state.selected_year.series) {
                    for (const dist of series.distances) {
                        years[dist.year] = true;
                    }
                }
                const yearStrings = Object.keys(years)
                const requestOptions = {
                    method: 'POST',
                    body: JSON.stringify({ slug: params.slug, years: yearStrings }),
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + import.meta.env.VITE_CHRONOKEEP_ACCESS_TOKEN
                    }
                }
                await fetch(BASE_URL + 'results/multi', requestOptions)
                    .then(response => {
                        state.status = response.status;
                        if (response.status !== 200) {
                            state.error = true;
                        }
                        return response.json();
                    })
                    .then(data => {
                        if (Object.prototype.hasOwnProperty.call(data, 'event')) {
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
            } else {
                state.status = 404
                state.error = true
                state.message = "Not Found"
            }
            setState({
                ...state
            });
        };
        fetchResults().catch(() => {});
    }, []);
    return { state, setState };
}