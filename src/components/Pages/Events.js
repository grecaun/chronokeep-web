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
        events: []
      }
    }
  
    componentDidMount() {
      const BASE_URL = process.env.REACT_APP_BASE_URL;
      fetch(BASE_URL + '/api/event/all')
      .then(response => {
        console.log("response found for events query")
        this.setState({
          status: response.status,
          loading: false,
          response: true,
        });
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
      const state = this.state;
      if (state.error === true) {
        return (
          <div>
            { Header("events") }
            { ErrorMsg() }
            { Footer() }
          </div>
        )
      }
      if (state.loading === true) {
        return (
            <div>
                { Header("events") }
                { Loading() }
                { Footer() }
            </div>
        );
      }
      if (state.events && state.events.length > 0) {
        return (
          <div>
            { Header("event") }
            <div className="mx-auto sm-max-width text-center event-container container-md border border-light shadow-sm p-5 pt-4">
              <h1 className="text-important text-primary">Events</h1>
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