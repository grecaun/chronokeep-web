import { Navigate, Outlet } from 'react-router-dom';

import { authenticationService } from './_services/authentication.service';
import { PageProps } from '../Interfaces/props';

export function PrivateRoute(params: PageProps) {
    const notLoggedin: boolean = params.page === 'account' ? !authenticationService.currentUserValue : !authenticationService.currentRemoteUserValue
    if (notLoggedin) {
        // not logged in, so redirect to login page with the return url
        return <Navigate to={`/${params.page}/login`} state={{ from: `/${params.page}` }} />
    }
    return <Outlet />;
}