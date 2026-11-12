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
            const update: Partial<AccountPageState> = {};
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
                        update.account = dta.account;
                        update.keys = sortedKeys;
                        update.events = dta.events ? dta.events : [];
                        update.linked = dta.linked ? dta.linked : [];
                    } else {
                        const err = data.data as ErrorResponse
                        update.error = true;
                        update.message = err.message;
                    }
                    update.status = data.status;
                    update.loading = false;
                },
                error => {
                    if (Object.prototype.hasOwnProperty.call(error, 'message')) {
                        const err = error as ErrorWithStatus
                        update.message = err.message;
                        update.status = err.status;
                    }
                    update.error = true;
                });
            setState(prev => ({ ...prev, ...update }));
        };
        fetchAccount().catch(() => {});
    }, [page]);
    return { state, setState };
}