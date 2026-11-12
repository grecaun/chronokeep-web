import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Pagination from './Pagination'

// Each item's text, or its button's label for the icon-only previous and next buttons.
function labels() {
    return screen.getAllByRole('listitem').map(item => item.querySelector('button')?.getAttribute('aria-label') ?? item.textContent)
}

describe('Pagination', () => {
    it('shows nothing for a single page', () => {
        const { container } = render(<Pagination label="Pages" page={1} pageCount={1} onPage={() => {}} />)
        expect(container).toBeEmptyDOMElement()
    })

    it('numbers every page when there are only a few', () => {
        render(<Pagination label="Pages" page={1} pageCount={4} onPage={() => {}} />)
        expect(labels()).toEqual(['Previous page', '1', '2', '3', '4', 'Next page'])
        expect(screen.getByRole('button', { name: '1' })).toHaveAttribute('aria-current', 'page')
        expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled()
    })

    it('skips far pages with a gap', () => {
        render(<Pagination label="Pages" page={6} pageCount={12} onPage={() => {}} />)
        expect(labels()).toEqual(['Previous page', '1', '…', '5', '6', '7', '…', '12', 'Next page'])
    })

    it('shows the page instead of a gap that would hide only one', () => {
        render(<Pagination label="Pages" page={4} pageCount={10} onPage={() => {}} />)
        expect(labels()).toEqual(['Previous page', '1', '2', '3', '4', '5', '…', '10', 'Next page'])
    })

    it('reports the page picked', async () => {
        const onPage = vi.fn()
        render(<Pagination label="Pages" page={2} pageCount={3} onPage={onPage} />)

        await userEvent.click(screen.getByRole('button', { name: 'Next page' }))
        await userEvent.click(screen.getByRole('button', { name: '1' }))

        expect(onPage.mock.calls).toEqual([[3], [1]])
        expect(screen.getByRole('button', { name: 'Next page' })).toBeEnabled()
    })
})
