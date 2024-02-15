import { BehaviorSubject } from 'rxjs';
import { authHeader } from '../_helpers/auth-header';
import { handleResponseNoLogout } from '../_helpers/handle-response';
import { AuthTokens } from '../../Interfaces/types';

const currentUserSubject: BehaviorSubject<AuthTokens | null> = new BehaviorSubject<AuthTokens | null>(localStorage.getItem('currentUser') ? JSON.parse(localStorage.getItem('currentUser')!) as AuthTokens : null);
const currentRemoteUserSubject: BehaviorSubject<AuthTokens | null> = new BehaviorSubject<AuthTokens | null>(localStorage.getItem('currentRemoteUser') ? JSON.parse(localStorage.getItem('currentRemoteUser')!) as AuthTokens : null);
const API_URL = import.meta.env.VITE_CHRONOKEEP_API_URL;
const REMOTE_URL = import.meta.env.VITE_CHRONOKEEP_REMOTE_URL;

export const authenticationService = {
    login,
    refresh,
    logout,
    currentUser: currentUserSubject.asObservable(),
    get currentUserValue () { return currentUserSubject.value },
    currentRemoteUser: currentRemoteUserSubject.asObservable(),
    get currentRemoteUserValue() { return currentRemoteUserSubject.value }
};

function login(username: string, password: string, auth: string = "API") {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: username, password: password })
    };
    const url = auth === "REMOTE" ? REMOTE_URL : API_URL;
    const storageUser = auth === "REMOTE" ? 'currentRemoteUser' : 'currentUser';
    return fetch(url + 'account/login', requestOptions)
    .then(handleResponseNoLogout)
    .then(user => {
        if (Object.prototype.hasOwnProperty.call(user.data, 'access_token')) {
            const dta = user.data as AuthTokens
            localStorage.setItem(storageUser, JSON.stringify(dta));
            if (auth === "REMOTE") {
                currentRemoteUserSubject.next(dta);
            } else {
                currentUserSubject.next(dta);
            }
        }
        return user.data;
    });
}

function refresh(token: string, auth: string = "API") {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: token })
    };
    const url = auth === "REMOTE" ? REMOTE_URL : API_URL;
    const storageUser = auth === "REMOTE" ? 'currentRemoteUser' : 'currentUser';
    return fetch(url + 'account/refresh', requestOptions)
    .then(handleResponseNoLogout)
    .then(user => {
        if (Object.prototype.hasOwnProperty.call(user.data, 'access_token')) {
            const dta = user.data as AuthTokens
            localStorage.setItem(storageUser, JSON.stringify(dta));
            if (auth === "REMOTE") {
                currentRemoteUserSubject.next(dta);
            } else {
                currentUserSubject.next(dta);
            }
        }
        return user.data;
    });
}

function logout(auth: string) {
    let currentUser = currentUserSubject.value;
    let url = API_URL;
    let storageUser = 'currentUser';
    if (auth === "REMOTE") {
        currentUser = currentRemoteUserSubject.value;
        url = REMOTE_URL;
        storageUser = 'currentRemoteUser';
    }
    if (!currentUser) {
        return Promise.reject({ message: "unknown user", status: 401 })
    }
    // let the API know the user wants to log out
    const requestOptions = {
        method: 'POST',
        headers: authHeader(currentUser)
    };
    return fetch(url + 'account/logout', requestOptions)
    .then(response => {
        // remove user from local storage to log user out
        localStorage.removeItem(storageUser);
        if (auth === "REMOTE") {
            currentRemoteUserSubject.next(null);
        } else {
            currentUserSubject.next(null);
        }
        return response;
    });
}