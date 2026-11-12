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
            const update: Partial<EventsState> = {};
            const BASE_URL = import.meta.env.VITE_CHRONOKEEP_API_URL;
            const requestOptions = {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + import.meta.env.VITE_CHRONOKEEP_ACCESS_TOKEN
                }
            }
            await fetch(BASE_URL + 'event/all', requestOptions)
                .then(response => {
                    update.status = response.status
                    if (response.status !== 200) {
                        update.error = true;
                    }
                    return response.json();
                })
                .then(data => {
                    if (Object.prototype.hasOwnProperty.call(data, 'events')) {
                        const dta = data as GetEventsResponse
                        update.events = dta.events
                    } else {
                        const err = data as ErrorResponse
                        update.error = true;
                        update.message = err.message;
                    }
                    update.loading = false;
                })
                .catch(error => {
                    update.error = true;
                    console.error("There was an error!", error);
                });
            setState(prev => ({ ...prev, ...update }));
        };
        fetchEvents().catch(() => {});
    }, []);
    return state;
}