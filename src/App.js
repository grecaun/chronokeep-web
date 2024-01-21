import React, { Component } from 'react';
import {BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import { PrivateRoute, PrivateRemoteRoute } from './components/Auth/PrivateRoute';
import Results from './components/Pages/Results';
import Events from './components/Pages/Events';
import Person from './components/Pages/Person';
import Login from './components/Pages/Login';
import Logout from './components/Pages/Logout';
import Account from './components/Pages/Account';
import QRCode from './components/Pages/QRCode';
import Awards from './components/Pages/Awards';
import Status from './components/Pages/Status';
import { default as RemoteLogin } from './components/Pages/Remote/Login';
import { default as RemoteLogout } from './components/Pages/Remote/Logout';
import { default as RemoteAccount } from './components/Pages/Remote/Account';

class App extends Component {
  render() {
    return (
      <Router>
        <div>
          <Switch>
            <Route path='/awards/:slug/:year/qr' component={QRCode} />
            <Route path='/awards/:slug/qr' component={QRCode} />
            <Route path='/awards/:slug/:year' component={Awards} />
            <Route path='/awards/:slug' component={Awards} />
            <Route path='/results/:slug/:year/qr' component={QRCode} />
            <Route path='/results/:slug/:year/status/qr' component={QRCode} />
            <Route path='/results/:slug/:year/status' component={Status} />
            <Route path='/results/:slug/:year/:bib' component={Person} />
            <Route path='/results/:slug/qr' component={QRCode} />
            <Route path='/results/:slug/status' component={Status} />
            <Route path='/results/:slug/:year' component={Results} />
            <Route path='/results/:slug' component={Results} />
            <Route path='/remote/login' component={RemoteLogin} />
            <Route path='/remote/logout' component={RemoteLogout} />
            <PrivateRemoteRoute path='/remote' component={RemoteAccount} />
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
