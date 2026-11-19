import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { makeTimeResult } from '../test/helpers'
import { changedResults, FRESH_FADE, freshKey, useFreshResults } from './freshResults'

afterEach(() => {
    vi.useRealTimers()
})

const ann = makeTimeResult({ person_id: '1', bib: '1', distance: '5K', local_time: '2026-06-15T08:00:00-07:00', seconds: 100, finish: false, segment: 'Mile 1' })
const ben = makeTimeResult({ person_id: '2', bib: '2', distance: '5K', local_time: '2026-06-15T08:01:00-07:00', seconds: 110 })

describe('changedResults', () => {
    it('finds runners who are new or have a new read', () => {
        const annFinished = { ...ann, finish: true, segment: '', seconds: 1300, local_time: '2026-06-15T08:20:00-07:00' }
        const cat = makeTimeResult({ person_id: '3', bib: '3', distance: '5K' })

        expect(changedResults([ann, ben], [annFinished, ben, cat])).toEqual([freshKey(annFinished), freshKey(cat)])
    })

    it("doesn't count places shifting as others finish", () => {
        expect(changedResults([ann, ben], [{ ...ann, ranking: 5, gender_ranking: 3, age_ranking: 2 }, ben])).toEqual([])
    })

    it('counts a corrected time or a DNF', () => {
        expect(changedResults([ann, ben], [{ ...ann, chip_seconds: 95 }, { ...ben, type: 30 }]))
            .toEqual([freshKey(ann), freshKey(ben)])
    })

    it('tells the same runner apart in different distances', () => {
        const otherDistance = { ...ann, distance: '10K' }

        expect(changedResults([ann], [ann, otherDistance])).toEqual(['10K|1'])
    })
})

describe('useFreshResults', () => {
    it('marks changed results until they fade', () => {
        vi.useFakeTimers()
        const { result } = renderHook(() => useFreshResults())
        const annLater = { ...ann, local_time: '2026-06-15T08:05:00-07:00' }

        act(() => { result.current.mark([ann, ben], [annLater, ben]) })
        expect([...result.current.fresh.keys()]).toEqual([freshKey(ann)])

        act(() => { vi.advanceTimersByTime(FRESH_FADE - 1) })
        expect(result.current.fresh.size).toBe(1)
        act(() => { vi.advanceTimersByTime(1) })
        expect(result.current.fresh.size).toBe(0)
    })

    it("doesn't mark anything on the first load", () => {
        const { result } = renderHook(() => useFreshResults())

        act(() => { result.current.mark([], [ann, ben]) })

        expect(result.current.fresh.size).toBe(0)
    })

    it('starts the fade over for a result that changes again', () => {
        vi.useFakeTimers()
        const { result } = renderHook(() => useFreshResults())
        const read2 = { ...ann, local_time: '2026-06-15T08:05:00-07:00' }
        const read3 = { ...ann, local_time: '2026-06-15T08:06:00-07:00' }

        act(() => { result.current.mark([ann], [read2]) })
        const first = result.current.fresh.get(freshKey(ann))
        act(() => { vi.advanceTimersByTime(FRESH_FADE / 2) })
        act(() => { result.current.mark([read2], [read3]) })
        const second = result.current.fresh.get(freshKey(ann))
        expect(second).toBeGreaterThan(first!)

        // the first fade ending leaves the newer one alone
        act(() => { vi.advanceTimersByTime(FRESH_FADE / 2) })
        expect(result.current.fresh.get(freshKey(ann))).toBe(second)
        act(() => { vi.advanceTimersByTime(FRESH_FADE / 2) })
        expect(result.current.fresh.size).toBe(0)
    })
})
