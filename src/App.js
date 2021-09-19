import React, { Component } from 'react';
import {BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import Results from './components/Pages/Results';
import Events from './components/Pages/Events';
import Person from './components/Pages/Person';
import Login from './components/Pages/Login';
import Logout from './components/Pages/Logout';

require('dotenv').config()

class App extends Component {
  render() {
    return (
      <Router>
        <div>
          <Switch>
            <Route path='/results/:slug/:year/:bib' component={Person} />
            <Route path='/results/:slug/:year' component={Results} />
            <Route path='/results/:slug' component={Results} />
            <Route path='/login' component={Login} />
            <Route path='/logout' component={Logout} />
            <Route path='/' component={Events} />
          </Switch>
        </div>
      </Router>
    )
  }
}

export default App;
