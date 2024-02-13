import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../Parts/Header';
import Footer from '../Parts/Footer';
import Loading from '../Parts/Loading';
import ErrorMsg from '../Parts/ErrorMsg';

interface Event {
    name: string
    slug: string
    website: string
    image: string
    contact_email: string
    access_restricted: boolean
    type: string
    recent_time: string
}

interface EventState {
    status: number
    loading: boolean
    error: boolean
    events: Event[]
    message: string | null
}

const useEvents = (): EventState => {
    const [state, setState] = useState<EventState>({
        status: 0,
        loading: true,
        error: false,
        events: [],
        message: null
    });

    useEffect(() => {
        const fetchEvents = async () => {
            const BASE_URL = import.meta.env.VITE_CHRONOKEEP_API_URL;
            const requestOptions = {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + import.meta.env.VITE_CHRONOKEEP_ACCESS_TOKEN
                }
            }
            try {
                var response = await fetch(BASE_URL + 'event/all', requestOptions);
                var data = await response.json();
                if (response.status === 200) {
                    setState(
                    {
                        error: false,
                        status: response.status,
                        loading: false,
                        message: null,
                        events: data.events
                    });
                } else {
                    setState({
                        error: true,
                        status: response.status,
                        loading: false,
                        message: data.message,
                        events: []
                    });
                }
            } catch(e) {
                var msg: string = "unknown error";
                if (typeof e === 'string') {
                    msg = e;
                } else if (e instanceof Error) {
                    msg = e.message;
                }
                setState({
                    error: true,
                    status: 500,
                    loading: false,
                    message: msg,
                    events: []
                });
                console.error("There was an error!", msg)
            }
        };

        fetchEvents();
    }, []);

    return state;
}

export default function Events() {
    const { status, loading, error, events, message } = useEvents();

    document.title = `Chronokeep - Events`
    if (error === true) {
        document.title = `Chronokeep - Error`
        return (
            <div>
                <Header page={"events"} />
                <ErrorMsg status={status} message={message} />
                <Footer />
            </div>
        )
    }
    if (loading === true) {
        return (
            <div>
                <Header page={"events"} />
                <div className="mx-auto sm-max-width text-center container-md border border-light p-5 pt-4">
                    <h1 className="text-important display-5">Loading Events</h1>
                    <Loading />
                </div>
                <Footer />
            </div>
        );
    }
    const sorted = events.sort((a, b) => {
        return Date.parse(b.recent_time) - Date.parse(a.recent_time)
    })
    if (events && events.length > 0) {
        return (
            <div>
                <Header page={"events"} />
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
                <Footer />
            </div>
        );
    } else {
        return (
            <div>
                <Header page={"events"} />
                <div className="container-lg lg-max-width shadow">
                    <h2 className="text-important text-primary">No events found.</h2>
                </div>
                <Footer />
            </div>
        )
    }
}