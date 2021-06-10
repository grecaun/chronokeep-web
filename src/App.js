import React, { Component } from 'react';
import {BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { Link } from 'react-router-dom';

import Results from './components/Pages/Results';
import Events from './components/Pages/Events';
import Person from './components/Pages/Person';

require('dotenv').config()

class App extends Component {
  render() {
    return (
      <Router>
        <div>
          <nav className="navbar navbar-expand-sm navbar-light bg-light">
            <div class="container-lg lg-max-width">
              <a class="navbar-brand" href={'/'}>Chronokeep</a>
              <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
              </button>
              <div class="collapse navbar-collapse" id="navbarSupportedContent">
                <div class="navbar-nav">
                  <Link to={'/'} className="nav-link">Events</Link>
                </div>
              </div>
            </div>
          </nav>
          <Switch>
            <Route path='/results/:slug/:year/:bib' component={Person} />
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
