import { describe, expect, it } from 'vitest'
import { authHeader } from './auth-header'
import { AuthTokens } from '../../Interfaces/types'

describe('authHeader', () => {
    it('adds a bearer token when the user has an access token', () => {
        expect(authHeader({ access_token: 'abc', refresh_token: 'def' })).toEqual({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer abc',
        })
    })

    it('omits the authorization header without an access token', () => {
        expect(authHeader({ access_token: '', refresh_token: 'def' })).toEqual({
            'Content-Type': 'application/json',
        })
        expect(authHeader(null as unknown as AuthTokens)).toEqual({
            'Content-Type': 'application/json',
        })
    })
})
