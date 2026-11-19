import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { useContext, useEffect } from 'react'
import { LiveProvider } from './LiveStatus'
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
})
