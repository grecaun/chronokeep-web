import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { isToday, LIVE_POLL_INTERVAL, useLiveUpdates } from './live'
import { installMockEventSource, MockEventSource } from '../test/eventSource'

describe('isToday', () => {
    afterEach(() => {
        vi.useRealTimers()
    })

    it("compares the date part with the viewer's today", () => {
        vi.useFakeTimers({ toFake: ['Date'] })
        vi.setSystemTime(new Date(2024, 5, 15, 23, 30))
        expect(isToday('2024-06-15T08:00:00-07:00')).toBe(true)
        expect(isToday('2024-06-14T08:00:00-07:00')).toBe(false)
        expect(isToday('')).toBe(false)
        expect(isToday(undefined)).toBe(false)
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
