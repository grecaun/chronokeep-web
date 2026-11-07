import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchBody, jsonResponse, mockFetch } from '../../test/helpers'
import { Key, Participant } from '../../Interfaces/types'

const tokens = { access_token: 'access', refresh_token: 'refresh' }
const remoteTokens = { access_token: 'remote-access', refresh_token: 'remote-refresh' }

type UserService = Awaited<ReturnType<typeof loadServices>>['userService']

async function loadServices() {
    vi.resetModules()
    const { userService } = await import('./user.service')
    const { authenticationService } = await import('./authentication.service')
    return { userService, authenticationService }
}

function requestOf(fetch: ReturnType<typeof vi.fn>, call = 0) {
    const [url, opts] = fetch.mock.calls[call] as [string, RequestInit]
    return { url, method: opts.method, headers: opts.headers as Record<string, string> }
}

beforeEach(() => {
    localStorage.clear()
    localStorage.setItem('currentUser', JSON.stringify(tokens))
    localStorage.setItem('currentRemoteUser', JSON.stringify(remoteTokens))
})

describe('userService requests', () => {
    const key: Key = { name: 'Key', value: 'k1', type: 'read', allowed_hosts: '', valid_until: '' }
    const participant = { id: '1', first: 'Jane', last: 'Doe' } as unknown as Participant

    it.each([
        ['getAPIKeys', (s: UserService) => s.getAPIKeys('me@example.com', 'API'), 'https://api.test/key', 'POST', { email: 'me@example.com' }],
        ['deleteAPIKey', (s: UserService) => s.deleteAPIKey('k1', 'API'), 'https://api.test/key/delete', 'DELETE', { key: 'k1' }],
        ['updateAPIKey', (s: UserService) => s.updateAPIKey(key, 'API'), 'https://api.test/key/update', 'PUT', { key }],
        ['addAPIKey', (s: UserService) => s.addAPIKey(key, 'API'), 'https://api.test/key/add', 'POST', { key }],
        ['getAccountInfo', (s: UserService) => s.getAccountInfo('API'), 'https://api.test/account', 'POST', {}],
        ['updateAccountInfo', (s: UserService) => s.updateAccountInfo('Me', 'me@example.com', 'admin', 'API'), 'https://api.test/account/update', 'PUT', { account: { name: 'Me', email: 'me@example.com', type: 'admin' } }],
        ['addAccount', (s: UserService) => s.addAccount('Me', 'me@example.com', 'admin', 'pw', 'API'), 'https://api.test/account/add', 'POST', { account: { name: 'Me', email: 'me@example.com', type: 'admin' }, password: 'pw' }],
        ['addLinkedAccount', (s: UserService) => s.addLinkedAccount('o@example.com'), 'https://api.test/account/link', 'PUT', { email: 'o@example.com' }],
        ['removeLinkedAccount', (s: UserService) => s.removeLinkedAccount('o@example.com'), 'https://api.test/account/unlink', 'PUT', { email: 'o@example.com' }],
        ['getParticipants', (s: UserService) => s.getParticipants('race', '2024'), 'https://api.test/r/participants', 'POST', { slug: 'race', year: '2024' }],
        ['updateParticipant', (s: UserService) => s.updateParticipant('race', '2024', participant), 'https://api.test/r/participants/update', 'POST', { slug: 'race', year: '2024', participant }],
        ['addParticipant', (s: UserService) => s.addParticipant('race', '2024', participant), 'https://api.test/r/participants/add', 'POST', { slug: 'race', year: '2024', participant }],
    ])('%s sends the right request', async (_name, call, url, method, body) => {
        const fetch = mockFetch(jsonResponse(200, { ok: true }))
        const { userService } = await loadServices()

        const out = await call(userService)

        expect(out).toEqual({ data: { ok: true }, status: 200 })
        expect(requestOf(fetch)).toEqual({
            url,
            method,
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer access' },
        })
        expect(fetchBody(fetch)).toEqual(body)
    })

    it('uses the remote URL and remote token for REMOTE calls', async () => {
        const fetch = mockFetch(jsonResponse(200, { account: {} }))
        const { userService } = await loadServices()

        await userService.getAccountInfo('REMOTE')

        const req = requestOf(fetch)
        expect(req.url).toBe('https://remote.test/account')
        expect(req.headers.Authorization).toBe('Bearer remote-access')
    })

    it('sends an empty body to getAPIKeys when email is null', async () => {
        const fetch = mockFetch(jsonResponse(200, { keys: [] }))
        const { userService } = await loadServices()

        await userService.getAPIKeys(null as unknown as string, 'API')

        expect(fetchBody(fetch)).toEqual({})
    })

    it.each([
        ['changePassword', 'https://api.test/account/password', { old_password: 'old', new_password: 'new', email: 'me@example.com' }],
        ['changeEmail', 'https://api.test/account/email', { old_email: 'old@example.com', new_email: 'new@example.com' }],
    ])('%s logs the user out afterwards', async (name, url, body) => {
        const fetch = mockFetch(jsonResponse(200, {}), jsonResponse(200))
        const { userService, authenticationService } = await loadServices()

        if (name === 'changePassword') {
            await userService.changePassword('old', 'new', 'me@example.com', 'API')
        } else {
            await userService.changeEmail('old@example.com', 'new@example.com', 'API')
        }

        expect(requestOf(fetch, 0).url).toBe(url)
        expect(fetchBody(fetch, 0)).toEqual(body)
        expect(requestOf(fetch, 1).url).toBe('https://api.test/account/logout')
        expect(authenticationService.currentUserValue).toBeNull()
    })
})

