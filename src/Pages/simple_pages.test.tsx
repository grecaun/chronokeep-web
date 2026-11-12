import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, data, RouterProvider } from 'react-router-dom'
import { jsonResponse, mockFetch } from '../test/helpers'
import { makeEvent, makeResultsResponse, makeYear, renderAt, routeFetch } from '../test/pages'
import Events from './Events'
import Subscribe from './Subscribe'
import Unsubscribe from './Unsubscribe'
import QRCode from './QRCode'
import NoCheckQRCode from './NoCheckQRCode'
import ErrorPage from './Error'
import DefaultPage from './DefaultPage'

// The QR library draws on a canvas, which jsdom doesn't have.
vi.mock('react-qrcode-logo', () => ({
    QRCode: (props: { value: string }) => <div data-testid="qr">{props.value}</div>,
}))

const tokens = { access_token: 'access', refresh_token: 'refresh' }

describe('Events page', () => {
    // Pretend today is June 15, 2024, so events split into upcoming and past the same way every run.
    beforeEach(() => {
        vi.useFakeTimers({ toFake: ['Date'] })
        vi.setSystemTime(new Date('2024-06-15T12:00:00'))
    })
    afterEach(() => {
        vi.useRealTimers()
    })

    // n days after June 15, 2024 (negative for before), as the API's local midnight
    function day(n: number) {
        const date = new Date(2024, 5, 15 + n)
        return `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, '0')}-${`${date.getDate()}`.padStart(2, '0')}T00:00:00-07:00`
    }

    function renderEvents(events: ReturnType<typeof makeEvent>[], url = '/') {
        mockFetch(jsonResponse(200, { events }))
        renderAt(url, '/', <Events />)
    }

    // Each listed event as "name" plus its timing label, if any, e.g. "Tomorrow [Upcoming]".
    function listed() {
        return within(screen.getByRole('region', { name: 'Events' })).getAllByRole('link').map(link => {
            const date = link.querySelector('small')!
            return `${link.querySelector('span')!.textContent}${date.title ? ` [${date.title}]` : ''}`
        })
    }

    function pastEvents(count: number) {
        return Array.from({ length: count }, (_, i) => makeEvent({ name: `Gone ${i + 1}`, slug: `gone${i + 1}`, recent_time: day(-(i + 1)) }))
    }

    it("lists today's events, then upcoming soonest first, then past most recent first", async () => {
        renderEvents([
            makeEvent({ name: 'Last Week', slug: 'a', recent_time: day(-7) }),
            makeEvent({ name: 'Next Month', slug: 'b', recent_time: day(30) }),
            makeEvent({ name: 'Today', slug: 'c', recent_time: day(0) }),
            makeEvent({ name: 'Last Year', slug: 'd', recent_time: day(-365) }),
            makeEvent({ name: 'Tomorrow', slug: 'e', recent_time: day(1) }),
            makeEvent({ name: 'Yesterday', slug: 'f', recent_time: day(-1) }),
        ])

        await screen.findByRole('region', { name: 'Events' })
        expect(listed()).toEqual([
            'Today [Today]',
            'Tomorrow [Upcoming]',
            'Next Month [Upcoming]',
            'Yesterday',
            'Last Week',
            'Last Year',
        ])
        expect(screen.getByRole('link', { name: /Tomorrow/ })).toHaveAttribute('href', '/results/e')
    })

    it('tints the date for today and upcoming events, and says which for screen readers', async () => {
        renderEvents([
            makeEvent({ name: 'Now', slug: 'now', recent_time: day(0) }),
            makeEvent({ name: 'Soon', slug: 'soon', recent_time: day(1) }),
            makeEvent({ name: 'Gone', slug: 'gone', recent_time: day(-1) }),
        ])

        await screen.findByRole('region', { name: 'Events' })
        const dateOf = (name: string) => screen.getByRole('link', { name: new RegExp(`^${name}`) }).querySelector('small')!

        expect(dateOf('Now')).toHaveClass('bg-danger-subtle')
        expect(screen.getByRole('link', { name: 'Now Today, June 15, 2024' })).toBeInTheDocument()

        expect(dateOf('Soon')).toHaveClass('bg-primary-subtle')
        expect(screen.getByRole('link', { name: 'Soon Upcoming, June 16, 2024' })).toBeInTheDocument()

        expect(dateOf('Gone')).not.toHaveClass('bg-danger-subtle')
        expect(dateOf('Gone')).not.toHaveClass('bg-primary-subtle')
        expect(screen.getByRole('link', { name: 'Gone June 14, 2024' })).toBeInTheDocument()
    })

    it('shows 15 events per page across today, upcoming, and past events', async () => {
        const upcoming = Array.from({ length: 3 }, (_, i) => makeEvent({ name: `Soon ${i + 1}`, slug: `soon${i + 1}`, recent_time: day(i + 1) }))
        renderEvents([...upcoming, ...pastEvents(20)])

        await screen.findByRole('region', { name: 'Events' })
        expect(listed()).toHaveLength(15)
        expect(listed().slice(0, 4)).toEqual(['Soon 1 [Upcoming]', 'Soon 2 [Upcoming]', 'Soon 3 [Upcoming]', 'Gone 1'])

        await userEvent.click(screen.getByRole('button', { name: 'Next page' }))
        expect(listed()).toEqual(['Gone 13', 'Gone 14', 'Gone 15', 'Gone 16', 'Gone 17', 'Gone 18', 'Gone 19', 'Gone 20'])
        expect(screen.getByTestId('location')).toHaveTextContent('/?page=2')
    })

    it('opens on the page in the url', async () => {
        renderEvents(pastEvents(20), '/?page=2')

        await screen.findByRole('region', { name: 'Events' })
        expect(listed()).toEqual(['Gone 16', 'Gone 17', 'Gone 18', 'Gone 19', 'Gone 20'])
    })

    it('searches by name and starts back on the first page', async () => {
        renderEvents([
            makeEvent({ name: 'Lake Run', slug: 'lake-soon', recent_time: day(3) }),
            makeEvent({ name: 'Hill Climb', slug: 'hill', recent_time: day(4) }),
            makeEvent({ name: 'Old Lake Run', slug: 'lake-old', recent_time: day(-40) }),
            ...pastEvents(25),
        ], '/?page=2')

        await userEvent.type(await screen.findByRole('searchbox', { name: 'Search events' }), 'LAKE')

        expect(listed()).toEqual(['Lake Run [Upcoming]', 'Old Lake Run'])
        expect(screen.getByTestId('location')).toHaveTextContent('/?search=LAKE')
    })

    it('says when no events match the search', async () => {
        renderEvents([makeEvent({ name: 'Old Race', slug: 'old', recent_time: day(-10) })])

        await userEvent.type(await screen.findByRole('searchbox', { name: 'Search events' }), 'zzz')

        expect(screen.getByText('No events match your search.')).toBeInTheDocument()
        expect(screen.queryByRole('region', { name: 'Events' })).not.toBeInTheDocument()
    })

    it('lists past events newest first with links to their results', async () => {
        mockFetch(jsonResponse(200, {
            events: [
                makeEvent({ name: 'Old Race', slug: 'old', recent_time: '2019-01-01T00:00:00Z' }),
                makeEvent({ name: 'New Race', slug: 'new', recent_time: '2024-01-01T00:00:00Z' }),
                makeEvent({ name: 'Mid Race', slug: 'mid', recent_time: '2021-01-01T00:00:00Z' }),
            ],
        }))
        renderAt('/', '/', <Events />)

        expect(screen.getByText('Loading')).toBeInTheDocument()
        await screen.findByText('New Race')

        const links = screen.getAllByRole('link')
        expect(links.map(l => l.querySelector('span')!.textContent)).toEqual(['New Race', 'Mid Race', 'Old Race'])
        expect(links[0]).toHaveAttribute('href', '/results/new')
        expect(document.title).toBe('Chronokeep - Events')
    })

    it('says when there are no events', async () => {
        mockFetch(jsonResponse(200, { events: [] }))
        renderAt('/', '/', <Events />)
        expect(await screen.findByText('No events found.')).toBeInTheDocument()
    })

    it('shows the error page when the API fails', async () => {
        mockFetch(jsonResponse(500, { message: 'Database down' }))
        renderAt('/', '/', <Events />)
        expect(await screen.findByText('Database down')).toBeInTheDocument()
        expect(document.title).toBe('Chronokeep - 500')
    })
})

