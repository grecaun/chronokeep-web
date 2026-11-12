import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import { useContext, useEffect } from 'react'
import { LiveProvider, REFRESH_CONFIRM_WINDOW } from './LiveStatus'
import { LiveContext } from './liveContext'

// Stands in for a page whose loader is watching for live results.
function Watching() {
    const live = useContext(LiveContext)
    useEffect(() => live?.watch(), [live])
    return <p>results</p>
}

function renderPage(watching: boolean) {
    return render(<LiveProvider>{watching ? <Watching /> : <p>results</p>}</LiveProvider>)
}

function pressRefresh(init: KeyboardEventInit = { key: 'F5' }) {
    const event = new KeyboardEvent('keydown', { cancelable: true, ...init })
    act(() => { window.dispatchEvent(event) })
    return event
}

function leavePage() {
    const event = new Event('beforeunload', { cancelable: true })
    window.dispatchEvent(event)
    return event
}

describe('LiveProvider', () => {
    beforeEach(() => {
        vi.useFakeTimers()
    })
    afterEach(() => {
        vi.useRealTimers()
    })

    it('shows nothing and allows refreshing when no page is live', () => {
        renderPage(false)

        expect(screen.queryByText('Live')).not.toBeInTheDocument()
        expect(pressRefresh().defaultPrevented).toBe(false)
        expect(leavePage().defaultPrevented).toBe(false)
    })

    it('shows the live badge while a page is watching', () => {
        const { rerender } = renderPage(true)

        expect(screen.getByText('Live')).toBeInTheDocument()
        expect(screen.getByText('Results update automatically')).toBeInTheDocument()

        rerender(<LiveProvider><p>results</p></LiveProvider>)
        expect(screen.queryByText('Live')).not.toBeInTheDocument()
    })

    it.each([
        ['F5', { key: 'F5' }],
        ['Ctrl+R', { key: 'r', ctrlKey: true }],
        ['Cmd+R', { key: 'r', metaKey: true }],
        ['Ctrl+Shift+R', { key: 'R', ctrlKey: true, shiftKey: true }],
    ])('stops %s once with a notice, then lets a second press refresh', (_name, init) => {
        renderPage(true)

        expect(pressRefresh(init).defaultPrevented).toBe(true)
        expect(screen.getByRole('status')).toHaveTextContent("there's no need to refresh")

        expect(pressRefresh(init).defaultPrevented).toBe(false)
        // and the browser doesn't ask a second time
        expect(leavePage().defaultPrevented).toBe(false)
    })

    it('goes back to stopping refreshes once the notice has gone', () => {
        renderPage(true)
        pressRefresh()

        act(() => { vi.advanceTimersByTime(REFRESH_CONFIRM_WINDOW) })
        expect(screen.queryByRole('status')).not.toBeInTheDocument()
        expect(pressRefresh().defaultPrevented).toBe(true)
    })

    it("guards again if the second press didn't end up reloading", () => {
        renderPage(true)
        pressRefresh()
        pressRefresh()

        act(() => { vi.advanceTimersByTime(REFRESH_CONFIRM_WINDOW) })
        expect(leavePage().defaultPrevented).toBe(true)
        expect(pressRefresh().defaultPrevented).toBe(true)
    })

    it('leaves other keys alone', () => {
        renderPage(true)
        expect(pressRefresh({ key: 'r' }).defaultPrevented).toBe(false)
        expect(pressRefresh({ key: 'F6' }).defaultPrevented).toBe(false)
    })

    it("asks the browser to confirm leaving or refreshing with its own button", () => {
        renderPage(true)
        expect(leavePage().defaultPrevented).toBe(true)
    })

    it("turns off pull-to-refresh while live and puts it back after", () => {
        const { unmount } = renderPage(true)
        expect(document.documentElement.style.overscrollBehaviorY).toBe('contain')

        unmount()
        expect(document.documentElement.style.overscrollBehaviorY).toBe('')
        expect(leavePage().defaultPrevented).toBe(false)
    })
})
