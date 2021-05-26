import React, { Component } from 'react';

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
            <div>
              Events
            </div>
            { state.events.map( (ev, index) => {
              return (
                <div key={ index }>
                  <a href={ "/results/" + ev.slug }>{ ev.name }</a>
                </div>
              )
            }) }
          </div>
        );
      } else {
        return (
          <div className="App">
            No events found.
          </div>
        )
      }
    }
}

export default Events;