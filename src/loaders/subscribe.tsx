import { useEffect, useState } from "react";
import { SubscriptionState } from "../Interfaces/states";
import { Params } from "react-router-dom";
import { ErrorResponse } from "../Interfaces/responses";

export function SubscribeLoader(params: Params<string>): SubscriptionState {
    const [state, setState] = useState<SubscriptionState>({
        page: 'subscribe',
        status: 0,
        loading: true,
        error: false,
        message: null,
        email: params.email !== undefined ? params.email : "",
        success: false
    })
    useEffect(() => {
        let cancelled = false;
        setState(prev => ({ ...prev, loading: true, error: false, message: null }));
        const fetchSubscribe = async () => {
            const update: Partial<SubscriptionState> = {};
            const BASE_URL = import.meta.env.VITE_CHRONOKEEP_API_URL;
            const requestOptions = {
                method: 'POST',
                body: JSON.stringify({ email: params.email }),
                headers: {
                    "Content-Type": "application/json"
                }
            }
            await fetch(BASE_URL + 'blocked/emails/unblock', requestOptions)
            .then(response => {
                update.status = response.status;
                if (response.status !== 200) {
                    update.error = true;
                    return response.json();
                } else {
                    update.success = true;
                    return "";
                }
            })
            .then(data => {
                if (update.status !== 200) {
                    const err = data as ErrorResponse
                    update.error = true;
                    update.message = err.message;
                }
                update.loading = false;
            })
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            .catch(_ => {
                update.error = true;
            });
        if (!cancelled) {
                setState(prev => ({ ...prev, ...update }));
            }
    };
    fetchSubscribe().catch(() => {});
    return () => {
        cancelled = true;
    };
}, [params.email]);
return state;
}