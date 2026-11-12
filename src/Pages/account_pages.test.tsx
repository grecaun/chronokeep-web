import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { makeEvent, makeYear, renderAt, routeFetch, labelProblems } from '../test/pages'
import { Participant } from '../Interfaces/types'

const tokens = { access_token: 'access', refresh_token: 'refresh' }

// The auth service reads localStorage at import, so each test gets fresh modules.
beforeEach(() => {
    vi.resetModules()
    localStorage.clear()
    localStorage.setItem('currentUser', JSON.stringify(tokens))
    localStorage.setItem('currentRemoteUser', JSON.stringify(tokens))
})

function makeParticipant(overrides: Partial<Participant> = {}): Participant {
    return {
        id: '1',
        bib: '100',
        first: 'Jane',
        last: 'Doe',
        birthdate: '1990-01-01',
        gender: 'F',
        age_group: '30-39',
        distance: '5K',
        anonymous: false,
        sms_enabled: false,
        mobile: '',
        apparel: '',
        ...overrides,
    }
}

describe('Account page', () => {
    function accountResponse(type: string, extra: Record<string, unknown> = {}) {
        return {
            account: { name: 'Me', email: 'me@example.com', type },
            keys: [
                { name: 'Main', value: 'key-1', type: 'read', allowed_hosts: '', valid_until: null },
                { name: 'Other', value: 'key-2', type: 'write', allowed_hosts: '', valid_until: null },
            ],
            events: [],
            linked: [],
            ...extra,
        }
    }

    async function renderAccount(page: string) {
        const { default: Account } = await import('./Account')
        renderAt(`/${page}`, `/${page}`, <Account page={page} />)
    }

    it('shows account info and keys', async () => {
        routeFetch({ '/account': accountResponse('free') })
        await renderAccount('account')

        expect(await screen.findByText('Account Info')).toBeInTheDocument()
        expect(screen.getByText('Keys')).toBeInTheDocument()
        expect(screen.getByAltText('delete key key-1')).toBeInTheDocument()
        expect(screen.getByAltText('delete key key-2')).toBeInTheDocument()
        // only admins can add accounts, only paid/admin can link
        expect(screen.queryByText('Add Account')).not.toBeInTheDocument()
        expect(screen.queryByText('Linked Accounts')).not.toBeInTheDocument()
        expect(document.title).toBe('Chronokeep - Account')
    })

    it('shows admin tools to admins', async () => {
        routeFetch({ '/account': accountResponse('admin') })
        await renderAccount('account')

        expect(await screen.findByText('Add Account')).toBeInTheDocument()
        expect(screen.getByText('Linked Accounts')).toBeInTheDocument()
    })

    it('connects every form label to its input, with no repeated ids', async () => {
        routeFetch({ '/account': accountResponse('admin', { linked: [{ name: 'Pal', email: 'pal@example.com', type: 'free' }] }) })
        await renderAccount('account')

        await screen.findByText('Add Account')
        expect(labelProblems()).toEqual([])
        // a few spot checks that the labels reach the right fields
        expect(screen.getByLabelText('Old Password')).toHaveAttribute('name', 'oldPassword')
        expect(screen.getByLabelText('Repeat New Password')).toHaveAttribute('name', 'repeatPassword')
        expect(screen.getAllByLabelText('Allowed Hosts')).toHaveLength(3)
    })

    it('hides keys from registration accounts', async () => {
        routeFetch({ '/account': accountResponse('registration') })
        await renderAccount('account')

        await screen.findByText('Account Info')
        expect(screen.queryByText('Keys')).not.toBeInTheDocument()
    })

    it('shows the event list on the account page only', async () => {
        const events = [makeEvent({ name: 'My Race', slug: 'my-race' })]
        routeFetch({ '/account': accountResponse('free', { events }) })
        await renderAccount('account')

        expect(await screen.findByRole('heading', { name: 'Events' })).toBeInTheDocument()
    })

    it('adds a logout button on the remote page', async () => {
        routeFetch({ '/account': accountResponse('free', { events: [makeEvent()] }) })
        await renderAccount('remote')

        expect(await screen.findByRole('link', { name: 'Logout' })).toHaveAttribute('href', '/remote/logout')
        expect(screen.queryByRole('heading', { name: 'Events' })).not.toBeInTheDocument()
        expect(document.title).toBe('Chronokeep - Remote')
    })

    it('deletes a key after confirming', async () => {
        const fetch = routeFetch({
            '/account': accountResponse('free'),
            '/key/delete': {},
        })
        await renderAccount('account')

        await userEvent.click(await screen.findByAltText('edit key key-1'))
        await userEvent.click(screen.getByAltText('delete key key-1'))
        expect(screen.getByText('Deletion of this key is permanent.').closest('.modal')).toHaveClass('show')
        await userEvent.click(screen.getByRole('button', { name: 'Delete' }))

        await waitFor(() => expect(screen.queryByAltText('delete key key-1')).not.toBeInTheDocument())
        expect(screen.getByAltText('delete key key-2')).toBeInTheDocument()
        const call = fetch.mock.calls.find(c => c[0].endsWith('/key/delete'))!
        expect(JSON.parse(call[1]!.body as string)).toEqual({ key: 'key-1' })
    })

    it('keeps the key when the delete is cancelled', async () => {
        const fetch = routeFetch({ '/account': accountResponse('free') })
        await renderAccount('account')

        await userEvent.click(await screen.findByAltText('edit key key-1'))
        await userEvent.click(screen.getByAltText('delete key key-1'))
        const modal = screen.getByText('Deletion of this key is permanent.').closest('.modal') as HTMLElement
        await userEvent.click(within(modal).getByRole('button', { name: 'Cancel' }))

        expect(modal).not.toHaveClass('show')
        expect(screen.getByAltText('delete key key-1')).toBeInTheDocument()
        expect(fetch.mock.calls.some(c => c[0].endsWith('/key/delete'))).toBe(false)
    })

    it.each([
        ['account', '/login'],
        ['remote', '/remote/login'],
    ])('sends the %s page to %s when the token is rejected', async (page, path) => {
        localStorage.setItem('currentUser', JSON.stringify({ access_token: 'a', refresh_token: '' }))
        localStorage.setItem('currentRemoteUser', JSON.stringify({ access_token: 'a', refresh_token: '' }))
        routeFetch({ '/account': () => new Response(JSON.stringify({ message: 'expired' }), { status: 401 }) })
        await renderAccount(page)

        await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent(path))
    })

    it('shows other errors', async () => {
        routeFetch({ '/account': () => new Response(JSON.stringify({ message: 'Server Error' }), { status: 500 }) })
        await renderAccount('account')
        expect(await screen.findByText('Server Error')).toBeInTheDocument()
    })
})

