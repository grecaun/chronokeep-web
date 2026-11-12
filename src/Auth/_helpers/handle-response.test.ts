import { beforeEach, describe, expect, it, vi } from 'vitest'
import { jsonResponse } from '../../test/helpers'
import { handleResponse, handleResponseNoLogout } from './handle-response'

const logout = vi.hoisted(() => vi.fn())
vi.mock('../_services/authentication.service', () => ({
    authenticationService: { logout },
}))

beforeEach(() => {
    logout.mockReset()
    logout.mockResolvedValue(undefined)
})

describe('handleResponse', () => {
    it('returns parsed data and status for ok responses', async () => {
        const out = await handleResponse(jsonResponse(200, { keys: [] }))
        expect(out).toEqual({ data: { keys: [] }, status: 200 })
    })

    it('returns null data for an empty body', async () => {
        const out = await handleResponse(jsonResponse(200))
        expect(out).toEqual({ data: null, status: 200 })
    })

    it('rejects with the server message on errors', async () => {
        await expect(handleResponse(jsonResponse(500, { message: 'Boom' }, 'Server Error')))
            .rejects.toMatchObject({ message: 'Boom', status: 500 })
        expect(logout).not.toHaveBeenCalled()
    })

    it('falls back to the status text when there is no message', async () => {
        await expect(handleResponse(jsonResponse(400, undefined, 'Bad Request')))
            .rejects.toMatchObject({ message: 'Bad Request', status: 400 })
    })

    it.each([401, 403])('logs the user out on %i', async (status) => {
        await expect(handleResponse(jsonResponse(status, { message: 'nope' }), 'REMOTE'))
            .rejects.toMatchObject({ message: 'nope', status })
        expect(logout).toHaveBeenCalledWith('REMOTE')
    })

    it('defaults the logout to the API account', async () => {
        await expect(handleResponse(jsonResponse(401, { message: 'nope' }))).rejects.toBeDefined()
        expect(logout).toHaveBeenCalledWith('API')
    })
})

describe('handleResponseNoLogout', () => {
    it('returns parsed data for ok responses', async () => {
        const out = await handleResponseNoLogout(jsonResponse(200, { access_token: 'a' }))
        expect(out).toEqual({ data: { access_token: 'a' }, status: 200 })
    })

    it('rejects without logging out on 401', async () => {
        await expect(handleResponseNoLogout(jsonResponse(401, { message: 'expired' })))
            .rejects.toMatchObject({ message: 'expired', status: 401 })
        expect(logout).not.toHaveBeenCalled()
    })
})
