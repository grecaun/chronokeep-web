import { BehaviorSubject } from 'rxjs';
import { authHeader } from '../_helpers/auth-header';
import { handleResponse } from '../_helpers/handle-response';

const currentUserSubject = new BehaviorSubject(JSON.parse(localStorage.getItem('currentUser')));
const BASE_URL = process.env.REACT_APP_CHRONOKEEP_API_URL;

export const authenticationService = {
    login,
    refresh,
    logout,
    currentUser: currentUserSubject.asObservable(),
    get currentUserValue () { return currentUserSubject.value }
};

function login(username, password) {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: username, password: password })
    };

    return fetch(BASE_URL + 'account/login', requestOptions)
    .then(handleResponse)
    .then(user => {
        localStorage.setItem('currentUser', JSON.stringify(user.data));
        currentUserSubject.next(user.data);
        return user.data;
    });
}

function refresh(token) {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: token })
    };

    return fetch(BASE_URL + 'account/refresh', requestOptions)
    .then(handleResponse)
    .then(user => {
        if (user.access_token) {
            console.log(`token: ${user.access_token}`)
        }
        localStorage.setItem('currentUser', JSON.stringify(user.data));
        currentUserSubject.next(user.data);
        return user.data;
    });
}

function logout() {
    // let the API know the user wants to log out
    const requestOptions = {
        method: 'POST',
        headers: authHeader()
    };
    return fetch(BASE_URL + 'account/logout', requestOptions)
    .then(response => {
        // remove user from local storage to log user out
        localStorage.removeItem('currentUser');
        currentUserSubject.next(null);
        return response;
    });
}