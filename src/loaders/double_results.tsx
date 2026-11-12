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
        let cancelled = false;
        setState(prev => ({ ...prev, loading: true, error: false, message: null }));
        const fetchResults = async () => {
            const update: Partial<DoubleResultsState> = {};
            let selected_year = null as DoubleYear | null;
            const results: DoubleResultsState['results'] = {};
            await fetch(`https://downloads.chronokeep.com/double/${params.slug}.json`)
                .then(response => {
                    if (response.status !== 200) {
                        update.error = true
                        update.message = 'No information file found.'
                        return null;
                    }
                    return response.json();
                })
                .then(data => {
                    if (data !== null) {
                        const years = data as DoubleYear[]
                        update.years = years
                        for (const year of years) {
                            if ((params.year !== undefined && params.year === year.display_year.toString())
                                || (params.year === undefined && (selected_year === null || selected_year.display_year < year.display_year))) {
                                selected_year = year;
                            }
                        }
                    } else {
                        update.status = 404
                        update.error = true
                        update.message = "Not Found"
                    }
                })
                .catch(error => {
                    update.error = true
                    console.error("There was an error!", error)
                });
            if (selected_year !== null) {
                const BASE_URL = import.meta.env.VITE_CHRONOKEEP_API_URL;
                for (let i=0; i<2; i++) {
                    const slug = selected_year.double[i].slug;
                    const year = selected_year.double[i].year;
                    const distance = selected_year.double[i].distance;
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
                            if (Object.prototype.hasOwnProperty.call(data, 'event')) {
                                const dta = data as GetResultsResponse
                                if (distance.length > 0) {
                                    if (dta.results[distance]) {
                                        results[distance] = dta.results[distance];
                                    }
                                } else {
                                    Object.keys(dta.results).forEach((key) => {
                                        results[key] = dta.results[key];
                                    });
                                }
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
                }
            } else {
                update.status = 404
                update.error = true
                update.message = "Not Found"
            }
            update.selected_year = selected_year;
            update.results = results;
            if (!cancelled) {
                setState(prev => ({ ...prev, ...update }));
            }
        };
        fetchResults().catch(() => {});
        return () => {
            cancelled = true;
        };
    }, [params.slug, params.year]);
    return { state, setState };
}