describe.each([
    ['Subscribe', <Subscribe />, '/subscribe/:email', 'Thanks for letting us send you emails at me@example.com.', '/unsubscribe/me@example.com'],
    ['Unsubscribe', <Unsubscribe />, '/unsubscribe/:email', 'We will no longer send emails to you at me@example.com.', '/subscribe/me@example.com'],
])('%s page', (name, element, pattern, successText, otherLink) => {
    const url = `/${name.toLowerCase()}/me@example.com`

    it('shows success with a link to undo it', async () => {
        mockFetch(jsonResponse(200))
        renderAt(url, pattern, element)

        expect(await screen.findByText(successText)).toBeInTheDocument()
        expect(screen.getByRole('link', { name: 'click here' })).toHaveAttribute('href', otherLink)
        expect(document.title).toBe(`Chronokeep - ${name}`)
    })

    it('shows the error from the API', async () => {
        mockFetch(jsonResponse(400, { message: 'Invalid Email' }))
        renderAt(url, pattern, element)

        expect(await screen.findByText('Invalid Email')).toBeInTheDocument()
        expect(screen.getByText('400')).toBeInTheDocument()
    })
})

describe('QRCode page', () => {
    it.each([
        ['results', 'Results'],
        ['status', 'Status'],
        ['awards', 'Awards'],
        ['registration', 'Registration'],
        ['pntf', 'PNTF Championship Rankings'],
        ['pntf-awards', 'PNTF Championship Awards'],
        ['ytp-awards', 'YTP Awards'],
        ['ytp-series', 'YTP Series'],
        ['pntf-youth', 'PNTF Youth Championship Results'],
        ['team-results', 'Team Results'],
        ['series', 'Series Results'],
    ])('labels the %s page as %s', async (page, label) => {
        routeFetch({ '/results': makeResultsResponse({}) })
        renderAt('/results/test-race/qr', '/results/:slug/:year?/qr', <QRCode page={page} />)

        expect(await screen.findByText(`${label} By`)).toBeInTheDocument()
        expect(screen.getByText('Test Race')).toBeInTheDocument()
    })

    it('includes the year when the url has one', async () => {
        routeFetch({ '/results': makeResultsResponse({}, { event_year: makeYear({ year: '2019' }) }) })
        renderAt('/results/test-race/2019/qr', '/results/:slug/:year?/qr', <QRCode page="results" />)

        expect(await screen.findByText('2019 Test Race')).toBeInTheDocument()
        expect(document.title).toBe('Chronokeep - 2019 Test Race QRCode')
    })

    it('points the code at the page without the /qr suffix', async () => {
        routeFetch({ '/results': makeResultsResponse({}) })
        renderAt('/results/test-race/qr', '/results/:slug/:year?/qr', <QRCode page="results" />)

        const qr = await screen.findByTestId('qr')
        expect(qr.textContent).toBe(window.location.href.slice(0, -3))
    })

    it('shows the error page for a missing event', async () => {
        routeFetch({})
        renderAt('/results/nope/qr', '/results/:slug/:year?/qr', <QRCode page="results" />)
        expect(await screen.findByText('You appear to be off course.')).toBeInTheDocument()
    })
})

