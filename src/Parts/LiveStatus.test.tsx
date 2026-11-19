import { describe, expect, it } from 'vitest'
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { useContext, useEffect } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { LiveProvider } from './LiveStatus'
import { LiveContext } from './liveContext'
import { RecentChange } from './recentChanges'

// Stands in for a page whose loader is watching for live results.
function Watching(props: { recent?: RecentChange[] }) {
    const live = useContext(LiveContext)
    useEffect(() => live?.watch(), [live])
    useEffect(() => {
        if (props.recent === undefined) {
            return
        }
        live?.setRecent(props.recent)
        return () => { live?.setRecent(null) }
    }, [live, props.recent])
    return <p>results</p>
}

const change = (name: string, secondsAgo: number, extra: Partial<RecentChange> = {}): RecentChange => ({
    key: name, name, detail: 'Finished 5K', time: '22:31', at: Date.now() - secondsAgo * 1000,
    link: `/results/race/2026/${name}`, ...extra,
})

function renderWithRecent(recent: RecentChange[]) {
    return render(<MemoryRouter><LiveProvider><Watching recent={recent} /></LiveProvider></MemoryRouter>)
}

function renderPage(watching: boolean) {
    return render(<LiveProvider>{watching ? <Watching /> : <p>results</p>}</LiveProvider>)
}

function pressRefresh() {
    const event = new KeyboardEvent('keydown', { cancelable: true, key: 'F5' })
    window.dispatchEvent(event)
    return event
}

function leavePage() {
    const event = new Event('beforeunload', { cancelable: true })
    window.dispatchEvent(event)
    return event
}

describe('LiveProvider', () => {
    it('shows nothing when no page is live', () => {
        renderPage(false)
        expect(screen.queryByText('Live')).not.toBeInTheDocument()
    })

    it('shows the live badge while a page is watching', () => {
        const { rerender } = renderPage(true)

        expect(screen.getByText('Live')).toBeInTheDocument()
        expect(screen.getByText('Results update automatically')).toBeInTheDocument()

        rerender(<LiveProvider><p>results</p></LiveProvider>)
        expect(screen.queryByText('Live')).not.toBeInTheDocument()
    })

    it('leaves refreshing and leaving the page alone while live', () => {
        renderPage(true)

        expect(pressRefresh().defaultPrevented).toBe(false)
        expect(leavePage().defaultPrevented).toBe(false)
        expect(document.documentElement.style.overscrollBehaviorY).toBe('')
    })

    it('keeps the badge plain when the page has no recent changes', () => {
        renderWithRecent([])

        expect(screen.getByText('Live')).toBeInTheDocument()
        expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('opens and closes the latest results from the badge', () => {
        renderWithRecent([change('Ann Alpha', 30), change('Ben Bravo', 300, { detail: 'Turnaround · Half', time: '1:02:03' })])
        const badge = screen.getByRole('button', { name: /Live/ })
        expect(badge).toHaveAttribute('aria-expanded', 'false')
        expect(screen.queryByText('Latest results')).not.toBeInTheDocument()

        fireEvent.click(badge)

        expect(badge).toHaveAttribute('aria-expanded', 'true')
        const items = within(screen.getByRole('list', { name: 'Latest results' })).getAllByRole('listitem')
        expect(items.map(i => i.textContent)).toEqual([
            'Ann Alpha22:31Finished 5K30s ago',
            'Ben Bravo1:02:03Turnaround · Half5m ago',
        ])
        expect(within(items[0]).getByRole('link', { name: 'Ann Alpha' })).toHaveAttribute('href', '/results/race/2026/Ann Alpha')

        fireEvent.click(badge)
        expect(screen.queryByText('Latest results')).not.toBeInTheDocument()
    })

    it('closes the latest results with Escape', () => {
        renderWithRecent([change('Ann Alpha', 30)])
        fireEvent.click(screen.getByRole('button', { name: /Live/ }))
        expect(screen.getByText('Latest results')).toBeInTheDocument()

        act(() => { window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })) })

        expect(screen.queryByText('Latest results')).not.toBeInTheDocument()
    })

    it('shows the newest list the page gives it', () => {
        const { rerender } = renderWithRecent([change('Ann Alpha', 30)])
        fireEvent.click(screen.getByRole('button', { name: /Live/ }))

        rerender(<MemoryRouter><LiveProvider><Watching recent={[change('Cat Charlie', 2), change('Ann Alpha', 32)]} /></LiveProvider></MemoryRouter>)

        expect(within(screen.getByRole('list', { name: 'Latest results' })).getAllByRole('link').map(l => l.textContent)).toEqual(['Cat Charlie', 'Ann Alpha'])
        expect(screen.getByText('just now')).toBeInTheDocument()
    })
})
