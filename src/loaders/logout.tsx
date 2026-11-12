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
            const update: Partial<BaseState> = {};
            await authenticationService.logout(page === 'account' ? "API" : "REMOTE")
                .then(response => {
                    update.loading = false;
                    update.status = response.status;
                    if (response.status !== 200) {
                        return response.json();
                    }
                    return null;
                })
                .then(data => {
                    update.loading = false;
                    if (data !== null && Object.prototype.hasOwnProperty.call(data, 'status')) {
                        const err = data as ErrorWithStatus
                        // 401 Unauthorized means the token is not valid, 403 might mean the same
                        // don't log an issue if either is returned, but do so if something else is
                        if (err.status !== 401 && err.status !== 403) {
                            update.message = err.message;
                            console.error("Unknown error logging out: ", err.message)
                        }
                    }
                })
                .catch(error => {
                    update.loading = false;
                    if (error !== null && Object.prototype.hasOwnProperty.call(error, 'status')) {
                        const err = error as ErrorWithStatus
                        // 401 Unauthorized means the token is not valid, 403 might mean the same
                        // don't log an issue if either is returned, but do so if something else is
                        if (err.status !== 401 && err.status !== 403) {
                            update.message = err.message;
                            console.error("Caught error logging out: ", err.message)
                        }
                    }
                });
            setState(prev => ({ ...prev, ...update }));
        };
        doLogout().catch(() => {});
    }, [page])
    return state;
}