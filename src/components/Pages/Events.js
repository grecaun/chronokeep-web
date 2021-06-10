import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class Events extends Component {
    constructor(props) {
      super(props);
      this.state = {
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
          found: data,
          events: data.events
        });
      })
    }
    
    render() {
      const state = this.state;
      if (state.events && state.events.length > 0) {
        return (
          <div className="card mx-auto sm-max-width text-center event-container">
            <h1 className="text-important">Events</h1>
            <ul className="nav justicy-content-center flex-column nav-pills">
              { state.events.map( (ev, index) => {
                return (
                  <li className="nav-item" key={ index }>
                    <Link className="nav-link text-important" to={`/results/${ev.slug}`}>{ ev.name }</Link>
                  </li>
                )
              }) }
            </ul>
          </div>
        );
      } else {
        return (
          <div className="App">
            <h3>No events found.</h3>
          </div>
        )
      }
    }
}

export default Events;