import { vi } from 'vitest'

/**
 * A stand-in for the browser's EventSource that tests drive by hand. Install it with
 * installMockEventSource(), then use MockEventSource.instances to find the streams a
 * page opened and emit() events on them.
 */
export class MockEventSource {
    static readonly CONNECTING = 0
    static readonly OPEN = 1
    static readonly CLOSED = 2
    static instances: MockEventSource[] = []

    url: string
    readyState = MockEventSource.CONNECTING
    onerror: ((event: Event) => void) | null = null
    private listeners: Record<string, ((event: MessageEvent) => void)[]> = {}

    constructor(url: string) {
        this.url = url
        MockEventSource.instances.push(this)
    }

    addEventListener(type: string, listener: (event: MessageEvent) => void) {
        (this.listeners[type] ??= []).push(listener)
    }

    close() {
        this.readyState = MockEventSource.CLOSED
    }

    /** Sends a named event, as the server would. */
    emit(type: string, data = '{}') {
        this.readyState = MockEventSource.OPEN
        for (const listener of this.listeners[type] ?? []) {
            listener(new MessageEvent(type, { data }))
        }
    }

    /** Fails the stream. With closed set, the browser has given up on it. */
    fail(closed: boolean) {
        this.readyState = closed ? MockEventSource.CLOSED : MockEventSource.CONNECTING
        this.onerror?.(new Event('error'))
    }

    /** The streams still open. */
    static open() {
        return MockEventSource.instances.filter(source => source.readyState !== MockEventSource.CLOSED)
    }
}

export function installMockEventSource() {
    MockEventSource.instances = []
    vi.stubGlobal('EventSource', MockEventSource)
}
