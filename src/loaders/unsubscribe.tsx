import { useEffect, useState } from "react";
import { SubscriptionState } from "../Interfaces/states";
import { Params } from "react-router-dom";
import { ErrorResponse } from "../Interfaces/responses";

export function UnsubscribeLoader(params: Params<string>): SubscriptionState {
    const [state, setState] = useState<SubscriptionState>({
        page: 'unsubscribe',
        status: 0,
        loading: true,
        error: false,
        message: null,
        email: params.email !== undefined ? params.email : "",
        success: false
    })
    useEffect(() => {
        const fetchUnsubscribe = async () => {
            const BASE_URL = import.meta.env.VITE_CHRONOKEEP_API_URL;
            const requestOptions = {
                method: 'POST',
                body: JSON.stringify({ email: params.email }),
                headers: {
                    "Content-Type": "application/json"
                }
            }
            await fetch(BASE_URL + 'blocked/emails/add', requestOptions)
            .then(response => {
                state.status = response.status;
                if (response.status !== 200) {
                    state.error = true;
                    return response.json();
                } else {
                    state.success = true;
                    return "";
                }
            })
            .then(data => {
                if (state.status !== 200) {
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
    fetchUnsubscribe().catch(() => {});
}, []);
return state;
}