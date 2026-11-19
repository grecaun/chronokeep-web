import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { LIVE_POLL_INTERVAL, LIVE_STREAM_TIMEOUT, mightBeLive, readTime, useLiveUpdates } from './live'
import { makeTimeResult } from '../test/helpers'
import { installMockEventSource, MockEventSource } from '../test/eventSource'

describe('readTime', () => {
    it('reads ISO 8601 times with a UTC offset, as the desktop app sends them', () => {
        expect(readTime('2024-06-15T08:00:00.1234567-07:00')).toBe(Date.UTC(2024, 5, 15, 15, 0, 0, 123))
        expect(readTime('2024-06-15T08:00:00+05:30')).toBe(Date.UTC(2024, 5, 15, 2, 30))
        expect(readTime('2024-06-15T15:00:00.5Z')).toBe(Date.UTC(2024, 5, 15, 15, 0, 0, 500))
    })

    it("doesn't guess at times without an offset or in other formats", () => {
        expect(readTime('2024-06-15T08:00:00')).toBeNull()
        expect(readTime('2024/05/04 11:12:12-7:00')).toBeNull()
        expect(readTime('')).toBeNull()
        expect(readTime(undefined)).toBeNull()
    })
})

describe('mightBeLive', () => {
    const now = Date.UTC(2024, 5, 15, 18, 0)
    // a time `hours` before now, written in Pacific daylight time
    const hoursAgo = (hours: number) => new Date(now - hours * 3600000 - 7 * 3600000).toISOString().replace('Z', '-07:00')
    const read = (person: string, hours: number, overrides = {}) =>
        makeTimeResult({ person_id: person, finish: false, local_time: hoursAgo(hours), ...overrides })

    it('is live with someone on the course and a read in the last six hours', () => {
        expect(mightBeLive([read('1', 1)], now)).toBe(true)
        expect(mightBeLive([read('1', 5.9)], now)).toBe(true)
    })

    it("isn't live once the latest read is six hours old", () => {
        expect(mightBeLive([read('1', 6)], now)).toBe(false)
        expect(mightBeLive([read('1', 1, { local_time: '' })], now)).toBe(false)
        expect(mightBeLive([], now)).toBe(false)
    })

    it("isn't live once everyone has finished or is marked DNF or DNS", () => {
        expect(mightBeLive([read('1', 1, { finish: true })], now)).toBe(false)
        expect(mightBeLive([read('1', 1, { type: 30 }), read('2', 1, { type: 31 }), read('3', 1, { type: 3 })], now)).toBe(false)
        // a runner with an earlier read and then a finish is done
        expect(mightBeLive([read('1', 2), read('1', 1, { finish: true })], now)).toBe(false)
    })

    it("counts any runner's recent read, but not a DNF or DNS entry", () => {
        // runner 1 finished just now, runner 2 is still out from earlier
        expect(mightBeLive([read('1', 0.1, { finish: true }), read('2', 8)], now)).toBe(true)
        // the only recent entry is runner 1 being marked DNF
        expect(mightBeLive([read('1', 0.1, { finish: true, type: 30 }), read('2', 8)], now)).toBe(false)
    })
})

