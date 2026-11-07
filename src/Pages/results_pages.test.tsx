import { afterEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { makeTimeResult } from '../test/helpers'
import { makeEvent, makeResultsResponse, makeYear, renderAt, routeFetch, tableRows, TestErrorBoundary } from '../test/pages'
import Results from './Results'
import Status from './Status'
import Awards from './Awards'
import TeamResults from './TeamResults'
import PNTF from './PNTF'
import YTP from './YTP'
import { TimeResult } from '../Interfaces/types'

afterEach(() => {
    vi.useRealTimers()
})

function renderResults(response: unknown, url = '/results/test-race') {
    const fetch = routeFetch({ '/results': response })
    renderAt(url, '/results/:slug/:year?', <Results />)
    return fetch
}

// Two finishers where clock and chip order disagree.
function clockVsChip(): TimeResult[] {
    return [
        makeTimeResult({ bib: '1', first: 'Ann', last: 'Clock', seconds: 100, chip_seconds: 99, ranking: 1, gender_ranking: 1, age_ranking: 1 }),
        makeTimeResult({ bib: '2', first: 'Bea', last: 'Chip', seconds: 105, chip_seconds: 90, ranking: 2, gender_ranking: 2, age_ranking: 2 }),
    ]
}

function placesByName() {
    return tableRows(screen.getByRole('table')).map(row => `${row[1]} ${row[2]}`)
}

describe('Results page', () => {
    it('shows the event header and results ranked by clock time', async () => {
        renderResults(makeResultsResponse({ '5K': clockVsChip() }))

        expect(await screen.findByText('Test Race Results')).toBeInTheDocument()
        expect(screen.getByText('June 1, 2020')).toBeInTheDocument()
        expect(placesByName()).toEqual(['1 Ann Clock', '2 Bea Chip'])
        expect(screen.getByText('*Results are ranked based upon the Clock Time and not the Chip Time.')).toBeInTheDocument()
        expect(document.title).toBe('Chronokeep - Test Race Results')
        // person links include the year
        expect(screen.getByRole('link', { name: 'Ann Clock' })).toHaveAttribute('href', '/results/test-race/2020/1')
    })

    it('re-ranks by chip time when the box is checked', async () => {
        renderResults(makeResultsResponse({ '5K': clockVsChip() }))

        await userEvent.click(await screen.findByLabelText('Rank by Chip Time'))

        expect(placesByName()).toEqual(['1 Bea Chip', '2 Ann Clock'])
        expect(screen.getByText('*Results are ranked based upon the Chip Time and not the Clock Time.')).toBeInTheDocument()
    })

    it('offers clock ranking for chip-ranked events', async () => {
        const results = clockVsChip()
        results[0].ranking = 2
        results[1].ranking = 1
        renderResults(makeResultsResponse({ '5K': results }, { event_year: makeYear({ ranking_type: 'chip' }) }))

        await userEvent.click(await screen.findByLabelText('Rank by Clock Time'))

        expect(placesByName()).toEqual(['1 Ann Clock', '2 Bea Chip'])
        expect(screen.getByText('*Results are ranked based upon the Clock Time and not the Chip Time.')).toBeInTheDocument()
    })

    it('explains mixed ranking', async () => {
        renderResults(makeResultsResponse({ '5K': clockVsChip() }, { event_year: makeYear({ ranking_type: 'mixed' }) }))
        expect(await screen.findByText('*Top 3 results are ranked by Clock Time, all other results ranked by Chip Time.')).toBeInTheDocument()
    })

    it('hides the ranking toggle and disclaimer when clock and chip times match', async () => {
        renderResults(makeResultsResponse({ '5K': [makeTimeResult({ seconds: 100, chip_seconds: 100 })] }))

        await screen.findByText('Test Race Results')
        expect(screen.queryByLabelText('Rank by Chip Time')).not.toBeInTheDocument()
        expect(document.getElementById('disclaimer')).toBeNull()
    })

    it('does not rank DNF results when re-ranking', async () => {
        const results = [
            ...clockVsChip(),
            makeTimeResult({ bib: '3', first: 'Cal', last: 'Dnf', seconds: 50, chip_seconds: 40, type: 30, ranking: 3 }),
        ]
        renderResults(makeResultsResponse({ '5K': results }))

        await userEvent.click(await screen.findByLabelText('Rank by Chip Time'))

        expect(placesByName()).toEqual(['1 Bea Chip', '2 Ann Clock', ' Cal Dnf'])
    })

    it('filters by name or bib from the search box', async () => {
        renderResults(makeResultsResponse({ '5K': clockVsChip() }))
        const search = await screen.findByPlaceholderText('Search')

        await userEvent.type(search, 'bea')
        expect(placesByName()).toEqual(['2 Bea Chip'])

        await userEvent.clear(search)
        await userEvent.type(search, '1')
        expect(placesByName()).toEqual(['1 Ann Clock'])
    })

    it('shows a tab per distance', async () => {
        renderResults(makeResultsResponse({
            '5K': [makeTimeResult({ bib: '1', distance: '5K' })],
            '10K': [makeTimeResult({ bib: '2', distance: '10K' })],
        }))

        await screen.findByText('Test Race Results')
        expect(screen.getByRole('button', { name: '5K' })).toHaveAttribute('href', '#5K')
        expect(screen.getByRole('button', { name: '10K' })).toHaveAttribute('href', '#10K')
        expect(screen.getAllByRole('table')).toHaveLength(2)
    })

    it('adds a tab for The Double when two distances have double entrants', async () => {
        renderResults(makeResultsResponse({
            'Half': [makeTimeResult({ bib: '1', division: 'The Double' })],
            'Full': [makeTimeResult({ bib: '1', division: 'the-double' })],
        }))

        expect(await screen.findByRole('button', { name: 'The Double' })).toHaveAttribute('href', '#The Double')
    })

    it('links to other years and disables the current one', async () => {
        renderResults(makeResultsResponse({ '5K': clockVsChip() }, {
            years: [
                makeYear({ year: '2020', date_time: '2020-06-01T08:00:00' }),
                makeYear({ year: '2018', date_time: '2018-06-01T08:00:00' }),
                makeYear({ year: '2019', date_time: '2019-06-01T08:00:00' }),
            ],
        }))

        await screen.findByText('Test Race Results')
        const years = ['2018', '2019', '2020'].map(y => screen.getByRole('link', { name: y }))
        expect(years.map(y => y.getAttribute('href'))).toEqual(['/results/test-race/2018', '/results/test-race/2019', '/results/test-race/2020'])
        expect(years[2]).toHaveClass('disabled')
        expect(years[0]).not.toHaveClass('disabled')
    })

    it('shows the course certification for a single distance', async () => {
        renderResults(makeResultsResponse({ '5K': clockVsChip() }, { distances: [{ name: '5K', certification: 'WA-12345' }] }))
        expect(await screen.findByText('Course Certification: WA-12345')).toBeInTheDocument()
    })

    it('says when there are no results', async () => {
        renderResults(makeResultsResponse({}))
        expect(await screen.findByText('No results to display.')).toBeInTheDocument()
    })

    it('shows the error page for a missing event', async () => {
        routeFetch({})
        renderAt('/results/nope', '/results/:slug/:year?', <Results />)
        expect(await screen.findByText('You appear to be off course.')).toBeInTheDocument()
    })

    it('labels backyard ultra ranking as cumulative time', async () => {
        renderResults(makeResultsResponse({ '5K': clockVsChip() }, { event: makeEvent({ type: 'backyardultra' }) }))
        expect(await screen.findByLabelText('Rank by Cumulative Time')).toBeInTheDocument()
        expect(screen.getByText('*Results are ranked based upon the Elapsed Time and not the Cumulative Time.')).toBeInTheDocument()
    })

    describe('text alerts', () => {
        function liveResponse() {
            return makeResultsResponse({ '5K': clockVsChip() }, {
                event_year: makeYear({ date_time: new Date().toISOString(), days_allowed: 1 }),
                participants: [{ bib: '1', first: 'Ann', last: 'Clock', gender: 'F', distance: '5K', age_group: '30-39' }],
            })
        }

        it('hides the sign up forms for old events', async () => {
            renderResults(makeResultsResponse({ '5K': clockVsChip() }))
            await screen.findByText('Test Race Results')
            expect(screen.queryByText('Sign up for text alerts')).not.toBeInTheDocument()
        })

        it('shows the sign up forms during the event', async () => {
            renderResults(liveResponse())
            expect(await screen.findByText('Sign up for text alerts')).toBeInTheDocument()
            expect(screen.getByText('Unsubscribe to text alerts')).toBeInTheDocument()
        })

        function unsubscribeForm() {
            const heading = screen.getByText('Unsubscribe to text alerts')
            return within(heading.parentElement!)
        }

        it('validates the phone number when unsubscribing', async () => {
            renderResults(liveResponse())
            await screen.findByText('Unsubscribe to text alerts')
            const form = unsubscribeForm()

            await userEvent.type(form.getByLabelText('Phone'), '12345')
            await userEvent.click(form.getByRole('button', { name: 'Submit' }))

            expect(await form.findByText(/Phone number not valid/)).toBeInTheDocument()
        })

        it('unsubscribes a phone number', async () => {
            const fetch = routeFetch({
                '/results': liveResponse(),
                '/sms/remove': () => new Response('', { status: 200 }),
            })
            renderAt('/results/test-race', '/results/:slug/:year?', <Results />)
            await screen.findByText('Unsubscribe to text alerts')
            const form = unsubscribeForm()

            await userEvent.type(form.getByLabelText('Phone'), '555-123-4567')
            await userEvent.click(form.getByRole('button', { name: 'Submit' }))

            expect(await screen.findByText("You've successfully unsubscribed.")).toBeInTheDocument()
            const call = fetch.mock.calls.find(c => c[0].endsWith('/sms/remove'))!
            expect(JSON.parse(call[1]!.body as string)).toEqual({ slug: 'test-race', year: '2020', phone: '555-123-4567' })
        })

        it('shows an error when unsubscribing fails', async () => {
            routeFetch({
                '/results': liveResponse(),
                '/sms/remove': () => new Response('', { status: 500 }),
            })
            renderAt('/results/test-race', '/results/:slug/:year?', <Results />)
            await screen.findByText('Unsubscribe to text alerts')
            const form = unsubscribeForm()

            await userEvent.type(form.getByLabelText('Phone'), '5551234567')
            await userEvent.click(form.getByRole('button', { name: 'Submit' }))

            expect(await screen.findByText('Error unsubscribing.')).toBeInTheDocument()
        })
    })
})

describe('Status page', () => {
    function renderStatus(results: { [distance: string]: TimeResult[] }) {
        routeFetch({ '/results': makeResultsResponse(results) })
        renderAt('/results/test-race/status', '/results/:slug/:year?/status', <Status />)
    }

    function statusOf(bib: number) {
        const cell = screen.getAllByText(String(bib)).find(el => el.classList.contains('status-col'))!
        return Array.from(cell.classList).find(c => /^status-\d$/.test(c))
    }

    it('colors each bib by its status', async () => {
        renderStatus({
            '5K': [
                makeTimeResult({ bib: '101', finish: true }),
                makeTimeResult({ bib: '102', finish: false, segment: 'Mile 1' }),
                makeTimeResult({ bib: '103', type: 30 }),
                makeTimeResult({ bib: '115', finish: true }),
            ],
        })

        await screen.findByText('Finished')
        expect(statusOf(101)).toBe('status-2')
        expect(statusOf(102)).toBe('status-1')
        expect(statusOf(103)).toBe('status-3')
        expect(statusOf(104)).toBe('status-0')
        expect(statusOf(115)).toBe('status-2')
        expect(document.title).toBe('Chronokeep - 2020 Test Race Status')
    })

    it('shows the highest bib when the range is a multiple of ten', async () => {
        renderStatus({
            '5K': [
                makeTimeResult({ bib: '1', finish: true }),
                makeTimeResult({ bib: '11', finish: true }),
            ],
        })

        await screen.findByText('Finished')
        expect(statusOf(11)).toBe('status-2')
    })

    it('refuses to draw non-numeric bibs', async () => {
        renderStatus({ '5K': [makeTimeResult({ bib: 'A1' })] })
        expect(await screen.findByText('Non-number bib found. Unable to process.')).toBeInTheDocument()
    })

    it('says when there is nothing to show', async () => {
        renderStatus({})
        expect(await screen.findByText('No status information to display.')).toBeInTheDocument()
    })
})

describe('Awards page', () => {
    function renderAwards(url = '/awards/test-race') {
        routeFetch({
            '/results': makeResultsResponse({
                '5K': [
                    makeTimeResult({ bib: '1', first: 'Ann', last: 'Fast', ranking: 1, gender_ranking: 1, age_ranking: 1 }),
                ],
            }),
        })
        renderAt(url, '/awards/:slug/:year?', <Awards />)
    }

    it('uses the default options and writes them to the url', async () => {
        renderAwards()

        expect(await screen.findByText('2020 Test Race Awards')).toBeInTheDocument()
        expect(screen.getByLabelText('Number of Overall Awards')).toHaveValue('3')
        expect(screen.getByLabelText('Number of Age Group Awards')).toHaveValue('3')
        expect(screen.getByLabelText('Include overall in age groups?')).toBeChecked()
        expect(screen.getByLabelText('Display Masters Group?')).not.toBeChecked()
        expect(screen.getByTestId('location')).toHaveTextContent('/awards/test-race?ov=3&ag=3&inc=true&gmas=false&mas=false')
    })

    it('reads options from the url', async () => {
        renderAwards('/awards/test-race?ov=5&ag=1&inc=false&mas=true&gmas=true')

        await screen.findByText('2020 Test Race Awards')
        expect(screen.getByLabelText('Number of Overall Awards')).toHaveValue('5')
        expect(screen.getByLabelText('Number of Age Group Awards')).toHaveValue('1')
        expect(screen.getByLabelText('Include overall in age groups?')).not.toBeChecked()
        expect(screen.getByLabelText('Display Masters Group?')).toBeChecked()
        expect(screen.getByLabelText('Display Grand Masters Group?')).toBeChecked()
    })

    it('updates the url when options change', async () => {
        renderAwards()
        await screen.findByText('2020 Test Race Awards')

        fireEvent.change(screen.getByLabelText('Number of Overall Awards'), { target: { value: '7' } })
        await userEvent.click(screen.getByLabelText('Display Masters Group?'))

        await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('ov=7&ag=3&inc=true&gmas=false&mas=true'))
    })

    it('says when there are no awards', async () => {
        routeFetch({ '/results': makeResultsResponse({}) })
        renderAt('/awards/test-race', '/awards/:slug/:year?', <Awards />)
        expect(await screen.findByText('No awards to display.')).toBeInTheDocument()
    })
})

