import { useEffect, useState } from "react";
import { ErrorResponse, GetEventsResponse } from "../Interfaces/responses";
import { EventsState } from "../Interfaces/states";

export function EventsLoader(): EventsState {
    const [state, setState] = useState<EventsState>({
        page: 'events',
        status: 0,
        loading: true,
        error: false,
        events: [],
        message: null
    });
    useEffect(() => {
        const fetchEvents = async () => {
            const BASE_URL = import.meta.env.VITE_CHRONOKEEP_API_URL;
            const requestOptions = {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + import.meta.env.VITE_CHRONOKEEP_ACCESS_TOKEN
                }
            }
            await fetch(BASE_URL + 'event/all', requestOptions)
                .then(response => {
                    state.status = response.status
                    if (response.status !== 200) {
                        state.error = true;
                    }
                    return response.json();
                })
                .then(data => {
                    if (Object.prototype.hasOwnProperty.call(data, 'events')) {
                        const dta = data as GetEventsResponse
                        state.events = dta.events
                    } else {
                        const err = data as ErrorResponse
                        state.error = true,
                        state.message = err.message
                    }
                    state.loading = false;
                })
                .catch(error => {
                    state.error = true;
                    console.error("There was an error!", error);
                });
            setState({
                ...state
            });
        };
        fetchEvents().catch(() => {});
    });
    return state;
}