describe('useLiveUpdates', () => {
    beforeEach(() => {
        installMockEventSource()
    })
    afterEach(() => {
        vi.useRealTimers()
    })

    it("doesn't connect while not enabled", () => {
        renderHook(() => { useLiveUpdates('race', '2024', false, () => {}) })
        expect(MockEventSource.instances).toHaveLength(0)
    })

    it('watches the event year and calls back on result changes', () => {
        const onUpdate = vi.fn()
        renderHook(() => { useLiveUpdates('race', '2024', true, onUpdate) })

        expect(MockEventSource.instances).toHaveLength(1)
        const url = new URL(MockEventSource.instances[0].url)
        expect(url.pathname.endsWith('/results/stream')).toBe(true)
        expect(url.searchParams.get('slug')).toBe('race')
        expect(url.searchParams.get('year')).toBe('2024')
        expect(url.searchParams.get('key')).toBeTruthy()

        MockEventSource.instances[0].emit('ready', '{"year":"2024","live":true}')
        expect(onUpdate).not.toHaveBeenCalled()
        MockEventSource.instances[0].emit('results')
        MockEventSource.instances[0].emit('results')
        expect(onUpdate).toHaveBeenCalledTimes(2)
    })

    it('leaves the year off when there is none', () => {
        renderHook(() => { useLiveUpdates('race', undefined, true, () => {}) })
        expect(new URL(MockEventSource.instances[0].url).searchParams.has('year')).toBe(false)
    })

    it('catches up after the stream reconnects', () => {
        const onUpdate = vi.fn()
        renderHook(() => { useLiveUpdates('race', '2024', true, onUpdate) })
        const source = MockEventSource.instances[0]

        source.emit('ready')
        source.fail(false)
        source.emit('ready')

        expect(onUpdate).toHaveBeenCalledTimes(1)
    })

    it('uses the latest callback without reconnecting', () => {
        const first = vi.fn()
        const second = vi.fn()
        const { rerender } = renderHook(({ cb }) => { useLiveUpdates('race', '2024', true, cb) }, { initialProps: { cb: first } })
        rerender({ cb: second })

        MockEventSource.instances[0].emit('results')
        expect(MockEventSource.instances).toHaveLength(1)
        expect(first).not.toHaveBeenCalled()
        expect(second).toHaveBeenCalledTimes(1)
    })

    it('keeps the stream while pings arrive', () => {
        vi.useFakeTimers()
        const onUpdate = vi.fn()
        renderHook(() => { useLiveUpdates('race', '2024', true, onUpdate) })
        const source = MockEventSource.instances[0]

        source.emit('ready')
        for (let i = 0; i < 10; i++) {
            vi.advanceTimersByTime(30000)
            source.emit('ping')
        }
        expect(MockEventSource.instances).toHaveLength(1)
        expect(source.readyState).not.toBe(MockEventSource.CLOSED)
        expect(onUpdate).not.toHaveBeenCalled()
    })

    it('replaces a stream that goes quiet, then catches up once the new one is ready', () => {
        vi.useFakeTimers()
        const onUpdate = vi.fn()
        renderHook(() => { useLiveUpdates('race', '2024', true, onUpdate) })
        const first = MockEventSource.instances[0]

        first.emit('ready')
        vi.advanceTimersByTime(LIVE_STREAM_TIMEOUT - 1)
        expect(MockEventSource.instances).toHaveLength(1)
        vi.advanceTimersByTime(1)
        expect(first.readyState).toBe(MockEventSource.CLOSED)
        expect(MockEventSource.instances).toHaveLength(2)
        const second = MockEventSource.instances[1]
        expect(second.url).toBe(first.url)
        expect(onUpdate).not.toHaveBeenCalled()

        second.emit('ready')
        expect(onUpdate).toHaveBeenCalledTimes(1)
    })

    it('keeps trying while the server is unreachable', () => {
        vi.useFakeTimers()
        renderHook(() => { useLiveUpdates('race', '2024', true, () => {}) })

        // never hears anything at all
        vi.advanceTimersByTime(LIVE_STREAM_TIMEOUT * 3)
        expect(MockEventSource.instances).toHaveLength(4)
        expect(MockEventSource.open()).toHaveLength(1)
    })

    it('stops replacing the stream once it falls back to checking', () => {
        vi.useFakeTimers()
        const onUpdate = vi.fn()
        renderHook(() => { useLiveUpdates('race', '2024', true, onUpdate) })

        MockEventSource.instances[0].fail(true)
        vi.advanceTimersByTime(LIVE_STREAM_TIMEOUT * 2)
        expect(MockEventSource.instances).toHaveLength(1)
        expect(onUpdate).toHaveBeenCalledTimes(Math.floor(LIVE_STREAM_TIMEOUT * 2 / LIVE_POLL_INTERVAL))
    })

    it('checks every 30 seconds once the stream gives up', () => {
        vi.useFakeTimers()
        const onUpdate = vi.fn()
        renderHook(() => { useLiveUpdates('race', '2024', true, onUpdate) })

        MockEventSource.instances[0].fail(true)
        vi.advanceTimersByTime(LIVE_POLL_INTERVAL - 1)
        expect(onUpdate).not.toHaveBeenCalled()
        vi.advanceTimersByTime(1)
        expect(onUpdate).toHaveBeenCalledTimes(1)
        vi.advanceTimersByTime(LIVE_POLL_INTERVAL)
        expect(onUpdate).toHaveBeenCalledTimes(2)
    })

    it('checks every 30 seconds when the browser has no EventSource', () => {
        vi.useFakeTimers()
        vi.stubGlobal('EventSource', undefined)
        const onUpdate = vi.fn()
        renderHook(() => { useLiveUpdates('race', '2024', true, onUpdate) })

        vi.advanceTimersByTime(LIVE_POLL_INTERVAL)
        expect(onUpdate).toHaveBeenCalledTimes(1)
    })

    it('closes the stream and stops checking when done', () => {
        vi.useFakeTimers()
        const onUpdate = vi.fn()
        const { unmount, rerender } = renderHook(({ on }) => { useLiveUpdates('race', '2024', on, onUpdate) }, { initialProps: { on: true } })
        const source = MockEventSource.instances[0]

        rerender({ on: false })
        expect(source.readyState).toBe(MockEventSource.CLOSED)

        rerender({ on: true })
        MockEventSource.instances[1].fail(true)
        unmount()
        vi.advanceTimersByTime(LIVE_POLL_INTERVAL * 3)
        expect(onUpdate).not.toHaveBeenCalled()
        expect(MockEventSource.open()).toHaveLength(0)
    })
})
