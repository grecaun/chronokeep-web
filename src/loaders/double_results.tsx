import { Params } from "react-router-dom";
import { DoubleResultsState } from "../Interfaces/states";
import { ErrorResponse, GetResultsResponse } from "../Interfaces/responses";
import { useEffect, useState } from "react";
import { DoubleYear } from "../Interfaces/types";

export function DoubleResultsLoader(params: Params<string>, page: string): { state: DoubleResultsState, setState: React.Dispatch<React.SetStateAction<DoubleResultsState>> } {
    const [state, setState] = useState<DoubleResultsState>({
        page: page,
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
            await fetch(`https://downloads.chronokeep.com/double/${params.slug}.json`)
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
                        const years = data as DoubleYear[]
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
                for (let i=0; i<2; i++) {
                    const slug = state.selected_year.double[i].slug;
                    const year = state.selected_year.double[i].year;
                    console.log(`slug ${slug} year ${year}`);
                    const distance = state.selected_year.double[i].distance;
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
                            state.status = response.status;
                            if (response.status !== 200) {
                                state.error = true;
                            }
                            return response.json();
                        })
                        .then(data => {
                            if (Object.prototype.hasOwnProperty.call(data, 'event')) {
                                const dta = data as GetResultsResponse
                                if (dta.results[distance] !== null && dta.results[distance] !== undefined) {
                                    state.results[distance] = dta.results[distance];
                                }
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
                }
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