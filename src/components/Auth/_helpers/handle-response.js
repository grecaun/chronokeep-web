import { authenticationService } from '../_services/authentication.service';

export function handleResponse(response) {
    return response.text().then(text => {
        const dataVal = text && JSON.parse(text);
        const data = { data: dataVal, status: response.status }
        if (!response.ok) {
            if ([401, 403].indexOf(response.status) !== -1) {
                // auto logout if 401 Unauthorized or 403 Forbidden response returned from api
                authenticationService.logout();
            }
            const message = (data.data && data.data.message) || response.statusText;
            const error = { message: message, status: response.status }
            return Promise.reject(error);
        }
        return data;
    });
}

export function handleResponseNoLogout(response) {
    return response.text().then(text => {
        const dataVal = text && JSON.parse(text);
        const data = { data: dataVal, status: response.status }
        if (!response.ok) {
            const message = (data.data && data.data.message) || response.statusText;
            const error = { message: message, status: response.status }
            return Promise.reject(error);
        }
        return data;
    });
}