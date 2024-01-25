import { authHeader } from '../_helpers/auth-header';
import { handleResponse, handleResponseNoLogout } from '../_helpers/handle-response';
import { authenticationService } from './authentication.service';

export const userService = {
    getAPIKeys,
    deleteAPIKey,
    addAPIKey,
    updateAPIKey,
    addRemoteKey,
    updateRemoteKey,
    getAccountInfo,
    updateAccountInfo,
    addAccount,
    changeEmail,
    changePassword,
};

const API_URL = process.env.REACT_APP_CHRONOKEEP_API_URL;
const REMOTE_URL = process.env.REACT_APP_CHRONOKEEP_REMOTE_URL;

// the backbone of the authentication protocols
// checks if our token has expired and refreshes as necessary
function fetchWithRefresh(url, requestOptions, auth) {
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
                                    requestOptions.headers = authHeader(currentUser);
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

function getAPIKeys(email, auth) {
    var currentUser = authenticationService.currentUserValue;
    var url = API_URL;
    if (auth === "REMOTE") {
        currentUser = authenticationService.currentRemoteUserValue;
        url = REMOTE_URL;
    }
    const requestOptions = {
        method: 'POST',
        headers: authHeader(currentUser),
        body: '{ }'
    };
    if (email !== null) {
        requestOptions.body = JSON.stringify({ email: email });
    }
    return fetchWithRefresh(url + 'key', requestOptions, auth);
}

function deleteAPIKey(value, auth) {
    var currentUser = authenticationService.currentUserValue;
    var url = API_URL;
    if (auth === "REMOTE") {
        currentUser = authenticationService.currentRemoteUserValue;
        url = REMOTE_URL;
    }
    const requestOptions = {
        method: 'DELETE',
        headers: authHeader(currentUser),
        body: JSON.stringify({ key: value })
    }
    return fetchWithRefresh(url + 'key/delete', requestOptions, auth)
}

/*
 * Result API functions.
 */

function updateAPIKey(value, name, type, allowedHosts, validUntil) {
    var key = {
        value: value,
        name: name,
        type: type,
        allowed_hosts: allowedHosts,
        valid_until: validUntil
    };
    var currentUser = authenticationService.currentUserValue;
    var url = API_URL;
    const requestOptions = {
        method: 'PUT',
        headers: authHeader(currentUser),
        body: JSON.stringify({ key: key })
    };
    return fetchWithRefresh(url + 'key/update', requestOptions, "API")
}

function addAPIKey(name, type, allowedHosts, validUntil) {
    var key = {
        name: name,
        type: type,
        allowed_hosts: allowedHosts,
        valid_until: validUntil
    };
    const currentUser = authenticationService.currentUserValue;
    const url = API_URL;
    const requestOptions = {
        method: 'POST',
        headers: authHeader(currentUser),
        body: JSON.stringify({ key: key })
    };
    return fetchWithRefresh(url + 'key/add', requestOptions, "API")
}

/*
 * Remote API functions
 */

function updateRemoteKey(value, name, type,  validUntil) {
    var key = {
        value: value,
        name: name,
        type: type,
        valid_until: validUntil
    };
    const currentUser = authenticationService.currentRemoteUserValue;
    const url = REMOTE_URL;
    const requestOptions = {
        method: 'PUT',
        headers: authHeader(currentUser),
        body: JSON.stringify({ key: key })
    };
    return fetchWithRefresh(url + 'key/update', requestOptions, "REMOTE")
}

function addRemoteKey(name, type, validUntil) {
    var key = {
        name: name,
        type: type,
        valid_until: validUntil
    };
    const currentUser = authenticationService.currentRemoteUserValue;
    const url = REMOTE_URL;
    const requestOptions = {
        method: 'POST',
        headers: authHeader(currentUser),
        body: JSON.stringify({ key: key })
    };
    return fetchWithRefresh(url + 'key/add', requestOptions, "REMOTE")
}

/*
 * Account functions.
 */

function getAccountInfo(auth) {
    var currentUser = authenticationService.currentUserValue;
    var url = API_URL;
    if (auth === "REMOTE") {
        currentUser = authenticationService.currentRemoteUserValue;
        url = REMOTE_URL;
    }
    const requestOptions = {
        method: 'POST',
        headers: authHeader(currentUser),
        body: '{ }'
    };
    return fetchWithRefresh(url + 'account', requestOptions, auth);
}

function updateAccountInfo(name, email, type, auth) {
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
        headers: authHeader(currentUser),
        body: JSON.stringify({ account: account })
    };
    return fetchWithRefresh(url + 'account/update', requestOptions, auth);
}

function addAccount(name, email, type, password, auth) {
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
        headers: authHeader(currentUser),
        body: JSON.stringify({ account: account, password: password })
    };
    return fetchWithRefresh(url + 'account/add', requestOptions, auth);
}

function changePassword(oldPassword, newPassword, email, auth) {
    var currentUser = authenticationService.currentUserValue;
    var url = API_URL;
    if (auth === "REMOTE") {
        currentUser = authenticationService.currentRemoteUserValue;
        url = REMOTE_URL;
    }
    const requestOptions = {
        method: 'PUT',
        headers: authHeader(currentUser),
        body: JSON.stringify({ old_password: oldPassword, new_password: newPassword, email: email })
    }
    return fetchWithRefresh(url + 'account/password', requestOptions, auth)
        .then(() => {
            return authenticationService.logout(auth);
        });
}

function changeEmail(oldEmail, newEmail, auth) {
    var currentUser = authenticationService.currentUserValue;
    var url = API_URL;
    if (auth === "REMOTE") {
        currentUser = authenticationService.currentRemoteUserValue;
        url = REMOTE_URL;
    }
    const requestOptions = {
        method: 'PUT',
        headers: authHeader(currentUser),
        body: JSON.stringify({ old_email: oldEmail, new_email: newEmail })
    }
    return fetchWithRefresh(url + 'account/email', requestOptions, auth)
        .then(() => {
            return authenticationService.logout(auth);
        });
}