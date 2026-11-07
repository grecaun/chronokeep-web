import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

const tokens = { access_token: 'access', refresh_token: 'refresh' }

// The auth service reads localStorage at import, so each test gets fresh modules.
beforeEach(() => {
    vi.resetModules()
    localStorage.clear()
})

async function renderPrivate(page: string) {
    const { PrivateRoute } = await import('./PrivateRoute')
    render(
        <MemoryRouter initialEntries={[`/${page}`]}>
            <Routes>
                <Route path={`/${page}`} element={<PrivateRoute page={page} />}>
                    <Route index element={<div>secret page</div>} />
                </Route>
                <Route path={`/${page}/login`} element={<div>login page</div>} />
            </Routes>
        </MemoryRouter>
    )
}

describe('PrivateRoute', () => {
    it('redirects to the account login when logged out', async () => {
        await renderPrivate('account')
        expect(screen.getByText('login page')).toBeInTheDocument()
    })

    it('shows the page when the API user is logged in', async () => {
        localStorage.setItem('currentUser', JSON.stringify(tokens))
        await renderPrivate('account')
        expect(screen.getByText('secret page')).toBeInTheDocument()
    })

    it('checks the remote user for other pages', async () => {
        localStorage.setItem('currentUser', JSON.stringify(tokens))
        await renderPrivate('remote')
        expect(screen.getByText('login page')).toBeInTheDocument()
    })

    it('shows remote pages when the remote user is logged in', async () => {
        localStorage.setItem('currentRemoteUser', JSON.stringify(tokens))
        await renderPrivate('remote')
        expect(screen.getByText('secret page')).toBeInTheDocument()
    })
})

describe('Header', () => {
    async function renderHeader(page: string) {
        const { default: Header } = await import('../Parts/Header')
        render(
            <MemoryRouter>
                <Header page={page} />
            </MemoryRouter>
        )
    }

    it('shows login and hides account when logged out', async () => {
        await renderHeader('')
        expect(screen.getByRole('link', { name: 'Login' })).toHaveAttribute('href', '/login')
        expect(screen.queryByRole('link', { name: 'Account' })).not.toBeInTheDocument()
        expect(screen.getByRole('link', { name: 'Events' })).toHaveClass('active')
    })

    it('shows logout and account when logged in', async () => {
        localStorage.setItem('currentUser', JSON.stringify(tokens))
        await renderHeader('account')
        expect(screen.getByRole('link', { name: 'Logout' })).toHaveAttribute('href', '/logout')
        expect(screen.getByRole('link', { name: 'Account' })).toHaveClass('active')
        expect(screen.getByRole('link', { name: 'Events' })).not.toHaveClass('active')
    })
})
