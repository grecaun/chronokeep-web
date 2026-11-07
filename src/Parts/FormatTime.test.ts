import { describe, expect, it } from 'vitest'
import FormatTime, { FormatAltPace, FormatPace, SimpleFormatTime } from './FormatTime'
import { makeTimeResult } from '../test/helpers'

describe('FormatTime', () => {
    const finish = makeTimeResult()

    it('formats minutes and seconds with tenths when under an hour', () => {
        expect(FormatTime(65, 432, finish)).toBe('01:05.4')
    })

    it('includes the hour when over an hour', () => {
        expect(FormatTime(3661, 999, finish)).toBe('1:01:01.9')
    })

    it('pads minutes and seconds to two digits', () => {
        expect(FormatTime(3600 + 9 * 60 + 9, 0, finish)).toBe('1:09:09.0')
        expect(FormatTime(0, 0, finish)).toBe('00:00.0')
    })

    it('drops tenths when no_millis is set', () => {
        expect(FormatTime(65, 432, finish, false, true)).toBe('01:05')
        expect(FormatTime(3661, 432, finish, false, true)).toBe('1:01:01')
    })

    it('returns the segment name for non-finish results when not_blank is set', () => {
        const split = makeTimeResult({ finish: false, segment: 'Aid Station 1' })
        expect(FormatTime(65, 0, split, true)).toBe('Aid Station 1')
        // without not_blank the time is still shown
        expect(FormatTime(65, 0, split)).toBe('01:05.0')
    })

    it.each([3, 30])('handles DNF type %i', (type) => {
        const dnf = makeTimeResult({ type })
        expect(FormatTime(65, 0, dnf, true)).toBe('DNF')
        expect(FormatTime(65, 0, dnf)).toBe('')
    })

    it('handles DNS', () => {
        const dns = makeTimeResult({ type: 31 })
        expect(FormatTime(65, 0, dns, true)).toBe('DNS')
        expect(FormatTime(65, 0, dns)).toBe('')
    })

    it('prefers the segment name over DNF for non-finish results', () => {
        const res = makeTimeResult({ finish: false, segment: 'Lap 2', type: 30 })
        expect(FormatTime(65, 0, res, true)).toBe('Lap 2')
    })
})

describe('SimpleFormatTime', () => {
    it('returns an empty string for zero or negative seconds', () => {
        expect(SimpleFormatTime(0, 500)).toBe('')
        expect(SimpleFormatTime(-5, 0)).toBe('')
    })

    it('formats with and without hours', () => {
        expect(SimpleFormatTime(59, 100)).toBe('00:59.1')
        expect(SimpleFormatTime(7322, 50)).toBe('2:02:02.0')
    })
})

describe('FormatPace', () => {
    it('formats seconds as m:ss', () => {
        expect(FormatPace(0)).toBe('0:00')
        expect(FormatPace(65)).toBe('1:05')
        expect(FormatPace(600)).toBe('10:00')
    })
})

describe('FormatAltPace', () => {
    it('converts a per-km pace to per-mile', () => {
        // 5:00 / km is about 8:02 / mi
        expect(FormatAltPace(300, 'km')).toBe('8:02 / mi')
    })

    it('converts a per-mile pace to per-km', () => {
        // 8:00 / mi is about 4:58 / km
        expect(FormatAltPace(480, 'mi')).toBe('4:58 / km')
    })

    it('returns an empty string for unknown units', () => {
        expect(FormatAltPace(300, 'yd')).toBe('')
    })
})
