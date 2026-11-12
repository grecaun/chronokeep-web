import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import PersonDistance from './PersonDistance'
import { makeTimeResult } from '../test/helpers'

describe('PersonDistance', () => {
    it.each(['M', 'W', 'F', 'Man', 'Woman'])('shows gender places for gender "%s"', (gender) => {
        render(<PersonDistance results={[makeTimeResult({ gender, ranking: 3, gender_ranking: 2, segment: 'Mile 5' })]} gender={gender} />)
        expect(screen.getByText('Gender Pl')).not.toHaveClass('hidden')
    })

    it.each(['', ' ', 'Not Specified'])('hides gender places when the gender is "%s"', (gender) => {
        render(<PersonDistance results={[makeTimeResult({ gender, ranking: 3, gender_ranking: 2, segment: 'Mile 5' })]} gender={gender} />)
        expect(screen.getByText('Gender Pl')).toHaveClass('hidden')
    })
})
