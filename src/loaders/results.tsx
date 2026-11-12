import { Params } from "react-router-dom";
import { ResultsState } from "../Interfaces/states";
import { ErrorResponse, GetResultsResponse } from "../Interfaces/responses";
import { useEffect, useState } from "react";
import { RankingType } from "../Interfaces/types";

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
        subscription: null,
        show_sms_error_modal: false,
        subscription_success: false,
        unsubscribe_success: false,
        unsubscribe_error: false,
        rank_by_selected: false,
        default_ranking_type: RankingType.Gun,
        distances: null,
    });
    useEffect(() => {
        let cancelled = false;
        setState(prev => ({ ...prev, loading: true, error: false, message: null }));
        const fetchResults = async () => {
            const update: Partial<ResultsState> = {};
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