describe('TeamResults page', () => {
    function member(bib: string, gender: string, ranking: number, division = 'Team A') {
        return makeTimeResult({ bib, first: `Runner${bib}`, last: division, gender, ranking, division, seconds: ranking * 100 })
    }

    function renderTeams(results: TimeResult[]) {
        routeFetch({ '/results': makeResultsResponse({ '5K': results }) })
        renderAt('/team-results/test-race', '/team-results/:slug/:year?', <TestErrorBoundary><TeamResults /></TestErrorBoundary>)
    }

    it('scores qualifying teams by the places of two women and two others', async () => {
        renderTeams([
            member('1', 'M', 1, 'Team A'),
            member('2', 'F', 2, 'Team B'),
            member('3', 'F', 3, 'Team A'),
            member('4', 'F', 4, 'Team B'),
            member('5', 'M', 5, 'Team B'),
            member('6', 'F', 6, 'Team A'),
            member('7', 'M', 7, 'Team B'),
            member('8', 'M', 8, 'Team A'),
            // individuals without a team don't take a place
            makeTimeResult({ bib: '9', ranking: 9, division: '' }),
        ])

        expect(await screen.findByText('Team Rankings')).toBeInTheDocument()
        const rows = tableRows(screen.getByRole('table')).map(r => r.slice(0, 3))
        // Team B: 2 + 4 + 5 + 7 = 18, Team A: 3 + 6 + 1 + 8 = 18 -> tie keeps insertion order
        expect(rows).toEqual([
            ['1', 'Team A', '18'],
            ['2', 'Team B', '18'],
        ])
    })

    it('ignores DNF results when counting members', async () => {
        renderTeams([
            member('1', 'F', 1),
            member('2', 'F', 2),
            member('3', 'M', 3),
            member('4', 'M', 4),
            { ...member('5', 'M', 5), type: 30 },
            member('6', 'F', 6, 'Team B'),
            member('7', 'F', 7, 'Team B'),
            member('8', 'M', 8, 'Team B'),
            member('9', 'M', 9, 'Team B'),
        ])

        await screen.findByText('Team Rankings')
        expect(tableRows(screen.getByRole('table')).map(r => r.slice(0, 3))).toEqual([
            ['1', 'Team A', '10'],
            ['2', 'Team B', '26'],
        ])
    })

    it('says when there are no team results', async () => {
        renderTeams([makeTimeResult({ division: '' })])
        expect(await screen.findByText('No results to display.')).toBeInTheDocument()
    })

    it('handles a distance where no team qualifies', async () => {
        renderTeams([
            member('1', 'F', 1),
            member('2', 'F', 2),
            member('3', 'M', 3),
        ])
        await waitFor(() => expect(screen.queryByText('Loading')).not.toBeInTheDocument())
        expect(screen.queryByTestId('crashed')).not.toBeInTheDocument()
        expect(screen.getByText('Team Rankings')).toBeInTheDocument()
        expect(screen.getByText('No results to display.')).toBeInTheDocument()
    })
})

