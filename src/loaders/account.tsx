import { useEffect, useState } from "react";
import { userService } from "../Auth/_services/user.service";
import { ErrorResponse, ErrorWithStatus, GetAccountResponse } from "../Interfaces/responses";
import { AccountPageState } from "../Interfaces/states";
import { Key } from "../Interfaces/types";

export function AccountLoader(page: string): { state: AccountPageState, setState: React.Dispatch<React.SetStateAction<AccountPageState>> } {
    const [state, setState] = useState<AccountPageState>({
        page: page,
        keys: [],
        account: {
            email: '',
            name: '',
            type: ''
        },
        events: [],
        linked: [],
        show: false,
        deleteKey: null,
        childKey: null,
        status: 0,
        loading: true,
        error: false,
        message: null,
    });
    useEffect(() => {
        const fetchAccount = async () => {
            await userService.getAccountInfo(page === "account" ? "API" : "REMOTE").then(
                data => {
                    if (Object.prototype.hasOwnProperty.call(data.data, 'account')) {
                        const dta = data.data as GetAccountResponse
                        const sortedKeys = dta.keys ? dta.keys.sort((a: Key, b: Key) => {
                            if (a.name !== b.name) {
                                return ('' + b.name).localeCompare(a.name)
                            }
                            return ('' + a.value).localeCompare(b.value)
                        }) : [];
                        state.account = dta.account;
                        state.keys = sortedKeys;
                        state.events = dta.events ? dta.events : [];
                        state.linked = dta.linked ? dta.linked : [];
                    } else {
                        const err = data.data as ErrorResponse
                        state.error = true;
                        state.message = err.message;
                    }
                    state.status = data.status;
                    state.loading = false;
                },
                error => {
                    if (Object.prototype.hasOwnProperty.call(error, 'message')) {
                        const err = error as ErrorWithStatus
                        state.message = err.message;
                        state.status = err.status;
                    }
                    state.error = true;
                });
            setState({
                ...state
            });
        };
        fetchAccount().catch(() => {});
    }, []);
    return { state, setState };
}