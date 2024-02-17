import { Link } from 'react-router-dom';
import Loading from '../Parts/Loading';
import ErrorMsg from '../Parts/ErrorMsg';
import { Event } from '../Interfaces/types';
import { EventsLoader } from '../loaders/events';

function Events() {
    const state = EventsLoader();
    document.title = `Chronokeep - Events`
    if (state.error === true) {
        document.title = `Chronokeep - Error`
        return (
            <ErrorMsg status={state.status} message={state.message} />
        )
    }
    if (state.loading === true) {
        return (
            <Loading />
        );
    }
    const sorted = state.events.sort((a: Event, b: Event) => Date.parse(b.recent_time) - Date.parse(a.recent_time))
    if (state.events && state.events.length > 0) {
        return (
            <div className="mx-auto sm-max-width text-center container-md border border-light p-5 pt-4">
                <h1 className="text-important display-4">Events</h1>
                <div className="list-group justify-content-center flex-column mt-4">
                    { sorted.map( (ev, index) => {
                        return (
                            <Link className="list-group-item list-group-item-action text-important" to={`/results/${ev.slug}`} key={`event${index}`}>{ ev.name }</Link>
                        )
                    }) }
                </div>
            </div>
        );
    } else {
        return (
            <div className="container-lg lg-max-width shadow">
                <h2 className="text-important text-primary">No events found.</h2>
            </div>
        )
    }
}

export default Events;