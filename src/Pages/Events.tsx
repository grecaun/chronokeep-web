import { Link, useSearchParams } from 'react-router-dom';
import Loading from '../Parts/Loading';
import ErrorMsg from '../Parts/ErrorMsg';
import Pagination from '../Parts/Pagination';
import DateString from '../Parts/DateString';
import { Event } from '../Interfaces/types';
import { EventsLoader } from '../loaders/events';

export const EVENTS_PER_PAGE = 15;

type EventTiming = 'today' | 'upcoming' | 'past';

/** Today's date as YYYY-MM-DD in the viewer's time zone. */
function todayString(): string {
    const now = new Date();
    return `${now.getFullYear()}-${`${now.getMonth() + 1}`.padStart(2, '0')}-${`${now.getDate()}`.padStart(2, '0')}`;
}

/** Whether an event is today, upcoming, or past, going by the date part of its most recent time. */
function timingOf(ev: Event, today: string): EventTiming {
    const date = ev.recent_time.substring(0, 10);
    if (date === today) {
        return 'today';
    }
    return date > today ? 'upcoming' : 'past';
}

/** Reads a 1-based page number from the url, defaulting to 1. */
function readPage(value: string | null): number {
    const page = Number(value);
    return Number.isInteger(page) && page > 0 ? page : 1;
}

// Today's and upcoming dates get a soft tint behind them. The label is for screen
// readers and the hover tooltip, since the tint alone only shows by colour.
const timingTints: { [timing in EventTiming]?: { label: string, className: string } } = {
    today: { label: 'Today', className: 'bg-danger-subtle text-danger-emphasis' },
    upcoming: { label: 'Upcoming', className: 'bg-primary-subtle text-primary-emphasis' },
};

function EventList(props: { events: { ev: Event, timing: EventTiming }[] }) {
    return (
        <div className="list-group justify-content-center flex-column">
            { props.events.map(({ ev, timing }) => {
                const tint = timingTints[timing];
                return (
                    <Link className="list-group-item list-group-item-action text-important d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center" to={`/results/${ev.slug}`} key={ev.slug}>
                        <span className="text-start">{ ev.name }</span>{' '}
                        {/* on phones the date drops below the name so the name keeps the full width */}
                        { tint
                            ? <small className={`ms-sm-3 mt-1 mt-sm-0 text-nowrap px-2 rounded ${tint.className}`} title={tint.label}>
                                <span className="visually-hidden">{ `${tint.label},` }</span>{' '}
                                { DateString(ev.recent_time) }
                            </small>
                            : <small className="ms-sm-3 mt-1 mt-sm-0 text-nowrap text-secondary">{ DateString(ev.recent_time) }</small>
                        }
                    </Link>
                )
            }) }
        </div>
    );
}

function Events() {
    const state = EventsLoader();
    const [searchParams, setSearchParams] = useSearchParams();
    document.title = `Chronokeep - Events`
    if (state.error === true) {
        document.title = `Chronokeep - Error`
        return (
            <ErrorMsg status={state.status} message={state.message} />
        )
    }
    if (state.loading === true) {
        return (
            <Loading />
        );
    }
    if (!state.events || state.events.length < 1) {
        return (
            <div className="container-lg lg-max-width shadow">
                <h2 className="text-important text-primary">No events found.</h2>
            </div>
        )
    }

    const search = searchParams.get('search') ?? '';
    const term = search.trim().toLocaleLowerCase();
    const matching = term === '' ? state.events : state.events.filter(ev => ev.name.toLocaleLowerCase().includes(term));

    // Today's events first, then upcoming events soonest first, then past events most recent first.
    const today = todayString();
    const order: EventTiming[] = ['today', 'upcoming', 'past'];
    const listed = matching
        .map(ev => ({ ev, timing: timingOf(ev, today) }))
        .sort((a, b) => {
            if (a.timing !== b.timing) {
                return order.indexOf(a.timing) - order.indexOf(b.timing);
            }
            const diff = Date.parse(a.ev.recent_time) - Date.parse(b.ev.recent_time);
            return a.timing === 'past' ? -diff : diff;
        });

    const pageCount = Math.max(1, Math.ceil(listed.length / EVENTS_PER_PAGE));
    const page = Math.min(readPage(searchParams.get('page')), pageCount);

    // Sets one url parameter, dropping it when it's back to its default.
    const setParam = (name: string, value: string, defaultValue: string, replace = false) => {
        setSearchParams(params => {
            if (value === defaultValue) {
                params.delete(name);
            } else {
                params.set(name, value);
            }
            // a new search starts back on the first page
            if (name === 'search') {
                params.delete('page');
            }
            return params;
        }, { replace });
    };

    // Turns the page, then brings the list back into view so the new page reads from the top.
    const turnPage = (newPage: number) => {
        setParam('page', `${newPage}`, '1');
        document.getElementById('event-list')?.scrollIntoView?.({ block: 'start' });
    };

    return (
        <div className="mx-auto sm-max-width text-center container-md border border-light p-5 pt-4">
            <h1 className="text-important display-4">Events</h1>
            <input
                type="search"
                className="form-control mt-3"
                placeholder="Search events"
                aria-label="Search events"
                value={search}
                onChange={e => { setParam('search', e.target.value, '', true) }}
                />
            { listed.length > 0 &&
                <section id="event-list" className="mt-4" aria-label="Events">
                    <EventList events={listed.slice((page - 1) * EVENTS_PER_PAGE, page * EVENTS_PER_PAGE)} />
                    <Pagination label="Event pages" page={page} pageCount={pageCount} onPage={turnPage} />
                </section>
            }
            { listed.length === 0 &&
                <p className="text-important h5 mt-4">No events match your search.</p>
            }
        </div>
    );
}

export default Events;
