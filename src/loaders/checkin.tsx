import { useEffect, useState } from "react";
import { CheckinPageState } from "../Interfaces/states";
import { userService } from "../Auth/_services/user.service";
import { ErrorResponse, ErrorWithStatus, GetCheckinParticipantsResponse } from "../Interfaces/responses";
import { Participant } from "../Interfaces/types";

export function CheckinLoader(page: string): { state: CheckinPageState, setState: React.Dispatch<React.SetStateAction<CheckinPageState>> } {
    const [state, setState] = useState<CheckinPageState>({
        page: page,
        participants: [],
        status: 0,
        loading: true,
        error: false,
        message: null,
    });
    useEffect(() => {
        const fetchCheckin = async () => {
            await userService.getParticipants().then(
                data => {
                    if (Object.prototype.hasOwnProperty.call(data.data, 'participants')) {
                        const dta = data.data as GetCheckinParticipantsResponse
                        const sortedParts = dta.participants.sort((a: Participant, b: Participant) => {
                            if (a.last !== b.last) {
                                return ('' + b.last).localeCompare(a.last)
                            }
                            return ('' + b.first).localeCompare(a.first)
                        })
                        state.participants = sortedParts;
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
                }
            );
            setState({
                ...state
            });
        };
        fetchCheckin().catch(() => {});
    }, []);
    return { state, setState };
}