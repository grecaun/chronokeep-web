import { authHeader } from '../_helpers/auth-header';
import { handleResponse, handleResponseNoLogout } from '../_helpers/handle-response';
import { authenticationService } from './authentication.service';

export const userService = {
    getAPIKeys,
    addAPIKey,
    updateAPIKey,
    deleteAPIKey,
    getAccountInfo,
    updateAccountInfo,
    addAccount,
    changeEmail,
    changePassword,
};

const BASE_URL = process.env.REACT_APP_CHRONOKEEP_API_URL;

// the backbone of the authentication protocols
// checks if our token has expired and refreshes as necessary
function fetchWithRefresh(url, requestOptions) {
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
                    const currentUser = authenticationService.currentUserValue;
                    // send a refresh request if the token is set
                    if (currentUser && currentUser.refresh_token) {
                        console.log("Refreshing token.");
                        return authenticationService.refresh(currentUser.refresh_token)
                            .then(
                                // if we get data back then send our request again
                                _data => {
                                    requestOptions.headers = authHeader();
                                    return fetch(url, requestOptions).then(handleResponse);
                                },
                                // if there was an error return the error
                                error => {
                                    // log out the user if unauthorized or forbidden is returned
                                    if ([401, 403].indexOf(error.status) !== -1) {
                                        authenticationService.logout();
                                        window.location.reload(false);
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

function getAPIKeys(email) {
    const requestOptions = {
        method: 'POST',
        headers: authHeader(),
        body: '{ }'
    };
    if (email !== null) {
        requestOptions.body = JSON.stringify({ email: email });
    }
    return fetchWithRefresh(BASE_URL + 'key', requestOptions);
}

function updateAPIKey(value, name, type, allowedHosts, validUntil) {
    var key = {
        value: value,
        name: name,
        type: type,
        allowed_hosts: allowedHosts,
        valid_until: validUntil
    };
    const requestOptions = {
        method: 'PUT',
        headers: authHeader(),
        body: JSON.stringify({ key: key })
    };
    return fetchWithRefresh(BASE_URL + 'key/update', requestOptions)
}

function addAPIKey(name, type, allowedHosts, validUntil, email) {
    var key = {
        name: name,
        type: type,
        allowed_hosts: allowedHosts,
        valid_until: validUntil
    };
    const requestOptions = {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify({ email: email, key: key })
    };
    return fetchWithRefresh(BASE_URL + 'key/add', requestOptions)
}

function deleteAPIKey(value) {
    const requestOptions = {
        method: 'DELETE',
        headers: authHeader(),
        body: JSON.stringify({ key: value })
    }
    return fetchWithRefresh(BASE_URL + 'key/delete', requestOptions)
}

function getAccountInfo() {
    const requestOptions = {
        method: 'POST',
        headers: authHeader(),
        body: '{ }'
    };
    return fetchWithRefresh(BASE_URL + 'account', requestOptions);
}

function updateAccountInfo(name, email, type) {
    var account = {
        name: name,
        email: email,
        type: type,
    };
    const requestOptions = {
        method: 'PUT',
        headers: authHeader(),
        body: JSON.stringify({ account: account })
    };
    return fetchWithRefresh(BASE_URL + 'account/update', requestOptions);
}

function addAccount(name, email, type, password) {
    var account = {
        name: name,
        email: email,
        type: type,
    };
    const requestOptions = {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify({ account: account, password: password })
    };
    return fetchWithRefresh(BASE_URL + 'account/add', requestOptions);
}

function changePassword(oldPassword, newPassword, email) {
    const requestOptions = {
        method: 'PUT',
        headers: authHeader(),
        body: JSON.stringify({ old_password: oldPassword, new_password: newPassword, email: email })
    }
    return fetchWithRefresh(BASE_URL + 'account/password', requestOptions)
        .then(() => {
            return authenticationService.logout();
        });
}

function changeEmail(oldEmail, newEmail) {
    const requestOptions = {
        method: 'PUT',
        headers: authHeader(),
        body: JSON.stringify({ old_email: oldEmail, new_email: newEmail })
    }
    return fetchWithRefresh(BASE_URL + 'account/email', requestOptions)
        .then(() => {
            return authenticationService.logout();
        });
}