describe('PNTF page', () => {
    function pntfResults() {
        return {
            '10K': [
                makeTimeResult({ bib: '1', first: 'Wendy', last: 'Open', gender: 'F', age: 25, seconds: 2000, division: 'pntf' }),
                makeTimeResult({ bib: '2', first: 'Mary', last: 'Masters', gender: 'F', age: 45, seconds: 2100, division: 'pntf' }),
                makeTimeResult({ bib: '3', first: 'Mo', last: 'Man', gender: 'M', age: 30, seconds: 1900, division: 'pntf' }),
                makeTimeResult({ bib: '4', first: 'Joe', last: 'Public', gender: 'M', age: 30, seconds: 1000, division: '' }),
            ],
            '3K': [
                makeTimeResult({ bib: '5', first: 'Kid', last: 'Runner', gender: 'F', age: 12, seconds: 900, division: 'ytp' }),
            ],
        }
    }

    it('splits championship and youth results', async () => {
        routeFetch({ '/results': makeResultsResponse(pntfResults()) })
        renderAt('/pntf/test-race', '/pntf/:slug/:year?', <PNTF page="pntf" />)

        expect(await screen.findByText('PNTF Championship Rankings')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Open & Masters Championship' })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Youth Championship' })).toBeInTheDocument()
        // non-championship runners are left out
        expect(screen.queryByText('Joe Public')).not.toBeInTheDocument()
        expect(screen.getByText('Kid Runner')).toBeInTheDocument()
    })

    it('ranks women and men separately, with masters places', async () => {
        routeFetch({ '/results': makeResultsResponse({ '10K': pntfResults()['10K'] }) })
        renderAt('/pntf/test-race', '/pntf/:slug/:year?', <PNTF page="pntf" />)

        await screen.findByText('PNTF Championship Rankings')
        const rows = tableRows(screen.getByRole('table'))
        const byName = (name: string) => rows.find(r => r.some(c => c === name))!
        // Place, Masters, Name, Overall ...
        expect(byName('Wendy Open').slice(0, 4)).toEqual(['1', '', 'Wendy Open', '2'])
        expect(byName('Mary Masters').slice(0, 4)).toEqual(['2', '1', 'Mary Masters', '3'])
        expect(byName('Mo Man').slice(0, 4)).toEqual(['1', '', 'Mo Man', '1'])
    })

    it('treats a gender of "Female" as a woman', async () => {
        routeFetch({
            '/results': makeResultsResponse({
                '10K': [makeTimeResult({ bib: '1', first: 'Fran', last: 'Female', gender: 'Female', age: 30, division: 'pntf' })],
            }),
        })
        renderAt('/pntf/test-race', '/pntf/:slug/:year?', <PNTF page="pntf" />)

        await screen.findByText('PNTF Championship Rankings')
        expect(screen.getByText('Women')).toBeInTheDocument()
        expect(screen.queryByText('Non-Binary')).not.toBeInTheDocument()
    })

    it('leaves youth out of the awards page', async () => {
        routeFetch({ '/results': makeResultsResponse(pntfResults()) })
        renderAt('/pntf-awards/test-race', '/pntf-awards/:slug/:year?', <PNTF page="pntf-awards" />)

        expect(await screen.findByText('PNTF Championship Awards')).toBeInTheDocument()
        expect(screen.queryByText('Kid Runner')).not.toBeInTheDocument()
        expect(screen.getByText('Wendy Open')).toBeInTheDocument()
    })

    it('says when there are no championship results', async () => {
        routeFetch({ '/results': makeResultsResponse({ '5K': [makeTimeResult({ division: '' })] }) })
        renderAt('/pntf/test-race', '/pntf/:slug/:year?', <PNTF page="pntf" />)
        expect(await screen.findByText('No results to display.')).toBeInTheDocument()
    })
})

