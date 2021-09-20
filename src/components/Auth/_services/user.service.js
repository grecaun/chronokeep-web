import { authHeader } from '../_helpers/auth-header';
import { handleResponse, handleResponseNoLogout } from '../_helpers/handle-response';
import { authenticationService } from './authentication.service';

export const userService = {
    getAPIKeys,
    addAPIKey,
    getAccountInfo,
};

const BASE_URL = process.env.REACT_APP_CHRONOKEEP_API_URL;

function refresh(refresh_token, successFunction) {
    console.log("refreshing token");
    return authenticationService.refresh(refresh_token)
        .then(
            // if we get data back then send our request again
            _data => {
                return successFunction();
            },
            // if there was an error return the error
            error => {
                return error;
            }
        )
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
    return fetch(BASE_URL + 'key', requestOptions).then(handleResponseNoLogout)
        .then(
            // if we found data, return it
            data => {
                return data;
            },
            // if there's an error, our token might have expired, try refreshing it
            error => {
                var successFunction = () => {
                    requestOptions.headers = authHeader();
                    return fetch(BASE_URL + 'key', requestOptions).then(handleResponse);
                }
                const currentUser = authenticationService.currentUserValue;
                // send a refresh request if the token is set
                if (currentUser && currentUser.refresh_token) {
                    return refresh(currentUser.refresh_token, successFunction)
                }
                return error;
            }
        );
}

function getAccountInfo() {
    const requestOptions = {
        method: 'POST',
        headers: authHeader(),
        body: '{ }'
    };
    return fetch(BASE_URL + 'account', requestOptions).then(handleResponseNoLogout)
        .then(
            data => {
                return data;
            },
            error => {
                var successFunction = () => {
                    requestOptions.headers = authHeader();
                    return fetch(BASE_URL + 'account', requestOptions).then(handleResponse);
                }
                const currentUser = authenticationService.currentUserValue;
                if (currentUser && currentUser.refresh_token) {
                    return refresh(currentUser.refresh_token, successFunction)
                }
                return error;
            }
        );
}

function addAPIKey(type, allowedHosts, email) {
    var key = {
        type: type,
        allowed_hosts: allowedHosts
    };
    if (email !== null) {
        key["email"] = email;
    };
    const requestOptions = {
        method: 'POST',
        headrs: authHeader(),
        body: JSON.stringify({ key: key })
    };
    return fetch(BASE_URL + 'key/add', requestOptions).then(handleResponseNoLogout)
        .then(
            data => {
                return data;
            },
            error => {
                var successFunction = () => {
                    requestOptions.headers = authHeader();
                    return fetch(BASE_URL + 'key/add', requestOptions).then(handleResponse)
                }
                const currentUser = authenticationService.currentUserValue;
                if (currentUser && currentUser.refresh_token) {
                    return refresh(currentUser.refresh_token, successFunction)
                }
                return error;
            }
        );
}