describe('NoCheckQRCode page', () => {
    it('renders a code without calling the API', () => {
        const fetch = mockFetch()
        renderAt('/double/race/qr', '/double/:slug/:year?/qr', <NoCheckQRCode />)
        expect(screen.getByTestId('qr')).toBeInTheDocument()
        expect(fetch).not.toHaveBeenCalled()
        expect(document.title).toBe('Chronokeep - QRCode')
    })
})

describe('Error page', () => {
    function renderError(thrown: unknown) {
        const router = createMemoryRouter([
            {
                path: '/results/:slug',
                loader: () => { throw thrown },
                element: <div>never shown</div>,
                errorElement: <ErrorPage />,
            },
        ], { initialEntries: ['/results/race'] })
        render(<RouterProvider router={router} />)
    }

    it('shows the message from a route error', async () => {
        renderError(data({ message: 'Event is private' }, { status: 403, statusText: 'Forbidden' }))
        expect(await screen.findByText('Event is private')).toBeInTheDocument()
        expect(screen.getByText('403')).toBeInTheDocument()
        // the header highlights the section from the url
        expect(screen.getByRole('link', { name: 'Events' })).not.toHaveClass('active')
    })

    it('falls back to the status text', async () => {
        renderError(data(null, { status: 500, statusText: 'Server Error' }))
        expect(await screen.findByText('Server Error')).toBeInTheDocument()
    })

    it('shows the off course page for a 404', async () => {
        renderError(data(null, { status: 404, statusText: 'Not Found' }))
        expect(await screen.findByText('You appear to be off course.')).toBeInTheDocument()
    })
})

