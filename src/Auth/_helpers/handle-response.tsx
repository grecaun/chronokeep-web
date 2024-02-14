import { ErrorResponse, GetAccountResponse, GetAllAccountsResponse, GetKeysResponse, ModifyAccountResponse, ModifyKeyResponse } from '../../Interfaces/responses';
import { AuthTokens } from '../../Interfaces/types';
import { authenticationService } from '../_services/authentication.service';

export function handleResponse(response: Response, auth = "API") {
    return response.text().then(text => {
        const dataVal = JSON.parse(text) as ModifyKeyResponse | GetKeysResponse | GetAccountResponse | GetAllAccountsResponse | ModifyAccountResponse | ErrorResponse;
        const data: { 
                    data: ModifyKeyResponse | GetKeysResponse | GetAccountResponse | GetAllAccountsResponse | ModifyAccountResponse | ErrorResponse | AuthTokens,
                    status: number
                } = { data: dataVal, status: response.status }
        if (!response.ok) {
            if ([401, 403].indexOf(response.status) !== -1) {
                // auto logout if 401 Unauthorized or 403 Forbidden response returned from api
                authenticationService.logout(auth).catch(()=>{});
            }
            const dta = data.data as ErrorResponse
            const message = (dta && dta.message) || response.statusText;
            const error = { message: message, status: response.status }
            return Promise.reject(error);
        }
        return data;
    });
}

export function handleResponseNoLogout(response: Response) {
    return response.text().then(text => {
        const dataVal = JSON.parse(text) as ModifyKeyResponse | GetKeysResponse | GetAccountResponse | GetAllAccountsResponse | ModifyAccountResponse | ErrorResponse;
        const data: { 
                    data: ModifyKeyResponse | GetKeysResponse | GetAccountResponse | GetAllAccountsResponse | ModifyAccountResponse | ErrorResponse | AuthTokens,
                    status: number
                } = { data: dataVal, status: response.status }
        if (!response.ok) {
            const dta = data.data as ErrorResponse
            const message = (dta && dta.message) || response.statusText;
            const error = { message: message, status: response.status }
            return Promise.reject(error);
        }
        return data;
    });
}