import { Component } from 'react';
import { Link } from 'react-router-dom';
import Header from '../Parts/Header';
import Footer from '../Parts/Footer';
import Loading from '../Parts/Loading';
import ErrorMsg from '../Parts/ErrorMsg';
import { EmptyProps } from '../Interfaces/props';
import { EventsState } from '../Interfaces/states';
import { Event } from '../Interfaces/types';
import { ErrorResponse, GetEventsResponse } from '../Interfaces/responses';

class Events extends Component<EmptyProps, EventsState> {
    state: EventsState = {
        status: 0,
        loading: true,
        error: false,
        events: [],
        message: null
    }
    
    componentDidMount() {
        const BASE_URL = import.meta.env.VITE_CHRONOKEEP_API_URL;
        const requestOptions = {
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + import.meta.env.VITE_CHRONOKEEP_ACCESS_TOKEN
            }
        }
        fetch(BASE_URL + 'event/all', requestOptions)
        .then(response => {
            if (response.status === 200) {
                this.setState({
                    status: response.status
                });
            } else {
                this.setState({
                    error: true,
                    status: response.status
                });
            }
            return response.json();
        })
        .then(data => {
            if (Object.prototype.hasOwnProperty.call(data, 'events')) {
                const dta = data as GetEventsResponse
                this.setState({
                    loading: false,
                    events: dta.events
                });
            } else {
                const err = data as ErrorResponse
                this.setState({
                    error: true,
                    message: err.message
                })
            }
        })
        .catch(error => {
            this.setState({
                error: true
            });
            console.error("There was an error!", error)
        })
    }
        
        render() {
            const { status, loading, error, events, message } = this.state;
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
            const sorted = events.sort((a: Event, b: Event) => Date.parse(b.recent_time) - Date.parse(a.recent_time))
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
}

export default Events;