describe('DefaultPage', () => {
    it('renders the header with the current section active and the child route', () => {
        const router = createMemoryRouter([
            {
                element: <DefaultPage />,
                children: [{ path: '/remote', element: <div>child page</div> }],
            },
        ], { initialEntries: ['/remote'] })
        render(<RouterProvider router={router} />)

        expect(screen.getByText('child page')).toBeInTheDocument()
        expect(screen.getByRole('link', { name: 'Remote' })).toHaveClass('active')
    })
})

describe('Login page', () => {
    beforeEach(() => {
        vi.resetModules()
        localStorage.clear()
    })

    async function renderLogin(page: string) {
        const { default: Login } = await import('./Login')
        renderAt(`/${page}/login`, `/${page}/login`, <Login page={page} />)
    }

    it('requires an email and password', async () => {
        const fetch = mockFetch()
        await renderLogin('account')

        await userEvent.click(screen.getByRole('button', { name: 'Login' }))

        expect(await screen.findByText('Email is required')).toBeInTheDocument()
        expect(screen.getByText('Password is required')).toBeInTheDocument()
        expect(fetch).not.toHaveBeenCalled()
    })

    it('logs in and goes to the account page', async () => {
        const fetch = mockFetch(jsonResponse(200, tokens))
        await renderLogin('account')

        await userEvent.type(screen.getByLabelText('Email'), 'me@example.com')
        await userEvent.type(screen.getByLabelText('Password'), 'pw')
        await userEvent.click(screen.getByRole('button', { name: 'Login' }))

        await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/account'))
        expect(fetch.mock.calls[0][0]).toBe('https://api.test/account/login')
    })

    it('logs in to the remote server from the remote page', async () => {
        const fetch = mockFetch(jsonResponse(200, tokens))
        await renderLogin('remote')

        await userEvent.type(screen.getByLabelText('Email'), 'me@example.com')
        await userEvent.type(screen.getByLabelText('Password'), 'pw')
        await userEvent.click(screen.getByRole('button', { name: 'Login' }))

        await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/remote'))
        expect(fetch.mock.calls[0][0]).toBe('https://remote.test/account/login')
    })

    it('shows the error from a failed login', async () => {
        mockFetch(jsonResponse(401, { message: 'Invalid Credentials' }))
        await renderLogin('account')

        await userEvent.type(screen.getByLabelText('Email'), 'me@example.com')
        await userEvent.type(screen.getByLabelText('Password'), 'bad')
        await userEvent.click(screen.getByRole('button', { name: 'Login' }))

        expect(await screen.findByText('Invalid Credentials')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument()
    })

    it('redirects when already logged in', async () => {
        localStorage.setItem('currentUser', JSON.stringify(tokens))
        await renderLogin('account')
        expect(screen.getByTestId('location')).toHaveTextContent('/account')
    })
})

describe('Logout page', () => {
    beforeEach(() => {
        vi.resetModules()
        localStorage.clear()
    })

    it('shows a message while logging out then goes home', async () => {
        localStorage.setItem('currentUser', JSON.stringify(tokens))
        mockFetch(jsonResponse(200))
        const { default: Logout } = await import('./Logout')
        renderAt('/logout', '/logout', <Logout page="account" />)

        expect(screen.getByText('Logging out...')).toBeInTheDocument()
        await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent(/^\/$/))
        expect(localStorage.getItem('currentUser')).toBeNull()
    })
})
