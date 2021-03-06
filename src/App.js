import React, { Component } from 'react';
import {BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import { PrivateRoute } from './components/Auth/PrivateRoute';
import Results from './components/Pages/Results';
import Events from './components/Pages/Events';
import Person from './components/Pages/Person';
import Login from './components/Pages/Login';
import Logout from './components/Pages/Logout';
import Account from './components/Pages/Account';
import QRCode from './components/Pages/QRCode';

class App extends Component {
  render() {
    return (
      <Router>
        <div>
          <Switch>
            <Route path='/results/:slug/:year/qr' component={QRCode} />
            <Route path='/results/:slug/:year/:bib' component={Person} />
            <Route path='/results/:slug/qr' component={QRCode} />
            <Route path='/results/:slug/:year' component={Results} />
            <Route path='/results/:slug' component={Results} />
            <Route path='/login' component={Login} />
            <Route path='/logout' component={Logout} />
            <PrivateRoute path='/account' component={Account} />
            <Route path='/' component={Events} />
          </Switch>
        </div>
      </Router>
    )
  }
}

export default App;