describe('YTP page', () => {
    function ytpResults() {
        return {
            '5K': [
                makeTimeResult({ bib: '1', first: 'Fay', last: 'Young', gender: 'F', age: 10, seconds: 1200, ranking: 1, gender_ranking: 1, age_ranking: 1, division: 'ytp' }),
                makeTimeResult({ bib: '2', first: 'Max', last: 'Young', gender: 'M', age: 14, seconds: 1100, ranking: 1, gender_ranking: 1, age_ranking: 1, division: 'ytp' }),
                makeTimeResult({ bib: '3', first: 'Adult', last: 'Runner', gender: 'M', age: 40, division: '' }),
            ],
        }
    }

    it.each([
        ['ytp-awards', 'PNTF Youth Trail Championship / YTP Race Awards'],
        ['pntf-youth', 'PNTF Youth Trail Championship Results'],
    ])('renders the %s variant', async (page, title) => {
        routeFetch({ '/results': makeResultsResponse(ytpResults()) })
        renderAt(`/${page}/test-race`, `/${page}/:slug/:year?`, <YTP page={page} />)

        expect(await screen.findByText(title, { exact: false })).toBeInTheDocument()
        expect(screen.getAllByText('Fay Young').length).toBeGreaterThan(0)
        expect(screen.queryByText('Adult Runner')).not.toBeInTheDocument()
    })

    it('groups awards by gender and youth age group', async () => {
        routeFetch({ '/results': makeResultsResponse(ytpResults()) })
        renderAt('/ytp-awards/test-race', '/ytp-awards/:slug/:year?', <YTP page="ytp-awards" />)

        expect(await screen.findByText('Female Overall')).toBeInTheDocument()
        expect(screen.getByText('Male Overall')).toBeInTheDocument()
        expect(screen.getByText('Female 9-10')).toBeInTheDocument()
        expect(screen.getByText('Male 13-14')).toBeInTheDocument()
    })

    it('loads previous standings for the series page', async () => {
        const fetch = routeFetch({
            '/results': makeResultsResponse(ytpResults()),
            'ytp-standings.csv': () => new Response('First,Last,Category,Highest Score\nFay,Young,YTP Female 9-10,50', { status: 200 }),
        })
        renderAt('/ytp-series/test-race', '/ytp-series/:slug/:year?', <YTP page="ytp-series" />)

        expect(await screen.findByText('YTP Series')).toBeInTheDocument()
        await waitFor(() => expect(fetch.mock.calls.map(c => c[0])).toContain('https://downloads.chronokeep.com/test-race/2020/5K/ytp-standings.csv'))
    })

    it('says when there are no youth results', async () => {
        routeFetch({ '/results': makeResultsResponse({ '5K': [makeTimeResult({ division: '' })] }) })
        renderAt('/ytp-awards/test-race', '/ytp-awards/:slug/:year?', <YTP page="ytp-awards" />)
        expect(await screen.findByText('No results to display.')).toBeInTheDocument()
    })
})

