import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchBody, jsonResponse, mockFetch } from '../../test/helpers'

const tokens = { access_token: 'access', refresh_token: 'refresh' }

// The service reads localStorage when the module loads, so load a fresh copy each test.
async function loadService() {
    vi.resetModules()
    const mod = await import('./authentication.service')
    return mod.authenticationService
}

beforeEach(() => {
    localStorage.clear()
})

describe('authenticationService initial state', () => {
    it('starts logged out with empty storage', async () => {
        const svc = await loadService()
        expect(svc.currentUserValue).toBeNull()
        expect(svc.currentRemoteUserValue).toBeNull()
    })

    it('restores users from localStorage', async () => {
        localStorage.setItem('currentUser', JSON.stringify(tokens))
        localStorage.setItem('currentRemoteUser', JSON.stringify({ ...tokens, access_token: 'remote' }))
        const svc = await loadService()
        expect(svc.currentUserValue).toEqual(tokens)
        expect(svc.currentRemoteUserValue?.access_token).toBe('remote')
    })
})

describe('login', () => {
    it('posts credentials to the API and stores the tokens', async () => {
        const fetch = mockFetch(jsonResponse(200, tokens))
        const svc = await loadService()
        const seen: unknown[] = []
        svc.currentUser.subscribe(u => seen.push(u))

        const out = await svc.login('me@example.com', 'pw')

        expect(out).toEqual(tokens)
        expect(fetch.mock.calls[0][0]).toBe('https://api.test/account/login')
        expect(fetchBody(fetch)).toEqual({ email: 'me@example.com', password: 'pw' })
        expect(JSON.parse(localStorage.getItem('currentUser')!)).toEqual(tokens)
        expect(svc.currentUserValue).toEqual(tokens)
        expect(svc.currentRemoteUserValue).toBeNull()
        expect(seen).toEqual([null, tokens])
    })

    it('uses the remote URL and storage for REMOTE logins', async () => {
        const fetch = mockFetch(jsonResponse(200, tokens))
        const svc = await loadService()

        await svc.login('me@example.com', 'pw', 'REMOTE')

        expect(fetch.mock.calls[0][0]).toBe('https://remote.test/account/login')
        expect(localStorage.getItem('currentUser')).toBeNull()
        expect(JSON.parse(localStorage.getItem('currentRemoteUser')!)).toEqual(tokens)
        expect(svc.currentRemoteUserValue).toEqual(tokens)
        expect(svc.currentUserValue).toBeNull()
    })

    it('does not store anything when the response has no token', async () => {
        mockFetch(jsonResponse(200, { message: 'weird' }))
        const svc = await loadService()

        const out = await svc.login('me@example.com', 'pw')

        expect(out).toEqual({ message: 'weird' })
        expect(localStorage.getItem('currentUser')).toBeNull()
        expect(svc.currentUserValue).toBeNull()
    })

    it('rejects on bad credentials', async () => {
        mockFetch(jsonResponse(401, { message: 'Invalid Credentials' }))
        const svc = await loadService()

        await expect(svc.login('me@example.com', 'bad')).rejects.toMatchObject({ message: 'Invalid Credentials', status: 401 })
        expect(svc.currentUserValue).toBeNull()
    })
})

describe('refresh', () => {
    it('sends the refresh token and replaces the stored tokens', async () => {
        localStorage.setItem('currentUser', JSON.stringify(tokens))
        const newTokens = { access_token: 'new', refresh_token: 'new-refresh' }
        const fetch = mockFetch(jsonResponse(200, newTokens))
        const svc = await loadService()

        await svc.refresh('refresh')

        expect(fetch.mock.calls[0][0]).toBe('https://api.test/account/refresh')
        expect(fetchBody(fetch)).toEqual({ refresh_token: 'refresh' })
        expect(svc.currentUserValue).toEqual(newTokens)
        expect(JSON.parse(localStorage.getItem('currentUser')!)).toEqual(newTokens)
    })

    it('refreshes the remote user for REMOTE', async () => {
        const fetch = mockFetch(jsonResponse(200, tokens))
        const svc = await loadService()

        await svc.refresh('refresh', 'REMOTE')

        expect(fetch.mock.calls[0][0]).toBe('https://remote.test/account/refresh')
        expect(svc.currentRemoteUserValue).toEqual(tokens)
    })
})

describe('logout', () => {
    it('rejects when nobody is logged in', async () => {
        const fetch = mockFetch()
        const svc = await loadService()

        await expect(svc.logout('API')).rejects.toMatchObject({ message: 'unknown user', status: 401 })
        expect(fetch).not.toHaveBeenCalled()
    })

    it('tells the API and clears the stored user', async () => {
        localStorage.setItem('currentUser', JSON.stringify(tokens))
        localStorage.setItem('currentRemoteUser', JSON.stringify(tokens))
        const fetch = mockFetch(jsonResponse(200))
        const svc = await loadService()

        const res = await svc.logout('API')

        expect(res.status).toBe(200)
        expect(fetch.mock.calls[0][0]).toBe('https://api.test/account/logout')
        const opts = fetch.mock.calls[0][1] as RequestInit
        expect(opts.headers).toMatchObject({ Authorization: 'Bearer access' })
        expect(localStorage.getItem('currentUser')).toBeNull()
        expect(svc.currentUserValue).toBeNull()
        // the remote user is left alone
        expect(svc.currentRemoteUserValue).toEqual(tokens)
    })

    it('clears the stored user even if the server returns an error status', async () => {
        localStorage.setItem('currentRemoteUser', JSON.stringify(tokens))
        const fetch = mockFetch(jsonResponse(500, { message: 'oops' }))
        const svc = await loadService()

        const res = await svc.logout('REMOTE')

        expect(res.status).toBe(500)
        expect(fetch.mock.calls[0][0]).toBe('https://remote.test/account/logout')
        expect(localStorage.getItem('currentRemoteUser')).toBeNull()
        expect(svc.currentRemoteUserValue).toBeNull()
    })
})
