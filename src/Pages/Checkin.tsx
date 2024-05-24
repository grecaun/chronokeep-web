import { userService } from "../Auth/_services/user.service";
import { CheckinPageState } from "../Interfaces/states";
import { Participant } from "../Interfaces/types";

function updateParticipant(participant: Participant, state: CheckinPageState, setState: React.Dispatch<React.SetStateAction<CheckinPageState>>) {
    userService.updateParticipant(participant)
        .then(
            () => {
                const newParts = state.participants.filter((part, _) => part.alternate_id !== participant.alternate_id)
                newParts.push(participant)
                setState({
                    ...state,
                    participants: newParts
                })
            }
        )
}

function Checkin(props: PageProps) {
    const {state, setState} = AccountLoader(props.page);
}