describe('Checkin page', () => {
    async function renderCheckin(response: unknown) {
        routeFetch({ '/r/participants': response })
        const { default: Checkin } = await import('./Checkin')
        renderAt('/checkin/test-race/2020', '/checkin/:slug/:year?', <Checkin />)
    }

    function names() {
        return Array.from(document.querySelectorAll('.part-name-holder')).map(el => el.textContent)
    }

    it('lists participants sorted by name and filters by search', async () => {
        await renderCheckin({
            event: makeEvent(),
            year: makeYear(),
            participants: [
                makeParticipant({ id: '1', first: 'Zed', last: 'Smith' }),
                makeParticipant({ id: '2', first: 'Amy', last: 'Smith' }),
                makeParticipant({ id: '3', first: 'Bob', last: 'Jones', distance: '10K' }),
            ],
        })

        expect(await screen.findByText('2020 Test Race Results')).toBeInTheDocument()
        expect(names()).toEqual(['Bob Jones', 'Amy Smith', 'Zed Smith'])
        expect(document.title).toBe('Chronokeep - 2020 Test Race Check-in')

        await userEvent.type(screen.getByPlaceholderText('Search'), 'SMITH ')
        expect(names()).toEqual(['Amy Smith', 'Zed Smith'])
    })

    it('connects every check-in label to its own row', async () => {
        await renderCheckin({
            event: makeEvent(),
            year: makeYear(),
            participants: [
                makeParticipant({ id: '1', first: 'Zed', last: 'Smith' }),
                makeParticipant({ id: '2', first: 'Amy', last: 'Smith' }),
            ],
        })

        // open both rows' forms
        await userEvent.click(await screen.findByText('Amy Smith'))
        await userEvent.click(screen.getByText('Zed Smith'))

        expect(labelProblems()).toEqual([])
        // each row's First Name label reaches that row's input
        expect(screen.getAllByLabelText('First Name').map(input => (input as HTMLInputElement).value)).toEqual(expect.arrayContaining(['Amy', 'Zed']))
    })

    it('says when there is nobody to check in', async () => {
        await renderCheckin({ event: makeEvent(), year: makeYear(), participants: [] })
        expect(await screen.findByText('No participants to check-in.')).toBeInTheDocument()
    })

    it('sends logged out users to the login page', async () => {
        localStorage.setItem('currentUser', JSON.stringify({ access_token: 'a', refresh_token: '' }))
        await renderCheckin(() => new Response(JSON.stringify({ message: 'expired' }), { status: 401 }))
        await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/login'))
    })

    it('shows other errors', async () => {
        await renderCheckin(() => new Response(JSON.stringify({ message: 'Event Not Found' }), { status: 404 }))
        expect(await screen.findByText('You appear to be off course.')).toBeInTheDocument()
    })
})
