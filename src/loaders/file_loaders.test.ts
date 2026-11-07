import { describe, expect, it, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { fetchBody, jsonResponse, makeTimeResult, mockFetch } from '../test/helpers'
import { CSVLoader } from './csv'
import { MultiResultsLoader } from './multi_results'
import { DoubleResultsLoader } from './double_results'
import { DoubleYear, SeriesYear } from '../Interfaces/types'

function quietConsole() {
    vi.spyOn(console, 'error').mockImplementation(() => {})
}

describe('CSVLoader', () => {
    it('parses previous standings from the csv', async () => {
        const csv = [
            'First,Last,Category,Highest Score,Tiger Score,Seward Score',
            'Jane,Doe,YTP Female 8&U,10,20,30',
            'John,Smith,YTP Male 9-10,1,2,3',
            'Sam,Lee,YTP Nonbinary 15-16,4,5,6',
            'Kid,NoAge,YTP Unknown,7,8,9',
            ',Blank,YTP Female 11-12,0,0,0',
        ].join('\n')
        const fetch = mockFetch(new Response(csv, { status: 200 }))
        const { result } = renderHook(() => CSVLoader('https://files.test/ytp.csv'))

        await waitFor(() => expect(result.current.state.csv_loaded).toBe(true))

        const standings = result.current.state.prev_standings
        expect(fetch).toHaveBeenCalledWith('https://files.test/ytp.csv')
        expect(Object.keys(standings)).toEqual(['Jane Doe', 'John Smith', 'Sam Lee', 'Kid NoAge'])
        expect(standings['Jane Doe']).toEqual({
            highest_score: 10, tiger_score: 20, seward_score: 30,
            age: 8, gender: 'F', age_group: 'Female 8&U',
        })
        expect(standings['John Smith']).toMatchObject({ age: 10, gender: 'M', age_group: 'Male 9-10' })
        expect(standings['Sam Lee']).toMatchObject({ age: 16, gender: 'X' })
        expect(standings['Kid NoAge']).toMatchObject({ age: 140, gender: '', age_group: '' })
    })

    it('defaults missing score columns to zero', async () => {
        mockFetch(new Response('first,last\nJane,Doe', { status: 200 }))
        const { result } = renderHook(() => CSVLoader('x'))

        await waitFor(() => expect(result.current.state.prev_standings['Jane Doe']).toBeDefined())
        expect(result.current.state.prev_standings['Jane Doe']).toMatchObject({
            highest_score: 0, tiger_score: 0, seward_score: 0, age: 140,
        })
    })

    it('marks the csv loaded with no standings when the file is missing', async () => {
        mockFetch(new Response('', { status: 404 }))
        const { result } = renderHook(() => CSVLoader('x'))

        await waitFor(() => expect(result.current.state.csv_loaded).toBe(true))
        expect(result.current.state.prev_standings).toEqual({})
    })
})

describe('MultiResultsLoader', () => {
    const years: SeriesYear[] = [
        { display_year: 2023, series: [{ name: 'S', best: 1, distances: [{ year: '2023', name: '5K', value: 5, type: 'km' }] }] },
        {
            display_year: 2024, series: [{
                name: 'S', best: 2, distances: [
                    { year: '2024a', name: '5K', value: 5, type: 'km' },
                    { year: '2024b', name: '10K', value: 10, type: 'km' },
                    { year: '2024a', name: 'Half', value: 13.1, type: 'mi' },
                ],
            }],
        },
    ]

    it('picks the newest year and loads results for its event years', async () => {
        const fetch = mockFetch(
            jsonResponse(200, years),
            jsonResponse(200, { event: { name: 'Series' }, results: { '2024a': {} } }),
        )
        const { result } = renderHook(() => MultiResultsLoader({ slug: 'series' }, 'series'))

        await waitFor(() => expect(result.current.state.loading).toBe(false))

        const state = result.current.state
        expect(state.selected_year?.display_year).toBe(2024)
        expect(state.event).toEqual({ name: 'Series' })
        expect(fetch.mock.calls[0][0]).toBe('https://downloads.chronokeep.com/series/series.js')
        expect(fetch.mock.calls[1][0]).toBe('https://api.test/results/multi')
        expect(fetchBody(fetch, 1)).toEqual({ slug: 'series', years: ['2024a', '2024b'] })
    })

    it('picks the requested year', async () => {
        const fetch = mockFetch(jsonResponse(200, years), jsonResponse(200, { event: {}, results: {} }))
        const { result } = renderHook(() => MultiResultsLoader({ slug: 'series', year: '2023' }, 'series'))

        await waitFor(() => expect(result.current.state.loading).toBe(false))
        expect(result.current.state.selected_year?.display_year).toBe(2023)
        expect(fetchBody(fetch, 1)).toEqual({ slug: 'series', years: ['2023'] })
    })

    it('returns not found for an unknown year', async () => {
        const fetch = mockFetch(jsonResponse(200, years))
        const { result } = renderHook(() => MultiResultsLoader({ slug: 'series', year: '1999' }, 'series'))

        await waitFor(() => expect(result.current.state.error).toBe(true))
        expect(result.current.state).toMatchObject({ status: 404, message: 'Not Found' })
        expect(fetch).toHaveBeenCalledTimes(1)
    })

    it('returns not found when the series file is missing', async () => {
        mockFetch(jsonResponse(404))
        const { result } = renderHook(() => MultiResultsLoader({ slug: 'nope' }, 'series'))

        await waitFor(() => expect(result.current.state.error).toBe(true))
        expect(result.current.state).toMatchObject({ status: 404, message: 'Not Found' })
    })
})

describe('DoubleResultsLoader', () => {
    const years: DoubleYear[] = [
        {
            display_name: 'Double 2024', display_year: 2024, double: [
                { slug: 'day-one', year: '2024', distance: '30K' },
                { slug: 'day-two', year: '2024', distance: '' },
            ],
        },
        {
            display_name: 'Double 2023', display_year: 2023, double: [
                { slug: 'day-one', year: '2023', distance: '' },
                { slug: 'day-two', year: '2023', distance: '' },
            ],
        },
    ]

    it('merges results from both events', async () => {
        const fetch = mockFetch(
            jsonResponse(200, years),
            jsonResponse(200, { event: {}, results: { '30K': [makeTimeResult({ bib: '1' })], '10K': [makeTimeResult({ bib: '2' })] } }),
            jsonResponse(200, { event: {}, results: { 'Half': [makeTimeResult({ bib: '3' })], 'Full': [makeTimeResult({ bib: '4' })] } }),
        )
        const { result } = renderHook(() => DoubleResultsLoader({ slug: 'double' }, 'double'))

        await waitFor(() => expect(result.current.state.loading).toBe(false))

        const state = result.current.state
        expect(state.selected_year?.display_year).toBe(2024)
        // only the requested distance from the first event, everything from the second
        expect(Object.keys(state.results).sort()).toEqual(['30K', 'Full', 'Half'])
        expect(fetch.mock.calls[0][0]).toBe('https://downloads.chronokeep.com/double/double.json')
        expect(fetchBody(fetch, 1)).toEqual({ slug: 'day-one', year: '2024' })
        expect(fetchBody(fetch, 2)).toEqual({ slug: 'day-two', year: '2024' })
    })

    it('records the error message from a failed results request', async () => {
        mockFetch(
            jsonResponse(200, years),
            jsonResponse(200, { event: {}, results: {} }),
            jsonResponse(404, { message: 'Event Not Found' }),
        )
        const { result } = renderHook(() => DoubleResultsLoader({ slug: 'double', year: '2023' }, 'double'))

        await waitFor(() => expect(result.current.state.loading).toBe(false))
        expect(result.current.state).toMatchObject({ error: true, status: 404, message: 'Event Not Found' })
        expect(result.current.state.selected_year?.display_year).toBe(2023)
    })

    it('returns not found when the double file cannot be loaded', async () => {
        quietConsole()
        mockFetch(new Error('offline'))
        const { result } = renderHook(() => DoubleResultsLoader({ slug: 'double' }, 'double'))

        await waitFor(() => expect(result.current.state.status).toBe(404))
        expect(result.current.state).toMatchObject({ error: true, message: 'Not Found' })
    })
})
