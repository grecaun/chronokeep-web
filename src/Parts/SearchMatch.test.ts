import { describe, expect, it } from 'vitest'
import { matchesSearch } from './SearchMatch'

describe('matchesSearch', () => {
    const ann = { first: 'Ann', last: 'Smith', bib: '12' }

    it('matches everyone when the search is empty', () => {
        expect(matchesSearch(ann, '')).toBe(true)
    })

    it('matches any part of the full name', () => {
        expect(matchesSearch(ann, 'ann')).toBe(true)
        expect(matchesSearch(ann, 'n sm')).toBe(true)
        expect(matchesSearch(ann, 'bob')).toBe(false)
    })

    it('matches only the exact bib', () => {
        expect(matchesSearch(ann, '12')).toBe(true)
        expect(matchesSearch(ann, '1')).toBe(false)
    })

    it('matches by name only when there is no bib', () => {
        expect(matchesSearch({ first: 'Ann', last: 'Smith' }, 'ann')).toBe(true)
        expect(matchesSearch({ first: 'Ann', last: 'Smith' }, '12')).toBe(false)
    })
})
