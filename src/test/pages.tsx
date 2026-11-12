/* eslint-disable react-refresh/only-export-components -- test helpers, never hot reloaded */
import { Component, ReactElement, ReactNode } from 'react'
import { vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { Event, EventYear, TimeResult } from '../Interfaces/types'

/** Shows the current path and query string so tests can check navigation. */
export function LocationDisplay() {
    const location = useLocation()
    return <div data-testid="location">{`${location.pathname}${location.search}`}</div>
}

/**
 * Renders an element on a route pattern at a given url, with a catch-all route
 * that shows where the router ended up after any redirect.
 */
export function renderAt(url: string, pattern: string, element: ReactElement) {
    return render(
        <MemoryRouter initialEntries={[url]}>
            <Routes>
                <Route path={pattern} element={<>{element}<LocationDisplay /></>} />
                <Route path="*" element={<LocationDisplay />} />
            </Routes>
        </MemoryRouter>
    )
}

type FetchHandler = (url: string, init?: RequestInit) => Response | Promise<Response>

/**
 * Mocks fetch by url. Each key is matched against the request url with endsWith.
 * Unmatched urls return a 404 so a missing handler shows up as an error state.
 */
export function routeFetch(routes: Record<string, unknown>) {
    const fn = vi.fn((input: string, init?: RequestInit) => {
        for (const key of Object.keys(routes)) {
            if (input.endsWith(key)) {
                const handler = routes[key]
                if (typeof handler === 'function') {
                    return Promise.resolve((handler as FetchHandler)(input, init))
                }
                return Promise.resolve(new Response(JSON.stringify(handler), { status: 200 }))
            }
        }
        return Promise.resolve(new Response(JSON.stringify({ message: 'Not Found' }), { status: 404 }))
    })
    vi.stubGlobal('fetch', fn)
    return fn
}

export function makeEvent(overrides: Partial<Event> = {}): Event {
    return {
        name: 'Test Race',
        cert_name: '',
        slug: 'test-race',
        website: '',
        image: '',
        contact_email: '',
        access_restricted: false,
        type: 'distance',
        recent_time: '2020-06-01T08:00:00Z',
        ...overrides,
    }
}

export function makeYear(overrides: Partial<EventYear> = {}): EventYear {
    return {
        year: '2020',
        date_time: '2020-06-01T08:00:00',
        live: false,
        days_allowed: 0,
        ranking_type: 'gun',
        ...overrides,
    }
}

/** A /results API response. Defaults to an old event so the SMS forms stay hidden. */
export function makeResultsResponse(results: { [distance: string]: TimeResult[] }, overrides: Record<string, unknown> = {}) {
    return {
        count: Object.values(results).reduce((total, list) => total + list.length, 0),
        event: makeEvent(),
        years: [makeYear()],
        event_year: makeYear(),
        results,
        participants: [],
        distances: [],
        ...overrides,
    }
}

/** Returns the text of every cell in each body row of a table. */
export function tableRows(table: HTMLElement): string[][] {
    const out: string[][] = []
    table.querySelectorAll('tbody tr').forEach(row => {
        const cells: string[] = []
        row.querySelectorAll('td').forEach(cell => cells.push(cell.textContent ?? ''))
        out.push(cells)
    })
    return out
}

/** Catches render errors so a crashing page shows a message instead of failing the whole run. */
export class TestErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
    state = { error: null as Error | null }

    static getDerivedStateFromError(error: Error) {
        return { error }
    }

    render() {
        if (this.state.error !== null) {
            return <div data-testid="crashed">{this.state.error.message}</div>
        }
        return this.props.children
    }
}

/** Opens the year dropdown and returns its options in order, marking the selected one with a *. */
export async function yearOptions(): Promise<string[]> {
    await userEvent.click(await screen.findByLabelText('Year'))
    return screen.getAllByRole('option').map(option =>
        `${option.textContent ?? ''}${option.getAttribute('aria-selected') === 'true' ? '*' : ''}`)
}

/** Picks a year from the year dropdown. */
export async function pickYear(year: string) {
    await userEvent.click(await screen.findByLabelText('Year'))
    await userEvent.click(screen.getByRole('option', { name: year }))
}

/**
 * Problems with the page's form labels and ids: a label whose `for` matches no
 * element, or an id used more than once. Returns an empty list when there are none.
 */
export function labelProblems(): string[] {
    const problems: string[] = []
    document.querySelectorAll('label[for]').forEach(label => {
        const target = label.getAttribute('for')!
        if (document.getElementById(target) === null) {
            problems.push(`label "${label.textContent}" points at missing id "${target}"`)
        }
    })
    const seen = new Set<string>()
    document.querySelectorAll('[id]').forEach(el => {
        if (seen.has(el.id)) {
            problems.push(`id "${el.id}" is used more than once`)
        }
        seen.add(el.id)
    })
    return problems
}
