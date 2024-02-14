import { AuthTokens } from "../../Interfaces/types";

export function authHeader(currentUser: AuthTokens): { [key: string]: string } {
    // return authorization header with jwt token
    if (currentUser && currentUser.access_token) {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentUser.access_token}`
        };
    } else {
        return {
            'Content-Type': 'application/json',
        };
    }
}