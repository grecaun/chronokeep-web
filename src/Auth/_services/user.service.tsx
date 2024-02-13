import { authHeader } from '../_helpers/auth-header';
import { handleResponse, handleResponseNoLogout } from '../_helpers/handle-response';
import { authenticationService } from './authentication.service';
import { AuthTokens, Key } from '../../Interfaces/types';

export const userService = {
    getAPIKeys,
    deleteAPIKey,
    addAPIKey,
    updateAPIKey,
    getAccountInfo,
    updateAccountInfo,
    addAccount,
    changeEmail,
    changePassword,
};

const API_URL = import.meta.env.VITE_CHRONOKEEP_API_URL;
const REMOTE_URL = import.meta.env.VITE_CHRONOKEEP_REMOTE_URL;

// the backbone of the authentication protocols
// checks if our token has expired and refreshes as necessary
function fetchWithRefresh(url: string, requestOptions: any, auth: string) {
    return fetch(url, requestOptions).then(handleResponseNoLogout)
        .then(
            // if we found data, return it
            data => {
                return data;
            },
            // if there's an error, our token might have expired, try refreshing it
            error => {
                // only try to refresh the token if we're given a 401 unauthorized or 403 forbidden response
                if ([401, 403].indexOf(error.status) !== -1) {
                    var currentUser = authenticationService.currentUserValue;
                    if (auth === "REMOTE") {
                        currentUser = authenticationService.currentRemoteUserValue;
                    }
                    // send a refresh request if the token is set
                    if (currentUser && currentUser.refresh_token) {
                        return authenticationService.refresh(currentUser.refresh_token, auth)
                            .then(
                                // if we get data back then send our request again
                                _data => {
                                    currentUser = authenticationService.currentUserValue;
                                    if (auth === "REMOTE") {
                                        currentUser = authenticationService.currentRemoteUserValue;
                                    }
                                    requestOptions.headers = authHeader(currentUser!);
                                    return fetch(url, requestOptions).then(
                                        (response) => {
                                            return handleResponse(response, auth)
                                        });
                                },
                                // if there was an error return the error
                                error => {
                                    // log out the user if unauthorized or forbidden is returned
                                    if ([401, 403].indexOf(error.status) !== -1) {
                                        authenticationService.logout(auth);
                                    }
                                    return Promise.reject(error);
                                }
                            )
                    }
                }
                return Promise.reject(error);
            }
        );
}

/*
 * General API functions
 */

function getAPIKeys(email: string, auth: string) {
    var currentUser = authenticationService.currentUserValue;
    var url = API_URL;
    if (auth === "REMOTE") {
        currentUser = authenticationService.currentRemoteUserValue;
        url = REMOTE_URL;
    }
    const requestOptions = {
        method: 'POST',
        headers: authHeader(currentUser!),
        body: '{ }'
    };
    if (email !== null) {
        requestOptions.body = JSON.stringify({ email: email });
    }
    return fetchWithRefresh(url + 'key', requestOptions, auth);
}

function deleteAPIKey(value: string, auth: string) {
    var currentUser = authenticationService.currentUserValue;
    var url = API_URL;
    if (auth === "REMOTE") {
        currentUser = authenticationService.currentRemoteUserValue;
        url = REMOTE_URL;
    }
    const requestOptions = {
        method: 'DELETE',
        headers: authHeader(currentUser!),
        body: JSON.stringify({ key: value })
    }
    return fetchWithRefresh(url + 'key/delete', requestOptions, auth)
}

/*
 * Result API functions.
 */

function updateAPIKey(key: Key, auth: string) {
    var currentUser: AuthTokens | null = authenticationService.currentUserValue;
    var url: string = API_URL;
    if (auth === "REMOTE") {
        currentUser = authenticationService.currentRemoteUserValue;
        url = REMOTE_URL;
    } 
    const requestOptions = {
        method: 'PUT',
        headers: authHeader(currentUser!),
        body: JSON.stringify({ key: key })
    };
    return fetchWithRefresh(url + 'key/update', requestOptions, auth)
}

function addAPIKey(key: Key, auth: string) {
    var currentUser: AuthTokens | null = authenticationService.currentUserValue;
    var url: string = API_URL;
    if (auth === "REMOTE") {
        currentUser = authenticationService.currentRemoteUserValue;
        url = REMOTE_URL;
    } 
    const requestOptions = {
        method: 'POST',
        headers: authHeader(currentUser!),
        body: JSON.stringify({ key: key })
    };
    return fetchWithRefresh(url + 'key/add', requestOptions, auth)
}

/*
 * Account functions.
 */

function getAccountInfo(auth: string) {
    var currentUser = authenticationService.currentUserValue;
    var url = API_URL;
    if (auth === "REMOTE") {
        currentUser = authenticationService.currentRemoteUserValue;
        url = REMOTE_URL;
    }
    const requestOptions = {
        method: 'POST',
        headers: authHeader(currentUser!),
        body: '{ }'
    };
    return fetchWithRefresh(url + 'account', requestOptions, auth);
}

function updateAccountInfo(name: string, email: string, type: string, auth: string) {
    var account = {
        name: name,
        email: email,
        type: type,
    };
    var currentUser = authenticationService.currentUserValue;
    var url = API_URL;
    if (auth === "REMOTE") {
        currentUser = authenticationService.currentRemoteUserValue;
        url = REMOTE_URL;
    }
    const requestOptions = {
        method: 'PUT',
        headers: authHeader(currentUser!),
        body: JSON.stringify({ account: account })
    };
    return fetchWithRefresh(url + 'account/update', requestOptions, auth);
}

function addAccount(name: string, email: string, type: string, password: string, auth: string) {
    var account = {
        name: name,
        email: email,
        type: type,
    };
    var currentUser = authenticationService.currentUserValue;
    var url = API_URL;
    if (auth === "REMOTE") {
        currentUser = authenticationService.currentRemoteUserValue;
        url = REMOTE_URL;
    }
    const requestOptions = {
        method: 'POST',
        headers: authHeader(currentUser!),
        body: JSON.stringify({ account: account, password: password })
    };
    return fetchWithRefresh(url + 'account/add', requestOptions, auth);
}

function changePassword(oldPassword: string, newPassword: string, email: string, auth: string) {
    var currentUser = authenticationService.currentUserValue;
    var url = API_URL;
    if (auth === "REMOTE") {
        currentUser = authenticationService.currentRemoteUserValue;
        url = REMOTE_URL;
    }
    const requestOptions = {
        method: 'PUT',
        headers: authHeader(currentUser!),
        body: JSON.stringify({ old_password: oldPassword, new_password: newPassword, email: email })
    }
    return fetchWithRefresh(url + 'account/password', requestOptions, auth)
        .then(() => {
            return authenticationService.logout(auth);
        });
}

function changeEmail(oldEmail: string, newEmail: string, auth: string) {
    var currentUser = authenticationService.currentUserValue;
    var url = API_URL;
    if (auth === "REMOTE") {
        currentUser = authenticationService.currentRemoteUserValue;
        url = REMOTE_URL;
    }
    const requestOptions = {
        method: 'PUT',
        headers: authHeader(currentUser!),
        body: JSON.stringify({ old_email: oldEmail, new_email: newEmail })
    }
    return fetchWithRefresh(url + 'account/email', requestOptions, auth)
        .then(() => {
            return authenticationService.logout(auth);
        });
}