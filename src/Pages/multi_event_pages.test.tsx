import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { makeTimeResult } from '../test/helpers'
import { makeEvent, pickYear, renderAt, routeFetch, tableRows, yearOptions } from '../test/pages'
import SeriesPage from './Series'
import DoublePage from './Double'
import NorthBendDoublePage from './NorthBendDouble'
import { DoubleYear, SeriesYear, TimeResult } from '../Interfaces/types'

describe('Series page', () => {
    const years: SeriesYear[] = [
        { display_year: 2023, series: [] },
        {
            display_year: 2024,
            series: [{
                name: 'Trail Series',
                best: 2,
                distances: [
                    { year: '2024a', name: '5K', value: 3.1, type: 'mi' },
                    { year: '2024b', name: '5K', value: 3.1, type: 'mi' },
                    { year: '2024c', name: '5K', value: 3.1, type: 'mi' },
                ],
            }],
        },
    ]

    function runner(first: string, seconds: number, extra: Partial<TimeResult> = {}) {
        return makeTimeResult({ first, last: 'Runner', seconds, gender: 'F', age_group: '30-39', ...extra })
    }

    function renderSeries(results: unknown) {
        routeFetch({ 'series/trail.js': years, '/results/multi': { event: makeEvent({ name: 'Trail Series Events' }), results } })
        renderAt('/series/trail', '/series/:slug/:year?', <SeriesPage />)
    }

    it('scores runners by their best finishes and ranks by points', async () => {
        renderSeries({
            '2024a': { '5K': [runner('Ann', 1000), runner('Bea', 900), runner('Cat', 800)] },
            '2024b': { '5K': [runner('Ann', 1100), runner('Bea', 1200)] },
            '2024c': { '5K': [runner('Bea', 1000)] },
        })

        expect(await screen.findByText('Series Results')).toBeInTheDocument()
        const rows = tableRows(screen.getByRole('table')).map(r => r.slice(0, 4))
        // Bea: 1st, 2nd, 1st -> best two = 2 points. Ann: 2nd, 1st -> 3 points.
        // Cat only ran once, which isn't enough to count.
        expect(rows).toEqual([
            ['1', '2', '5:06/mi', 'Bea Runner'],
            ['2', '3', '5:38/mi', 'Ann Runner'],
        ])
        expect(document.title).toBe('Chronokeep - Trail Series Events - Series Results')
    })

    it('orders each event by the event ranking before time', async () => {
        // a chip ranked event, so Ann is ranked ahead of Bea even with a slower clock time
        renderSeries({
            '2024a': { '5K': [runner('Ann', 1000, { ranking: 1 }), runner('Bea', 900, { ranking: 2 })] },
            '2024b': { '5K': [runner('Ann', 1000, { ranking: 1 }), runner('Bea', 900, { ranking: 2 })] },
        })

        await screen.findByText('Series Results')
        expect(tableRows(screen.getByRole('table')).map(r => [r[0], r[1], r[3]])).toEqual([
            ['1', '2', 'Ann Runner'],
            ['2', '4', 'Bea Runner'],
        ])
    })

    it('scores a runner in two series separately for each one', async () => {
        const twoSeries: SeriesYear[] = [{
            display_year: 2024,
            series: [
                {
                    name: 'Spring Series', best: 2, distances: [
                        { year: '2024a', name: '5K', value: 3.1, type: 'mi' },
                        { year: '2024b', name: '5K', value: 3.1, type: 'mi' },
                    ],
                },
                {
                    name: 'Fall Series', best: 2, distances: [
                        { year: '2024c', name: '10K', value: 6.2, type: 'mi' },
                        { year: '2024d', name: '10K', value: 6.2, type: 'mi' },
                    ],
                },
            ],
        }]
        routeFetch({
            'series/trail.js': twoSeries,
            '/results/multi': {
                event: makeEvent(),
                results: {
                    '2024a': { '5K': [runner('Ann', 1000)] },
                    '2024b': { '5K': [runner('Ann', 1000)] },
                    '2024c': { '10K': [runner('Ann', 2000)] },
                    '2024d': { '10K': [runner('Ann', 2000)] },
                },
            },
        })
        renderAt('/series/trail', '/series/:slug/:year?', <SeriesPage />)

        await screen.findByText('Series Results')
        const tables = screen.getAllByRole('table')
        expect(tables).toHaveLength(2)
        // first place in both events of each series, so 2 points and the same pace in each
        for (const table of tables) {
            expect(tableRows(table).map(r => r.slice(0, 4))).toEqual([['1', '2', '5:22/mi', 'Ann Runner']])
        }
    })

    it('skips DNF results', async () => {
        renderSeries({
            '2024a': { '5K': [runner('Ann', 1000), runner('Bea', 900)] },
            '2024b': { '5K': [runner('Ann', 1100), runner('Bea', 1200, { type: 30 })] },
        })

        await screen.findByText('Series Results')
        expect(tableRows(screen.getByRole('table')).map(r => r[3])).toEqual(['Ann Runner'])
    })

    it('offers each series year and goes to the one picked', async () => {
        renderSeries({})

        await screen.findByText('Series Results')
        expect(screen.getByText('No results to display.')).toBeInTheDocument()
        expect(await yearOptions()).toEqual(['2024*', '2023'])

        await pickYear('2023')
        expect(screen.getByTestId('location')).toHaveTextContent('/series/trail/2023')
    })

    it('shows the error page when the series file is missing', async () => {
        routeFetch({})
        renderAt('/series/nope', '/series/:slug/:year?', <SeriesPage />)
        expect(await screen.findByText('You appear to be off course.')).toBeInTheDocument()
    })
})