describe('bug fixes', () => {
    it('shows the only bib on the status page', async () => {
        routeFetch({ '/results': makeResultsResponse({ '5K': [makeTimeResult({ bib: '7', finish: true })] }) })
        renderAt('/results/test-race/status', '/results/:slug/:year?/status', <Status />)

        await screen.findByText('Finished')
        const cell = screen.getAllByText('7').find(el => el.classList.contains('status-col'))!
        expect(cell).toHaveClass('status-2')
    })

    it('counts a gender of "Female" as a woman for teams', async () => {
        const member = (bib: string, gender: string, ranking: number) =>
            makeTimeResult({ bib, first: `Runner${bib}`, last: 'Team A', gender, ranking, division: 'Team A' })
        routeFetch({
            '/results': makeResultsResponse({
                '5K': [member('1', 'Female', 1), member('2', 'Female', 2), member('3', 'Male', 3), member('4', 'Male', 4)],
            }),
        })
        renderAt('/team-results/test-race', '/team-results/:slug/:year?', <TeamResults />)

        await screen.findByText('Team Rankings')
        expect(tableRows(screen.getByRole('table')).map(r => r.slice(0, 3))).toEqual([['1', 'Team A', '10']])
    })

    it('puts a gender of "Female" in the female YTP awards', async () => {
        routeFetch({
            '/results': makeResultsResponse({
                '5K': [makeTimeResult({ first: 'Fay', last: 'Young', gender: 'Female', age: 10, division: 'ytp' })],
            }),
        })
        renderAt('/ytp-awards/test-race', '/ytp-awards/:slug/:year?', <YTP page="ytp-awards" />)

        expect(await screen.findByText('Female Overall')).toBeInTheDocument()
        expect(screen.queryByText('Non-Binary Overall')).not.toBeInTheDocument()
    })
})
