import { vi } from 'vitest'
import { TimeResult } from '../Interfaces/types'

/** Builds a fetch Response with a JSON body (or an empty body when body is undefined). */
export function jsonResponse(status: number, body?: unknown, statusText = ''): Response {
    const text = body === undefined ? '' : JSON.stringify(body)
    return new Response(text, { status, statusText })
}

/** Replaces global fetch with a mock that returns the given responses in order. */
export function mockFetch(...responses: (Response | Error)[]) {
    const fn = vi.fn()
    for (const r of responses) {
        if (r instanceof Error) {
            fn.mockRejectedValueOnce(r)
        } else {
            fn.mockResolvedValueOnce(r)
        }
    }
    vi.stubGlobal('fetch', fn)
    return fn
}

/** Returns the parsed JSON body passed to the nth fetch call. */
export function fetchBody(fn: ReturnType<typeof vi.fn>, call = 0): unknown {
    const opts = fn.mock.calls[call][1] as RequestInit
    return JSON.parse(opts.body as string)
}

export function makeTimeResult(overrides: Partial<TimeResult> = {}): TimeResult {
    return {
        person_id: '1',
        bib: '100',
        first: 'Jane',
        last: 'Doe',
        seconds: 0,
        milliseconds: 0,
        chip_seconds: 0,
        chip_milliseconds: 0,
        gender: 'F',
        occurence: 1,
        age_group: '30-39',
        age: 33,
        ranking: 1,
        age_ranking: 1,
        gender_ranking: 1,
        finish: true,
        segment: 'Finish',
        type: 0,
        anonymous: false,
        distance: '5K',
        location: 'Finish',
        local_time: '',
        division: '',
        division_ranking: 0,
        ...overrides,
    }
}