describe('Double page', () => {
    const years: DoubleYear[] = [{
        display_name: 'The Big Double',
        display_year: 2024,
        double: [
            { slug: 'day-one', year: '2024', distance: 'Half' },
            { slug: 'day-two', year: '2024', distance: 'Full' },
        ],
    }]

    function racer(first: string, ranking: number, seconds: number) {
        return makeTimeResult({ first, last: 'Racer', age: 30, ranking, seconds, chip_seconds: seconds })
    }

    function renderDouble(dayOne: TimeResult[], dayTwo: TimeResult[]) {
        routeFetch({
            'double/dbl.json': years,
            '/results': (_url: string, init?: RequestInit) => {
                const body = JSON.parse(init!.body as string) as { slug: string }
                const results = body.slug === 'day-one' ? { Half: dayOne } : { Full: dayTwo }
                return new Response(JSON.stringify({ event: {}, results }), { status: 200 })
            },
        })
        renderAt('/double/dbl', '/double/:slug/:year?', <DoublePage />)
    }

    it('ranks people who finished both races by combined place then time', async () => {
        renderDouble(
            [racer('Ann', 1, 5000), racer('Bea', 2, 5100), racer('Cat', 3, 5200)],
            [racer('Ann', 2, 11000), racer('Bea', 1, 10800)],
        )

        expect(await screen.findByText('The Big Double')).toBeInTheDocument()
        const rows = tableRows(screen.getByRole('table')).map(r => [r[0], r[2]])
        // both have 3 points, Bea is faster overall; Cat only did one race
        expect(rows).toEqual([
            ['1', 'Bea Racer'],
            ['2', 'Ann Racer'],
        ])
        expect(screen.getByRole('columnheader', { name: 'Half' })).toBeInTheDocument()
        expect(screen.getByRole('columnheader', { name: 'Full' })).toBeInTheDocument()
    })

    it('says when nobody finished both races', async () => {
        renderDouble([racer('Ann', 1, 5000)], [racer('Bea', 1, 10000)])
        expect(await screen.findByText('No results to display.')).toBeInTheDocument()
    })
})

describe('North Bend Double page', () => {
    const years: DoubleYear[] = [{
        display_name: 'North Bend Double',
        display_year: 2024,
        double: [
            { slug: 'nb-sat', year: '2024', distance: '30K' },
            { slug: 'nb-sun', year: '2024', distance: '' },
        ],
    }]

    function racer(bib: string, first: string, gender: string, seconds: number, milliseconds = 0) {
        return makeTimeResult({ bib, first, last: 'Trail', gender, age_group: '30-39', seconds, milliseconds })
    }

    function renderNbd(saturday: TimeResult[], sunday: TimeResult[]) {
        routeFetch({
            'double/nbd.json': years,
            '/results': (_url: string, init?: RequestInit) => {
                const body = JSON.parse(init!.body as string) as { slug: string }
                const results = body.slug === 'nb-sat' ? { '30K': saturday } : { '10K': sunday }
                return new Response(JSON.stringify({ event: {}, results }), { status: 200 })
            },
        })
        renderAt('/nbd/nbd', '/nbd/:slug/:year?', <NorthBendDoublePage />)
    }

    it('adds both race times and ranks by the total', async () => {
        renderNbd(
            [racer('1', 'Ann', 'F', 7200, 600), racer('2', 'Bob', 'M', 7000), racer('3', 'Cy', 'M', 6000)],
            [racer('1', 'Ann', 'F', 3000, 500), racer('2', 'Bob', 'M', 3300)],
        )

        expect(await screen.findByText('North Bend Double')).toBeInTheDocument()
        const rows = tableRows(screen.getByRole('table'))
        // Ann: 7200.6 + 3000.5 = 10201.1, Bob: 10300. Cy only ran Saturday.
        expect(rows.map(r => [r[0], r[1], r[2], r[5]])).toEqual([
            ['1', '1', 'Ann Trail', '2:50:01.1'],
            ['2', '2', 'Bob Trail', '2:51:40.0'],
        ])
        expect(rows[0][3]).toBe('1 F')
        expect(rows[1][3]).toBe('1 M')
    })
})
