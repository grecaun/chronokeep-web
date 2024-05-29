import { authHeader } from '../_helpers/auth-header';
import { handleResponse, handleResponseNoLogout } from '../_helpers/handle-response';
import { authenticationService } from './authentication.service';
import { AuthTokens, Key, Participant } from '../../Interfaces/types';
import { ErrorWithStatus } from '../../Interfaces/responses';

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
    getParticipants,
    updateParticipant,
    addParticipant,
    addLinkedAccount,
    removeLinkedAccount,
};

const API_URL = import.meta.env.VITE_CHRONOKEEP_API_URL;
const REMOTE_URL = import.meta.env.VITE_CHRONOKEEP_REMOTE_URL;

// the backbone of the authentication protocols
// checks if our token has expired and refreshes as necessary
function fetchWithRefresh(url: string, requestOptions: RequestInit, auth: string) {
    return fetch(url, requestOptions).then(handleResponseNoLogout)
        .then(
            // if we found data, return it
            data => {
                return data;
            },
            // if there's an error, our token might have expired, try refreshing it
            error => {
                if (Object.prototype.hasOwnProperty.call(error, 'status')) {
                    const err = error as ErrorWithStatus
                    // only try to refresh the token if we're given a 401 unauthorized or 403 forbidden response
                    if ([401, 403].indexOf(err.status) !== -1) {
                        let currentUser = authenticationService.currentUserValue;
                        if (auth === "REMOTE") {
                            currentUser = authenticationService.currentRemoteUserValue;
                        }
                        // send a refresh request if the token is set
                        if (currentUser && currentUser.refresh_token) {
                            return authenticationService.refresh(currentUser.refresh_token, auth)
                                .then(
                                    // if we get data back then send our request again
                                    () => {
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
                                        if (Object.prototype.hasOwnProperty.call(error, 'status')) {
                                            const err = error as ErrorWithStatus
                                            // log out the user if unauthorized or forbidden is returned
                                            if ([401, 403].indexOf(err.status) !== -1) {
                                                authenticationService.logout(auth).catch(()=>{});
                                            }
                                        }
                                        return Promise.reject(error);
                                    }
                                )
                        }
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
    let currentUser = authenticationService.currentUserValue;
    let url = API_URL;
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
    let currentUser = authenticationService.currentUserValue;
    let url = API_URL;
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
    let currentUser: AuthTokens | null = authenticationService.currentUserValue;
    let url: string = API_URL;
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
    let currentUser: AuthTokens | null = authenticationService.currentUserValue;
    let url: string = API_URL;
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
    let currentUser = authenticationService.currentUserValue;
    let url = API_URL;
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
    const account = {
        name: name,
        email: email,
        type: type,
    };
    let currentUser = authenticationService.currentUserValue;
    let url = API_URL;
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
    const account = {
        name: name,
        email: email,
        type: type,
    };
    let currentUser = authenticationService.currentUserValue;
    let url = API_URL;
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
    let currentUser = authenticationService.currentUserValue;
    let url = API_URL;
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
    let currentUser = authenticationService.currentUserValue;
    let url = API_URL;
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

function addLinkedAccount(email: string) {
    const currentUser = authenticationService.currentUserValue;
    const url = API_URL;
    const requestOptions = {
        method: 'PUT',
        headers: authHeader(currentUser!),
        body: JSON.stringify({ email: email })
    }
    return fetchWithRefresh(url + 'account/link', requestOptions, "API");
}

function removeLinkedAccount(email: string) {
    const currentUser = authenticationService.currentUserValue;
    const url = API_URL;
    const requestOptions = {
        method: 'PUT',
        headers: authHeader(currentUser!),
        body: JSON.stringify({ email: email })
    }
    return fetchWithRefresh(url + 'account/unlink', requestOptions, "API");
}

/*
 * Participant functions
 */

function getParticipants(slug: string, year: string) {
    let currentUser = authenticationService.currentUserValue;
    let url = API_URL;
    const requestOptions = {
        method: 'POST',
        body: JSON.stringify({ slug: slug, year: year }),
        headers: authHeader(currentUser!),
    }
    return fetchWithRefresh(url + 'r/participants', requestOptions, "API");
}

function updateParticipant(slug: string, year: string, participant: Participant) {
    let currentUser = authenticationService.currentUserValue;
    let url = API_URL;
    const requestOptions = {
        method: 'POST',
        headers: authHeader(currentUser!),
        body: JSON.stringify({ slug: slug, year: year, participant: participant })
    }
    return fetchWithRefresh(url + 'r/participants/update', requestOptions, "API");
}

function addParticipant(slug: string, year: string, participant: Participant) {
    let currentUser = authenticationService.currentUserValue;
    let url = API_URL;
    const requestOptions = {
        method: 'POST',
        headers: authHeader(currentUser!),
        body: JSON.stringify({ slug: slug, year: year, participant: participant })
    }
    return fetchWithRefresh(url + 'r/participants/add', requestOptions, "API");

}