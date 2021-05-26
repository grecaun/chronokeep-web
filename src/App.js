import React, { Component } from 'react';
import {BrowserRouter as Router, Switch, Route } from 'react-router-dom';
// import {BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

import Results from './components/Results';
import Events from './components/Events';

require('dotenv').config()

class App extends Component {
  render() {
    return (
      <Router>
        <div>
          {/*
          <h2>Router Tutorial</h2>
          <nav className="navbar navbar-expand-lg navbar-light bg-light">
            <ul className="navbar-nav mr-auto">
              <li><Link to={'/'} className="nav-link">Events</Link></li>
              <li><Link to={'/results'} className="nav-link">Results</Link></li>
            </ul>
          </nav>
          <hr />
          */}
          <Switch>
            <Route path='/results/:slug/:year' component={Results} />
            <Route path='/results/:slug' component={Results} />
            <Route path='/' component={Events} />
          </Switch>
        </div>
      </Router>
    )
  }
}

export default App;