describe('token refresh', () => {
    it('refreshes an expired token and retries the request', async () => {
        const newTokens = { access_token: 'new-access', refresh_token: 'new-refresh' }
        const fetch = mockFetch(
            jsonResponse(401, { message: 'expired' }),
            jsonResponse(200, newTokens),
            jsonResponse(200, { account: { name: 'Me' } }),
        )
        const { userService, authenticationService } = await loadServices()

        const out = await userService.getAccountInfo('API')

        expect(out).toEqual({ data: { account: { name: 'Me' } }, status: 200 })
        expect(fetch).toHaveBeenCalledTimes(3)
        expect(requestOf(fetch, 1).url).toBe('https://api.test/account/refresh')
        expect(fetchBody(fetch, 1)).toEqual({ refresh_token: 'refresh' })
        // the retry uses the new access token
        expect(requestOf(fetch, 2).url).toBe('https://api.test/account')
        expect(requestOf(fetch, 2).headers.Authorization).toBe('Bearer new-access')
        expect(authenticationService.currentUserValue).toEqual(newTokens)
    })

    it('refreshes the remote token for REMOTE requests', async () => {
        const newTokens = { access_token: 'new-remote', refresh_token: 'x' }
        const fetch = mockFetch(
            jsonResponse(403, { message: 'forbidden' }),
            jsonResponse(200, newTokens),
            jsonResponse(200, { keys: [] }),
        )
        const { userService } = await loadServices()

        await userService.getAPIKeys('me@example.com', 'REMOTE')

        expect(requestOf(fetch, 1).url).toBe('https://remote.test/account/refresh')
        expect(fetchBody(fetch, 1)).toEqual({ refresh_token: 'remote-refresh' })
        expect(requestOf(fetch, 2).headers.Authorization).toBe('Bearer new-remote')
    })

    it('logs out when the refresh token is rejected', async () => {
        const fetch = mockFetch(
            jsonResponse(401, { message: 'expired' }),
            jsonResponse(401, { message: 'refresh expired' }),
            jsonResponse(200),
        )
        const { userService, authenticationService } = await loadServices()

        await expect(userService.getAccountInfo('API')).rejects.toEqual({ message: 'refresh expired', status: 401 })

        expect(requestOf(fetch, 2).url).toBe('https://api.test/account/logout')
        await vi.waitFor(() => expect(authenticationService.currentUserValue).toBeNull())
    })

    it('does not refresh on other errors', async () => {
        const fetch = mockFetch(jsonResponse(500, { message: 'Server Error' }))
        const { userService } = await loadServices()

        await expect(userService.getAccountInfo('API')).rejects.toEqual({ message: 'Server Error', status: 500 })
        expect(fetch).toHaveBeenCalledTimes(1)
    })

    it('does not refresh without a refresh token', async () => {
        localStorage.setItem('currentUser', JSON.stringify({ access_token: 'access', refresh_token: '' }))
        const fetch = mockFetch(jsonResponse(401, { message: 'expired' }))
        const { userService } = await loadServices()

        await expect(userService.getAccountInfo('API')).rejects.toEqual({ message: 'expired', status: 401 })
        expect(fetch).toHaveBeenCalledTimes(1)
    })
})
