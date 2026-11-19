import { describe, expect, it } from 'vitest'
import { TimeResult } from '../Interfaces/types'
import { RECENT_CHANGES, recentChanges, timeAgo } from './recentChanges'

function result(bib: string, localTime: string, overrides: Partial<TimeResult> = {}): TimeResult {
    return {
        person_id: `p${bib}`, bib, first: 'Runner', last: bib, seconds: 1351, milliseconds: 400,
        chip_seconds: 1340, chip_milliseconds: 900, gender: 'F', occurence: 1, age_group: '', age: 30,
        ranking: 1, age_ranking: 1, gender_ranking: 1, finish: true, segment: '', type: 0, anonymous: false,
        distance: '5K', location: 'Finish', local_time: localTime, division: '', division_ranking: 0,
        ...overrides,
    }
}

const at = (minute: number) => `2026-06-15T08:${String(minute).padStart(2, '0')}:00.0000000-07:00`

describe('recentChanges', () => {
    it('lists the newest reads first', () => {
        const changes = recentChanges([result('1', at(5)), result('2', at(20)), result('3', at(12))], 'race', '2026', false)

        expect(changes.map(c => c.name)).toEqual(['Runner 2', 'Runner 3', 'Runner 1'])
        expect(changes[0].at).toBe(Date.parse('2026-06-15T15:20:00Z'))
        expect(changes[0].link).toBe('/results/race/2026/2')
    })

    it(`keeps only the latest ${RECENT_CHANGES}, or the limit given`, () => {
        const results = Array.from({ length: 15 }, (_, i) => result(String(i), at(i)))

        expect(recentChanges(results, 'race', '2026', false).map(c => c.name))
            .toEqual(Array.from({ length: RECENT_CHANGES }, (_, i) => `Runner ${14 - i}`))
        expect(recentChanges(results, 'race', '2026', false, 5)).toHaveLength(5)
    })

    it('describes finishes with their ranked time', () => {
        const finisher = result('7', at(1), { distance: '10K' })

        expect(recentChanges([finisher], 'race', '2026', false)[0]).toMatchObject({ detail: 'Finished 10K', time: '22:31' })
        expect(recentChanges([finisher], 'race', '2026', true)[0].time).toBe('22:20')
    })

    it('describes split reads by their segment, or their location', () => {
        const split = result('8', at(1), { finish: false, segment: 'Turnaround', location: 'Aid 2', distance: 'Half' })
        const unnamed = result('9', at(2), { finish: false, segment: '', location: 'Aid 2', distance: 'Half' })

        const changes = recentChanges([split, unnamed], 'race', '2026', true)

        expect(changes[1]).toMatchObject({ detail: 'Turnaround · Half', time: '22:31' })
        expect(changes[0].detail).toBe('Aid 2 · Half')
    })

    it('shows anonymous runners by their bib', () => {
        expect(recentChanges([result('42', at(1), { anonymous: true })], 'race', '2026', false)[0].name).toBe('Bib 42')
    })

    it('leaves out DNFs, DNSs and reads without a time', () => {
        const results = [
            result('1', at(1), { type: 3 }),
            result('2', at(2), { type: 30 }),
            result('3', at(3), { type: 31 }),
            result('4', ''),
            result('5', 'not a time'),
            result('6', at(4)),
        ]

        expect(recentChanges(results, 'race', '2026', false).map(c => c.name)).toEqual(['Runner 6'])
    })
})

describe('timeAgo', () => {
    const now = Date.parse('2026-06-15T15:00:00Z')

    it.each([
        [0, 'just now'],
        [9, 'just now'],
        [45, '45s ago'],
        [60, '1m ago'],
        [59 * 60 + 59, '59m ago'],
        [3600, '1h ago'],
        [2 * 3600 + 5 * 60, '2h 5m ago'],
        [-30, 'just now'],
    ])('%i seconds ago is %s', (seconds, text) => {
        expect(timeAgo(now - seconds * 1000, now)).toBe(text)
    })
})
