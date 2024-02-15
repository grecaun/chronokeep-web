import { Navigate } from 'react-router-dom';

import { authenticationService } from '../Auth/_services/authentication.service';
import { ErrorWithStatus } from '../Interfaces/responses';

export async function logoutLoader(page: string) {
    await authenticationService.logout(page === 'account' ? "API" : "REMOTE")
            .then(response => {
                if (response.status !== 200) {
                    return response.json();
                }
                return null;
            })
            .then(data => {
                console.log("data is ", data)
                if (data !== null && Object.prototype.hasOwnProperty.call(data, 'status')) {
                    const err = data as ErrorWithStatus
                    // 401 Unauthorized means the token is not valid, 403 might mean the same
                    // don't log an issue if either is returned, but do so if something else is
                    if (err.status !== 401 && err.status !== 403) {
                        console.log("Unknown error logging out: ", err.message)
                    }
                }
            })
            .catch(error => {
                if (error !== null && Object.prototype.hasOwnProperty.call(error, 'status')) {
                    const err = error as ErrorWithStatus
                    // 401 Unauthorized means the token is not valid, 403 might mean the same
                    // don't log an issue if either is returned, but do so if something else is
                    if (err.status !== 401 && err.status !== 403) {
                        console.log("Caught error logging out: ", err.message)
                    }
                }
            });
    return null;
}

export function LogoutPage() {
    return (
        <Navigate to={{ pathname: '/' }} />
    )
}

export default LogoutPage;