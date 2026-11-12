import { useEffect, useState } from "react";
import { CheckinPageState } from "../Interfaces/states";
import { userService } from "../Auth/_services/user.service";
import { ErrorResponse, ErrorWithStatus, GetCheckinParticipantsResponse } from "../Interfaces/responses";
import { Participant } from "../Interfaces/types";
import { Params } from "react-router-dom";

export function CheckinLoader(params: Params<string>, page: string): { state: CheckinPageState, setState: React.Dispatch<React.SetStateAction<CheckinPageState>> } {
    const [state, setState] = useState<CheckinPageState>({
        page: page,
        participants: [],
        status: 0,
        loading: true,
        error: false,
        message: null,
        event: null,
        year: null,
        search: "",
    });
    useEffect(() => {
        let cancelled = false;
        setState(prev => ({ ...prev, loading: true, error: false, message: null }));
        const fetchCheckin = async () => {
            const update: Partial<CheckinPageState> = {};
            await userService.getParticipants(params.slug!, params.year!).then(
                data => {
                    if (Object.prototype.hasOwnProperty.call(data.data, 'participants')) {
                        const dta = data.data as GetCheckinParticipantsResponse
                        const sortedParts = dta.participants.sort((a: Participant, b: Participant) => {
                            if (a.last !== b.last) {
                                return ('' + a.last).localeCompare(b.last)
                            }
                            return ('' + a.first).localeCompare(b.first)
                        })
                        update.participants = sortedParts;
                        update.event = dta.event
                        update.year = dta.year
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
                }
            );
            if (!cancelled) {
                setState(prev => ({ ...prev, ...update }));
            }
        };
        fetchCheckin().catch(() => {});
        return () => {
            cancelled = true;
        };
    }, [params.slug, params.year]);
    return { state, setState };
}