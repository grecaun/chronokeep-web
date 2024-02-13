import { BehaviorSubject } from 'rxjs';
import { authHeader } from '../_helpers/auth-header';
import { handleResponseNoLogout } from '../_helpers/handle-response';
import { AuthTokens } from '../../Interfaces/types';

const currentUserSubject: BehaviorSubject<AuthTokens | null> = new BehaviorSubject(JSON.parse(localStorage.getItem('currentUser')!));
const currentRemoteUserSubject: BehaviorSubject<AuthTokens | null> = new BehaviorSubject(JSON.parse(localStorage.getItem('currentRemoteUser')!));
const API_URL = import.meta.env.VITE_CHRONOKEEP_API_URL;
const REMOTE_URL = import.meta.env.VITE_CHRONOKEEP_REMOTE_URL;

export const authenticationService = {
    login,
    refresh,
    logout,
    currentUser: currentUserSubject.asObservable(),
    get currentUserValue () { return currentUserSubject.value },
    currentRemoteUser: currentRemoteUserSubject.asObservable,
    get currentRemoteUserValue() { return currentRemoteUserSubject.value }
};

function login(username: string, password: string, auth: string = "API") {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: username, password: password })
    };
    var url = auth === "REMOTE" ? REMOTE_URL : API_URL;
    var storageUser = auth === "REMOTE" ? 'currentRemoteUser' : 'currentUser';
    return fetch(url + 'account/login', requestOptions)
    .then(handleResponseNoLogout)
    .then(user => {
        localStorage.setItem(storageUser, JSON.stringify(user.data));
        if (auth === "REMOTE") {
            currentRemoteUserSubject.next(user.data);
        } else {
            currentUserSubject.next(user.data);
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
    var url = auth === "REMOTE" ? REMOTE_URL : API_URL;
    var storageUser = auth === "REMOTE" ? 'currentRemoteUser' : 'currentUser';
    return fetch(url + 'account/refresh', requestOptions)
    .then(handleResponseNoLogout)
    .then(user => {
        localStorage.setItem(storageUser, JSON.stringify(user.data));
        if (auth === "REMOTE") {
            currentRemoteUserSubject.next(user.data);
        } else {
            currentUserSubject.next(user.data);
        }
        return user.data;
    });
}

function logout(auth = "API") {
    var currentUser = currentUserSubject.value;
    var url = API_URL;
    var storageUser = 'currentUser';
    if (auth === "REMOTE") {
        currentUser = currentRemoteUserSubject.value;
        url = REMOTE_URL;
        storageUser = 'currentRemoteUser';
    }
    // let the API know the user wants to log out
    const requestOptions: any = {
        method: 'POST',
        headers: authHeader(currentUser!)
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