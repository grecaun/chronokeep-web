import { authenticationService } from '../_services/authentication.service';

export function authHeader() {
    // return authorization header with jwt token
    const currentUser = authenticationService.currentUserValue;
    if (currentUser && currentUser.access_token) {
        return { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentUser.access_token}`
        };
    } else {
        return {
            "Content-Type": "application/json",
        };
    }
}