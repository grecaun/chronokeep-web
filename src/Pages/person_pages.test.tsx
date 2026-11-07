import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { makeTimeResult } from '../test/helpers'
import { makeEvent, makeYear, renderAt, routeFetch } from '../test/pages'
import Person from './Person'
import Certificate, { CertificateGenerator, CertificateNoAPI } from './Certificate'
import { Segment, TimeResult } from '../Interfaces/types'

const snapdom = vi.hoisted(() => vi.fn())
vi.mock('@zumer/snapdom', () => ({ snapdom }))

function segment(name: string, distance: number): Segment {
    return { location: name, distance_name: '5K', name, distance_value: distance, distance_unit: 'mi', gps: '', map_link: '' }
}

const segments = [segment('Mile 1', 1), segment('Mile 2', 2), segment('Finish', 3.1)]

function personResponse(results: TimeResult[], overrides: Record<string, unknown> = {}) {
    return {
        event: makeEvent(),
        year: makeYear(),
        results,
        person: { bib: '100', first: 'Jane', last: 'Doe', gender: 'F', anonymous: false, distance: '5K', age: 33 },
        single_distance: true,
        segments,
        distance: { name: '5K', certification: 'WA-123' },
        ...overrides,
    }
}

function renderPerson(response: unknown, url = '/results/test-race/2020/100') {
    routeFetch({ '/results/bib': response })
    renderAt(url, '/:page/:slug/:year/:bib', <Person />)
}

// The big name heading at the top of the person box.
function nameHeading() {
    return document.querySelectorAll('.display-4')[1].textContent
}

// The text of the box under a heading, e.g. the value under "Overall".
function valueUnder(heading: string) {
    return screen.getByText(heading).nextElementSibling?.textContent
}

describe('Person page', () => {
    const start = makeTimeResult({ segment: 'Start', finish: false, occurence: 0, seconds: 30, chip_seconds: 0 })
    const finish = makeTimeResult({
        segment: 'Finish', occurence: 1, seconds: 1580, milliseconds: 0, chip_seconds: 1550, chip_milliseconds: 0,
        ranking: 4, gender_ranking: 2, age_ranking: 1, gender: 'F', age_group: '30-39',
    })

    it('shows a finisher with time, pace and places', async () => {
        renderPerson(personResponse([start, finish]))

        expect(await screen.findByText('Female - 33')).toBeInTheDocument()
        expect(nameHeading()).toBe('Jane Doe')
        expect(screen.getByText('100')).toBeInTheDocument()
        expect(valueUnder('Time')).toBe('25:50.0')
        // 1550s over 3.1 miles is 500s per mile
        expect(screen.getByText('8:20 / mi')).toBeInTheDocument()
        expect(screen.getByText('5:10 / km')).toBeInTheDocument()
        expect(valueUnder('Overall')).toBe('4')
        expect(valueUnder('Female')).toBe('2')
        expect(valueUnder('Female 30-39')).toBe('1')
        expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute('href', '/results/test-race/2020')
        expect(document.title).toBe('Chronokeep - 2020 Test Race Results - Jane Doe')
        // distance events get a certificate button
        expect(screen.getByRole('button', { name: 'Generate Finisher Certificate' })).toBeInTheDocument()
    })

    it('shows the clock time when it differs from the chip time', async () => {
        renderPerson(personResponse([start, finish]))
        await screen.findByText('Female - 33')
        expect(valueUnder('Clock Time')).toBe('26:20.0')
    })

    it('hides the name of anonymous runners', async () => {
        renderPerson(personResponse([finish], {
            person: { bib: '100', first: 'Jane', last: 'Doe', gender: 'F', anonymous: true, distance: '5K', age: 33 },
        }))
        await screen.findByText('Female - 33')
        expect(nameHeading()).toBe('Bib 100')
    })

    it('hides gender places for unspecified genders', async () => {
        renderPerson(personResponse([finish], {
            person: { bib: '100', first: 'Jane', last: 'Doe', gender: 'NS', anonymous: false, distance: '5K', age: 33 },
        }))

        expect(await screen.findByText('33')).toBeInTheDocument()
        expect(valueUnder('Overall')).toBe('4')
        expect(screen.queryByText(/30-39/)).not.toBeInTheDocument()
    })

    it('shows the distance for multi-distance events', async () => {
        renderPerson(personResponse([finish], { single_distance: false }))
        expect(await screen.findByText('5K')).toBeInTheDocument()
    })

    it('estimates arrival times for runners still on course', async () => {
        const mile1 = makeTimeResult({
            segment: 'Mile 1', finish: false, occurence: 1, seconds: 510, chip_seconds: 480,
            local_time: '2024-06-01T08:08:30',
        })
        renderPerson(personResponse([start, mile1]))

        const lastSeen = await screen.findByText('Jane was last seen at')
        expect(lastSeen.nextElementSibling).toHaveTextContent('Mile 1')
        expect(screen.getAllByText('8:00 / mi')).toHaveLength(2)
        // 480s per mile for one more mile, then 2.1 more to the finish
        expect(valueUnder('Estimated Chip Time at Mile 2')).toBe('16:00')
        expect(valueUnder('Estimated Chip Time at Finish')).toBe('24:48')
        expect(screen.queryByRole('button', { name: 'Generate Finisher Certificate' })).not.toBeInTheDocument()
    })

    it('shows lap times for timed events', async () => {
        const lap = (n: number, chip: number) => makeTimeResult({ segment: 'Lap', occurence: n, finish: true, chip_seconds: chip, seconds: chip })
        renderPerson(personResponse([lap(1, 600), lap(2, 1300)], { event: makeEvent({ type: 'time' }) }))

        expect(await screen.findByText('Lap Times')).toBeInTheDocument()
        expect(screen.getByText('Completed')).toBeInTheDocument()
        expect(screen.queryByRole('button', { name: 'Generate Finisher Certificate' })).not.toBeInTheDocument()
    })

    it('shows the error page when the person is missing', async () => {
        routeFetch({})
        renderAt('/results/test-race/2020/1', '/:page/:slug/:year/:bib', <Person />)
        expect(await screen.findByText('You appear to be off course.')).toBeInTheDocument()
    })
})

