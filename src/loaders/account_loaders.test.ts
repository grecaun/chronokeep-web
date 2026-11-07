import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { jsonResponse, mockFetch } from '../test/helpers'

const tokens = { access_token: 'access', refresh_token: 'refresh' }

// The auth service reads localStorage at import, so each test gets fresh modules.
beforeEach(() => {
    vi.resetModules()
    localStorage.clear()
})

describe('AccountLoader', () => {
    it('loads the account and sorts keys by name descending then value', async () => {
        localStorage.setItem('currentUser', JSON.stringify(tokens))
        const fetch = mockFetch(jsonResponse(200, {
            account: { name: 'Me', email: 'me@example.com', type: 'admin' },
            keys: [
                { name: 'Alpha', value: 'b' },
                { name: 'Zulu', value: 'z' },
                { name: 'Alpha', value: 'a' },
            ],
            events: null,
            linked: [{ name: 'Other', email: 'o@example.com', type: 'free' }],
        }))
        const { AccountLoader } = await import('./account')
        const { result } = renderHook(() => AccountLoader('account'))

        await waitFor(() => expect(result.current.state.loading).toBe(false))

        const state = result.current.state
        expect(state.error).toBe(false)
        expect(state.status).toBe(200)
        expect(state.account.name).toBe('Me')
        expect(state.keys.map(k => `${k.name}:${k.value}`)).toEqual(['Zulu:z', 'Alpha:a', 'Alpha:b'])
        expect(state.events).toEqual([])
        expect(state.linked).toHaveLength(1)
        expect(fetch.mock.calls[0][0]).toBe('https://api.test/account')
    })

    it('uses the remote server for the remote page', async () => {
        localStorage.setItem('currentRemoteUser', JSON.stringify(tokens))
        const fetch = mockFetch(jsonResponse(200, { account: { name: 'Remote' }, keys: null }))
        const { AccountLoader } = await import('./account')
        const { result } = renderHook(() => AccountLoader('remote'))

        await waitFor(() => expect(result.current.state.loading).toBe(false))
        expect(result.current.state.keys).toEqual([])
        expect(fetch.mock.calls[0][0]).toBe('https://remote.test/account')
    })

    it('flags an error when the request fails', async () => {
        localStorage.setItem('currentUser', JSON.stringify(tokens))
        mockFetch(jsonResponse(500, { message: 'Server Error' }))
        const { AccountLoader } = await import('./account')
        const { result } = renderHook(() => AccountLoader('account'))

        await waitFor(() => expect(result.current.state.error).toBe(true))
        expect(result.current.state).toMatchObject({ status: 500, message: 'Server Error' })
    })
})

describe('CheckinLoader', () => {
    it('loads participants sorted by last then first name', async () => {
        localStorage.setItem('currentUser', JSON.stringify(tokens))
        const fetch = mockFetch(jsonResponse(200, {
            event: { name: 'Race' },
            year: { year: '2024' },
            participants: [
                { first: 'Zed', last: 'Smith' },
                { first: 'Amy', last: 'Smith' },
                { first: 'Bob', last: 'Jones' },
            ],
        }))
        const { CheckinLoader } = await import('./checkin')
        const { result } = renderHook(() => CheckinLoader({ slug: 'race', year: '2024' }, 'checkin'))

        await waitFor(() => expect(result.current.state.loading).toBe(false))

        const state = result.current.state
        expect(state.participants.map(p => `${p.first} ${p.last}`)).toEqual(['Bob Jones', 'Amy Smith', 'Zed Smith'])
        expect(state.event).toEqual({ name: 'Race' })
        expect(state.year).toEqual({ year: '2024' })
        expect(fetch.mock.calls[0][0]).toBe('https://api.test/r/participants')
    })

    it('reports a non-participant response as an error', async () => {
        localStorage.setItem('currentUser', JSON.stringify(tokens))
        mockFetch(jsonResponse(200, { message: 'Unexpected' }))
        const { CheckinLoader } = await import('./checkin')
        const { result } = renderHook(() => CheckinLoader({ slug: 'race', year: '2024' }, 'checkin'))

        await waitFor(() => expect(result.current.state.loading).toBe(false))
        expect(result.current.state).toMatchObject({ error: true, message: 'Unexpected' })
    })
})

describe('LogoutLoader', () => {
    it('logs out the API user', async () => {
        localStorage.setItem('currentUser', JSON.stringify(tokens))
        const fetch = mockFetch(jsonResponse(200))
        const { LogoutLoader } = await import('./logout')
        const { result } = renderHook(() => LogoutLoader('account'))

        await waitFor(() => expect(result.current.loading).toBe(false))
        expect(result.current).toMatchObject({ status: 200, message: null })
        expect(fetch.mock.calls[0][0]).toBe('https://api.test/account/logout')
        expect(localStorage.getItem('currentUser')).toBeNull()
    })

    it('logs out the remote user', async () => {
        localStorage.setItem('currentRemoteUser', JSON.stringify(tokens))
        const fetch = mockFetch(jsonResponse(200))
        const { LogoutLoader } = await import('./logout')
        const { result } = renderHook(() => LogoutLoader('remote'))

        await waitFor(() => expect(result.current.loading).toBe(false))
        expect(fetch.mock.calls[0][0]).toBe('https://remote.test/account/logout')
    })

    it('stays quiet when nobody is logged in', async () => {
        const errors = vi.spyOn(console, 'error').mockImplementation(() => {})
        mockFetch()
        const { LogoutLoader } = await import('./logout')
        const { result } = renderHook(() => LogoutLoader('account'))

        await waitFor(() => expect(result.current.loading).toBe(false))
        expect(result.current.message).toBeNull()
        expect(errors).not.toHaveBeenCalled()
    })

    it('reports unexpected errors from the server', async () => {
        localStorage.setItem('currentUser', JSON.stringify(tokens))
        const errors = vi.spyOn(console, 'error').mockImplementation(() => {})
        mockFetch(jsonResponse(500, { message: 'Server Error', status: 500 }))
        const { LogoutLoader } = await import('./logout')
        const { result } = renderHook(() => LogoutLoader('account'))

        await waitFor(() => expect(result.current.message).toBe('Server Error'))
        expect(result.current.status).toBe(500)
        expect(errors).toHaveBeenCalled()
    })

    it('ignores 401 errors from the server', async () => {
        localStorage.setItem('currentUser', JSON.stringify(tokens))
        mockFetch(jsonResponse(401, { message: 'Expired', status: 401 }))
        const { LogoutLoader } = await import('./logout')
        const { result } = renderHook(() => LogoutLoader('account'))

        await waitFor(() => expect(result.current.status).toBe(401))
        expect(result.current.message).toBeNull()
    })
})
