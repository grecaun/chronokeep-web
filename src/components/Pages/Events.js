import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Header from '../Parts/Header';
import Footer from '../Parts/Footer';
import Loading from '../Parts/Loading';
import ErrorMsg from '../Parts/ErrorMsg';

class Events extends Component {
        constructor(props) {
            super(props);
            this.state = {
                loading: true,
                error: false,
                events: [],
                found: null
            }
        }
    
        componentDidMount() {
            const BASE_URL = process.env.REACT_APP_CHRONOKEEP_API_URL;
            const requestOptions = {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + process.env.REACT_APP_CHRONOKEEP_ACCESS_TOKEN
                }
            }
            fetch(BASE_URL + 'event/all', requestOptions)
            .then(response => {
                if (response.status === 200) {
                    this.setState({
                        status: response.status,
                        response: true,
                    });
                } else {
                    this.setState({
                        error: true,
                        status: response.status,
                        response: true,
                    });
                }
                return response.json();
            })
            .then(data => {
                this.setState({
                    loading: false,
                    found: data,
                    events: data.events
                });
            })
            .catch(error => {
                this.setState({
                    error: true,
                    errorMessage: error.toString()
                });
                console.error("There was an error!", error)
            })
        }
        
        render() {
            document.title = `Chronokeep - Events`
            const state = this.state;
            if (state.error === true) {
                document.title = `Chronokeep - Error`
                return (
                    <div>
                        { Header("events") }
                        { ErrorMsg(state.status, state.found) }
                        { Footer() }
                    </div>
                )
            }
            if (state.loading === true) {
                return (
                    <div>
                        { Header("events") }
                        <div className="mx-auto sm-max-width text-center container-md border border-light p-5 pt-4">
                            <h1 className="text-important display-5">Loading Events</h1>
                            { Loading() }
                        </div>
                        { Footer() }
                    </div>
                );
            }
            const events = state.events.sort((a, b) => {
                var aDate = new Date(a.recent_time)
                var bDate = new Date(b.recent_time)
                return bDate - aDate
            })
            if (events && events.length > 0) {
                return (
                    <div>
                        { Header("event") }
                        <div className="mx-auto sm-max-width text-center container-md border border-light p-5 pt-4">
                            <h1 className="text-important display-4">Events</h1>
                            <div className="list-group justify-content-center flex-column mt-4">
                                { state.events.map( (ev, index) => {
                                    return (
                                        <Link className="list-group-item list-group-item-action text-important" to={`/results/${ev.slug}`} key={`event${index}`}>{ ev.name }</Link>
                                    )
                                }) }
                            </div>
                        </div>
                        { Footer() }
                    </div>
                );
            } else {
                return (
                    <div>
                        { Header("event") }
                        <div className="container-lg lg-max-width shadow">
                            <h2 className="text-important text-primary">No events found.</h2>
                        </div>
                        { Footer() }
                    </div>
                )
            }
        }
}

export default Events;