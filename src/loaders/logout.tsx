import { useEffect, useState } from "react";
import { authenticationService } from "../Auth/_services/authentication.service";
import { ErrorWithStatus } from "../Interfaces/responses";
import { BaseState } from "../Interfaces/states";

export function LogoutLoader(page: string): BaseState {
    const [state, setState] = useState<BaseState>({
        page: page,
        status: 0,
        loading: true,
        error: false,
        message: null
    });
    useEffect(() => {
        const doLogout = async () => {
            await authenticationService.logout(page === 'account' ? "API" : "REMOTE")
                .then(response => {
                    state.loading = false;
                    state.status = response.status;
                    if (response.status !== 200) {
                        return response.json();
                    }
                    return null;
                })
                .then(data => {
                    state.loading = false;
                    if (data !== null && Object.prototype.hasOwnProperty.call(data, 'status')) {
                        const err = data as ErrorWithStatus
                        // 401 Unauthorized means the token is not valid, 403 might mean the same
                        // don't log an issue if either is returned, but do so if something else is
                        if (err.status !== 401 && err.status !== 403) {
                            state.message = err.message;
                            console.error("Unknown error logging out: ", err.message)
                        }
                    }
                })
                .catch(error => {
                    state.loading = false;
                    if (error !== null && Object.prototype.hasOwnProperty.call(error, 'status')) {
                        const err = error as ErrorWithStatus
                        // 401 Unauthorized means the token is not valid, 403 might mean the same
                        // don't log an issue if either is returned, but do so if something else is
                        if (err.status !== 401 && err.status !== 403) {
                            state.message = err.message;
                            console.error("Caught error logging out: ", err.message)
                        }
                    }
                });
            setState({
                ...state
            });
        };
        doLogout().catch(() => {});
    }, [])
    return state;
}