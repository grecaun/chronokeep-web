import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import TimeAwardsTable from './TimeAwardsTable'
import { makeTimeResult } from '../test/helpers'
import { TimeResult } from '../Interfaces/types'

function renderAwards(results: TimeResult[]) {
    render(
        <MemoryRouter>
            <TimeAwardsTable
                results={results} distance="6 Hour" info={{ slug: 'race', year: '2024' }} key={0} show_title={false}
                search="" sort_by={0} rank_by_selected={false} age_group_map={new Map()} segment_map={new Map()}
                numberAG={3} numberOV={3} overallInc={false} grandMasters={false} masters={false} certification={undefined}
                />
        </MemoryRouter>
    )
    return screen.queryAllByRole('link').map(link => link.textContent)
}

describe('TimeAwardsTable', () => {
    it('awards ranked finishers by their last lap', () => {
        expect(renderAwards([
            makeTimeResult({ bib: '1', first: 'Ann', last: 'Laps', ranking: 2, occurence: 3, finish: true }),
            makeTimeResult({ bib: '1', first: 'Ann', last: 'Laps', ranking: 1, occurence: 4, finish: true }),
            makeTimeResult({ bib: '2', first: 'Bea', last: 'Laps', ranking: 2, occurence: 4, finish: true }),
        ])).toEqual(['Ann Laps', 'Bea Laps'])
    })

    it('leaves out runners who only have a start read', () => {
        expect(renderAwards([
            makeTimeResult({ bib: '1', first: 'Real', last: 'Winner', ranking: 1, occurence: 5, finish: true }),
            makeTimeResult({ bib: '2', first: 'Only', last: 'Started', ranking: -1, occurence: 0, finish: false, segment: 'Start' }),
            makeTimeResult({ bib: '3', first: 'Zero', last: 'Ranked', ranking: 0, occurence: 0, finish: false, segment: 'Start' }),
        ])).toEqual(['Real Winner'])
    })

    it.each([
        [3, 'DNS'],
        [30, 'DNF'],
        [31, 'DNF'],
    ])('leaves out results of type %i (%s)', (type) => {
        expect(renderAwards([
            makeTimeResult({ bib: '1', first: 'Real', last: 'Winner', ranking: 2, occurence: 5, finish: true }),
            makeTimeResult({ bib: '2', first: 'Did', last: 'Not', ranking: 1, occurence: 5, finish: true, type }),
        ])).toEqual(['Real Winner'])
    })
})
