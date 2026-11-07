import { describe, expect, it } from 'vitest'
import DateString from './DateString'

describe('DateString', () => {
    it('formats an ISO date time', () => {
        expect(DateString('2024-07-04T08:30:00Z')).toBe('July 4, 2024')
    })

    it('formats a plain date', () => {
        expect(DateString('2023-01-09')).toBe('January 9, 2023')
        expect(DateString('2023-12-31')).toBe('December 31, 2023')
    })

    it('returns an empty string when the date is malformed', () => {
        expect(DateString('')).toBe('')
        expect(DateString('2024-07')).toBe('')
        expect(DateString('not a date')).toBe('')
    })
})
