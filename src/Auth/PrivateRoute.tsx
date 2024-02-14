import { Navigate, Outlet } from 'react-router-dom';
import { ReactElement } from 'react';

import { authenticationService } from './_services/authentication.service';

export function PrivateRoute(): ReactElement {
    if (!authenticationService.currentUserValue) {
        // not logged in, so redirect to login page with the return url
        return <Navigate to='/login' state={{ from: '/account' }} />
    }
    return <Outlet />;
}

export function PrivateRemoteRoute(): ReactElement {
    if (!authenticationService.currentRemoteUserValue) {
        // not logged in, so redirect to login page with the return url
        return <Navigate to='/remote/login' state={{ from: '/remote' }} />
    }
    return <Outlet />
}