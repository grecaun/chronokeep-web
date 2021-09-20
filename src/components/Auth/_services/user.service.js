import { authHeader } from '../_helpers/auth-header';
import { handleResponse } from '../_helpers/handle-response';

export const userService = {
    getAPIKeys,
    addAPIKey,
};

const BASE_URL = process.env.REACT_APP_CHRONOKEEP_API_URL;

function getAPIKeys(email) {
    const requestOptions = {
        method: 'POST',
        headers: authHeader(),
        body: '{ }'
    };
    if (email !== null) {
        requestOptions.body = JSON.stringify({ email: email });
    }
    return fetch(BASE_URL + 'key', requestOptions).then(handleResponse);
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
    return fetch(BASE_URL + 'key/add', requestOptions).then(handleResponse);
}