describe('Certificate page', () => {
    const finish = makeTimeResult({ segment: 'Finish', finish: true, chip_seconds: 3725, chip_milliseconds: 600 })

    function renderCertificate(response: unknown) {
        routeFetch({ '/results/bib': response })
        renderAt('/certificate/test-race/2020/100', '/certificate/:slug/:year/:bib', <Certificate />)
    }

    it('fills in the certificate from the API', async () => {
        renderCertificate(personResponse([finish]))

        expect(await screen.findByText('Jane Doe')).toBeInTheDocument()
        expect(screen.getByText('finished the 2020 Test Race with a time of')).toBeInTheDocument()
        expect(screen.getByText('1:02:05')).toBeInTheDocument()
        expect(screen.getByText('on this day of June 1, 2020')).toBeInTheDocument()
        expect(screen.getByText('Course Certification: WA-123')).toBeInTheDocument()
        expect(document.title).toBe('Finisher Certificate')
    })

    it('adds the distance for multi-distance events', async () => {
        renderCertificate(personResponse([finish], { single_distance: false }))
        expect(await screen.findByText('finished the 2020 Test Race 5K with a time of')).toBeInTheDocument()
    })

    it('uses the certificate name when set', async () => {
        renderCertificate(personResponse([finish], { event: makeEvent({ cert_name: 'Test Race Trail Run' }) }))
        expect(await screen.findByText('finished the 2020 Test Race Trail Run 5K with a time of')).toBeInTheDocument()
    })

    it('renders from url parameters without the API', () => {
        const fetch = routeFetch({})
        render(
            <MemoryRouter initialEntries={['/certificate/Jane Doe/Some Race/1:02:03/May 5, 2024']}>
                <Routes>
                    <Route path="/certificate/:name/:event/:time/:date" element={<CertificateNoAPI />} />
                </Routes>
            </MemoryRouter>
        )

        expect(screen.getByText('Jane Doe')).toBeInTheDocument()
        expect(screen.getByText('finished the Some Race with a time of')).toBeInTheDocument()
        expect(screen.getByText('1:02:03')).toBeInTheDocument()
        expect(screen.queryByText(/Course Certification/)).not.toBeInTheDocument()
        expect(fetch).not.toHaveBeenCalled()
    })

    it('downloads the hidden certificate as an image', async () => {
        const download = vi.fn().mockResolvedValue(undefined)
        snapdom.mockResolvedValue({ download })
        render(CertificateGenerator('Jane Doe', 'Race', '20:00', 'May 5, 2024', '', false))

        const cert = document.getElementById('certificate')!
        expect(cert).toHaveClass('chronokeep-invisible')

        await userEvent.click(screen.getByRole('button', { name: 'Generate Finisher Certificate' }))

        expect(snapdom).toHaveBeenCalledWith(cert)
        await vi.waitFor(() => expect(download).toHaveBeenCalledWith({ filename: 'finisher-certificate.png' }))
        await vi.waitFor(() => expect(cert.style.display).toBe('none'))
    })
})
