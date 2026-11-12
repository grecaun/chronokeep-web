import { Params } from "react-router-dom";
import { SeriesResultsState } from "../Interfaces/states";
import { ErrorResponse, GetMultiResultsResponse } from "../Interfaces/responses";
import { useEffect, useState } from "react";
import { SeriesYear } from "../Interfaces/types";

export function MultiResultsLoader(params: Params<string>, page: string): { state: SeriesResultsState, setState: React.Dispatch<React.SetStateAction<SeriesResultsState>> } {
    const [state, setState] = useState<SeriesResultsState>({
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
        let cancelled = false;
        setState(prev => ({ ...prev, loading: true, error: false, message: null }));
        const fetchResults = async () => {
            const update: Partial<SeriesResultsState> = {};
            let selected_year = null as SeriesYear | null;
            await fetch(`https://downloads.chronokeep.com/series/${params.slug}.js`)
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
                        const years = data as SeriesYear[]
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
                const years: { [index: string]: boolean } = {}
                for (const series of selected_year.series) {
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
                        update.status = response.status;
                        if (response.status !== 200) {
                            update.error = true;
                        }
                        return response.json();
                    })
                    .then(data => {
                        if (Object.prototype.hasOwnProperty.call(data, 'event')) {
                            const dta = data as GetMultiResultsResponse
                            update.event = dta.event
                            update.results = dta.results
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
            } else {
                update.status = 404
                update.error = true
                update.message = "Not Found"
            }
            update.selected_year = selected_year;
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