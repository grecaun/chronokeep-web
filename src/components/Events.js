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
      .then(res => res.json())
      .then(json => json.events)
      .then(events => {this.setState({ 'events': events })
      })
    }
    
    render() {
      const state = this.state;
      if (state.events && state.events.length > 0) {
        return (
          <div className="App">
            <h3>Events</h3>
            <ul>
              { state.events.map( (ev, index) => {
                return (
                  <li key={ index }>
                    <Link to={`/results/${ev.slug}`}>{ ev.name }</Link>
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