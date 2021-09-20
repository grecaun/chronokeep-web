import React from 'react';
import { Route, Redirect } from 'react-router-dom';

import { authenticationService } from '../Auth/_services/authentication.service';

export const PrivateRoute = ({ component: Component, ...rest }) => (
    <Route {...rest} render={props => {
        const currentUser = authenticationService.currentUser;
        if (!currentUser) {
            // not logged in, so redirect to login page with the return url
            return <Redirect to={{ pathname: '/login', state: { from: props.location } }} />
        }
        // authorized so return component
        return <Component {...props} />
    }} />
)