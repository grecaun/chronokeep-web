import { describe, expect, it, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { fetchBody, jsonResponse, makeTimeResult, mockFetch } from '../test/helpers'
import { EventsLoader } from './events'
import { ResultsLoader } from './results'
import { PersonLoader } from './person'
import { SubscribeLoader } from './subscribe'
import { UnsubscribeLoader } from './unsubscribe'
import { SendAddSmsSubscription, SendRemoveSmsSubscription } from './sms_subscription'
import { RankingType } from '../Interfaces/types'

const apiHeaders = { 'Content-Type': 'application/json', 'Authorization': 'Bearer test-access-token' }

function quietConsole() {
    vi.spyOn(console, 'error').mockImplementation(() => {})
}

describe('EventsLoader', () => {
    it('loads events', async () => {
        const events = [{ name: 'Race', slug: 'race' }]
        const fetch = mockFetch(jsonResponse(200, { events }))
        const { result } = renderHook(() => EventsLoader())

        expect(result.current.loading).toBe(true)
        await waitFor(() => expect(result.current.loading).toBe(false))

        expect(result.current).toMatchObject({ status: 200, error: false, events })
        expect(fetch).toHaveBeenCalledWith('https://api.test/event/all', { headers: apiHeaders })
    })

    it('reports the API error message', async () => {
        mockFetch(jsonResponse(500, { message: 'Database down' }))
        const { result } = renderHook(() => EventsLoader())

        await waitFor(() => expect(result.current.loading).toBe(false))
        expect(result.current).toMatchObject({ status: 500, error: true, message: 'Database down', events: [] })
    })

    it('flags an error when fetch fails', async () => {
        quietConsole()
        mockFetch(new Error('offline'))
        const { result } = renderHook(() => EventsLoader())

        await waitFor(() => expect(result.current.error).toBe(true))
    })
})

describe('ResultsLoader', () => {
    function resultsResponse(rankingType: string) {
        return {
            count: 2,
            event: { name: 'Race', slug: 'race' },
            years: [{ year: '2024' }],
            event_year: { year: '2024', ranking_type: rankingType },
            results: { '5K': [makeTimeResult()] },
            participants: [
                { first: 'Jane', last: 'Doe' },
                { first: '', last: '' },
            ],
            distances: [{ name: '5K' }],
        }
    }

    it('loads results and drops nameless participants', async () => {
        const fetch = mockFetch(jsonResponse(200, resultsResponse('gun')))
        const { result } = renderHook(() => ResultsLoader({ slug: 'race', year: '2024' }, 'results'))

        await waitFor(() => expect(result.current.state.loading).toBe(false))

        const state = result.current.state
        expect(state.error).toBe(false)
        expect(state.count).toBe(2)
        expect(state.year).toEqual({ year: '2024', ranking_type: 'gun' })
        expect(state.results['5K']).toHaveLength(1)
        expect(state.participants).toEqual([{ first: 'Jane', last: 'Doe' }])
        expect(state.default_ranking_type).toBe(RankingType.Gun)
        expect(fetch.mock.calls[0][0]).toBe('https://api.test/results')
        expect(fetchBody(fetch)).toEqual({ slug: 'race', year: '2024' })
    })

    it.each([
        ['chip', RankingType.Chip],
        ['mixed', RankingType.Mixed],
        ['something else', RankingType.Gun],
    ])('maps ranking type %s', async (type, expected) => {
        mockFetch(jsonResponse(200, resultsResponse(type)))
        const { result } = renderHook(() => ResultsLoader({ slug: 'race' }, 'results'))

        await waitFor(() => expect(result.current.state.loading).toBe(false))
        expect(result.current.state.default_ranking_type).toBe(expected)
    })

    it('reports a not found event', async () => {
        mockFetch(jsonResponse(404, { message: 'Event Not Found' }))
        const { result } = renderHook(() => ResultsLoader({ slug: 'nope' }, 'results'))

        await waitFor(() => expect(result.current.state.loading).toBe(false))
        expect(result.current.state).toMatchObject({ status: 404, error: true, message: 'Event Not Found' })
    })
})

describe('PersonLoader', () => {
    it('defaults the page to results', () => {
        mockFetch(jsonResponse(200, {}))
        const { result } = renderHook(() => PersonLoader({ slug: 'race' }))
        expect(result.current.page).toBe('results')
    })

    it('loads a person', async () => {
        const body = {
            event: { name: 'Race' },
            year: { year: '2024' },
            results: [makeTimeResult()],
            person: { bib: '100', first: 'Jane', last: 'Doe' },
            single_distance: true,
            segments: [],
            distance: { name: '5K', certification: 'cert' },
        }
        const fetch = mockFetch(jsonResponse(200, body))
        const { result } = renderHook(() => PersonLoader({ slug: 'race', year: '2024', bib: '100', page: 'awards' }))

        await waitFor(() => expect(result.current.loading).toBe(false))

        expect(result.current.page).toBe('awards')
        expect(result.current.person).toEqual(body.person)
        expect(result.current.single_distance).toBe(true)
        expect(result.current.cert_distance).toEqual(body.distance)
        expect(fetch.mock.calls[0][0]).toBe('https://api.test/results/bib')
        expect(fetchBody(fetch)).toEqual({ slug: 'race', year: '2024', bib: '100' })
    })

    it('reports errors', async () => {
        mockFetch(jsonResponse(404, { message: 'Person Not Found' }))
        const { result } = renderHook(() => PersonLoader({ slug: 'race', bib: '1' }))

        await waitFor(() => expect(result.current.loading).toBe(false))
        expect(result.current).toMatchObject({ status: 404, error: true, message: 'Person Not Found' })
    })
})

describe.each([
    ['SubscribeLoader', SubscribeLoader, 'subscribe', 'https://api.test/blocked/emails/unblock'],
    ['UnsubscribeLoader', UnsubscribeLoader, 'unsubscribe', 'https://api.test/blocked/emails/add'],
])('%s', (_name, loader, page, url) => {
    it('succeeds on a 200 response', async () => {
        const fetch = mockFetch(jsonResponse(200))
        const { result } = renderHook(() => loader({ email: 'me@example.com' }))

        expect(result.current.page).toBe(page)
        expect(result.current.email).toBe('me@example.com')
        await waitFor(() => expect(result.current.loading).toBe(false))

        expect(result.current).toMatchObject({ status: 200, success: true, error: false })
        expect(fetch.mock.calls[0][0]).toBe(url)
        expect(fetchBody(fetch)).toEqual({ email: 'me@example.com' })
    })

    it('reports the error message on failure', async () => {
        mockFetch(jsonResponse(400, { message: 'Bad Email' }))
        const { result } = renderHook(() => loader({ email: 'bad' }))

        await waitFor(() => expect(result.current.loading).toBe(false))
        expect(result.current).toMatchObject({ status: 400, success: false, error: true, message: 'Bad Email' })
    })

    it('uses an empty email when none is given', () => {
        mockFetch(jsonResponse(200))
        const { result } = renderHook(() => loader({}))
        expect(result.current.email).toBe('')
    })
})

describe('sms subscriptions', () => {
    it('adds a subscription', async () => {
        const fetch = mockFetch(jsonResponse(200))

        const out = await SendAddSmsSubscription('race', '2024', '100', 'Jane', 'Doe', '5551234567')

        expect(out).toBe(true)
        expect(fetch.mock.calls[0][0]).toBe('https://api.test/sms/add')
        expect((fetch.mock.calls[0][1] as RequestInit).headers).toEqual(apiHeaders)
        expect(fetchBody(fetch)).toEqual({ slug: 'race', year: '2024', bib: '100', first: 'Jane', last: 'Doe', phone: '5551234567' })
    })

    it('removes a subscription without an auth header', async () => {
        const fetch = mockFetch(jsonResponse(200))

        const out = await SendRemoveSmsSubscription('race', '2024', '5551234567')

        expect(out).toBe(true)
        expect(fetch.mock.calls[0][0]).toBe('https://api.test/sms/remove')
        expect((fetch.mock.calls[0][1] as RequestInit).headers).toEqual({ 'Content-Type': 'application/json' })
        expect(fetchBody(fetch)).toEqual({ slug: 'race', year: '2024', phone: '5551234567' })
    })

    it.each([
        ['a non-200 status', jsonResponse(400)],
        ['a network error', new Error('offline')],
    ])('returns false on %s', async (_name, response) => {
        mockFetch(response, response)
        expect(await SendAddSmsSubscription('race', '2024', '1', 'a', 'b', 'c')).toBe(false)
        expect(await SendRemoveSmsSubscription('race', '2024', 'c')).toBe(false)
    })
})
