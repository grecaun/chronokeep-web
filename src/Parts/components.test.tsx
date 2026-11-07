import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import ErrorMsg from './ErrorMsg'
import PersonTime from './PersonTime'
import DateString from './DateString'
import { makeTimeResult } from '../test/helpers'
import { PersonResultsProps } from '../Interfaces/props'

describe('ErrorMsg', () => {
    it('shows the off course page for a 404', () => {
        render(<ErrorMsg status={404} message="ignored" />)
        expect(screen.getByText('404')).toBeInTheDocument()
        expect(screen.getByText('You appear to be off course.')).toBeInTheDocument()
        expect(screen.queryByText('ignored')).not.toBeInTheDocument()
        expect(document.title).toBe('Chronokeep - 404 - Off Course')
    })

    it('shows the status and message for other errors', () => {
        render(<ErrorMsg status={500} message="Database down" />)
        expect(screen.getByText('500')).toBeInTheDocument()
        expect(screen.getByText(/Something went wrong/)).toBeInTheDocument()
        expect(screen.getByText('Database down')).toBeInTheDocument()
        expect(document.title).toBe('Chronokeep - 500')
    })

    it('hides the message when it is null', () => {
        const { container } = render(<ErrorMsg status={500} message={null} />)
        expect(container.querySelector('.h6')).toBeNull()
    })
})

describe('PersonTime', () => {
    function renderTimes(results: PersonResultsProps['results']) {
        return render(<PersonTime {...({ results } as PersonResultsProps)} />)
    }

    it('renders nothing without results', () => {
        const { container } = renderTimes([])
        expect(container).toBeEmptyDOMElement()
    })

    it('shows lap times as the difference from the previous lap', () => {
        renderTimes([
            makeTimeResult({ segment: 'Finish', occurence: 1, chip_seconds: 300, chip_milliseconds: 800 }),
            makeTimeResult({ segment: 'Finish', occurence: 2, chip_seconds: 610, chip_milliseconds: 200 }),
            makeTimeResult({ segment: 'Turnaround', occurence: 3, chip_seconds: 900, chip_milliseconds: 500 }),
        ])

        const rows = screen.getAllByRole('row').slice(2)
        const cells = rows.map(row => within(row).getAllByRole('cell').map(c => c.textContent))
        expect(cells).toEqual([
            ['Lap 1', '05:00.8', '05:00.8'],
            // 610.2 - 300.8 borrows a second: 309.4
            ['Lap 2', '05:09.4', '10:10.2'],
            ['Turnaround', '04:50.3', '15:00.5'],
        ])
    })
})

describe('DateString in a component', () => {
    it('can be rendered directly', () => {
        render(<span>{DateString('2024-02-29T00:00:00')}</span>)
        expect(screen.getByText('February 29, 2024')).toBeInTheDocument()
    })
})
