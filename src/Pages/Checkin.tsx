import { Navigate, useParams } from "react-router-dom";
import { CheckinLoader } from "../loaders/checkin";
import ErrorMsg from "../Parts/ErrorMsg";
import Loading from "../Parts/Loading";
import DateString from "../Parts/DateString";
import CheckinRow from "../Parts/CheckinRow";
import AddCheckin from "../Parts/AddCheckin";
import { Participant } from "../Interfaces/types";

function Checkin() {
    const params = useParams();
    const {state, setState} = CheckinLoader(params, 'checkin');

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        setState({
            ...state,
            search: e.target.value.trim().toLocaleLowerCase()
        })
    }

    const addParticipant = (p: Participant) => {
        const newParts = state.participants
        newParts.push(p)
        setState({
            ...state,
            participants: newParts.sort((a: Participant, b: Participant) => {
                            if (a.last !== b.last) {
                                return ('' + a.last).localeCompare(b.last)
                            }
                            return ('' + a.first).localeCompare(b.first)
                        })
        })
    }

    document.title = `Chronokeep - Check-in`    
    if (state.error === true && [401, 403].indexOf(state.status) !== -1) {
        return <Navigate to={'/login'} />
    }
    if (state.error === true) {
        document.title = `Chronokeep - Error`
        return (
            <ErrorMsg status={state.status} message={state.message} />
        );
    }
    if (state.loading === true) {
        return (
            <Loading />
        );
    }
    document.title = `Chronokeep - ${state.year!.year} ${state.event!.name} Check-in`
    const distances = new Set<string>();
    const participants = state.participants.filter((part, _index) => state.search.length < 1 || part.first.toLocaleLowerCase().indexOf(state.search) >=0 || part.last.toLocaleLowerCase().indexOf(state.search) >=0);
    for (let i=0; i<state.participants.length; i++) {
        distances.add(state.participants[i].distance)
    }
    return (
        <div>
            <div className="row container-lg lg-max-width mx-auto d-flex mt-4 mb-3 align-items-stretch">
                <div className="col-md-10 flex-fill text-center mx-auto m-1">
                    <p className="text-important mb-2 mt-1 h1">{`${state.year!.year} ${state.event!.name} Results`}</p>
                    <p className="text-important h4">{DateString(state.year!.date_time)}</p>
                </div>
            </div>
            { state.participants.length > 0 &&
            <div>
                <div className="row container-lg xs-max-width mx-auto d-flex align-items-stretch shadow-sm p-0 mb-3 border border-light">
                    <input type="text" className="input" id="searchBox" placeholder="Search" onChange={handleChange} />
                    <AddCheckin addParticipant={addParticipant} distances={distances} event={state.event!} year={state.year!} />
                </div>
                <div className="row container-lg md-max-width mx-auto d-flex align-items-stretch shadow-sm p-0 mb-3 border border-light">
                    <div className="p-0">
                        { participants.map(part => {
                            return (
                                <CheckinRow participant={part} distances={distances} event={state.event!} year={state.year!} key={part.id}/>
                            );
                        })}
                    </div>
                </div>
            </div>
            }
            { state.participants.length === 0 &&
            <div className="container-sm sm-max-width shadow-sm p-5 mb-3 border border-light">
                <div className="text-center">
                    <h2>No participants to check-in.</h2>
                </div>
            </div>
            }
        </div>
    );
}

export default Checkin;