import { ReactNode, useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LiveContext } from './liveContext';
import { RecentChange, timeAgo } from './recentChanges';

/** How often the "2m ago" times in the recent changes list are brought up to date. */
const AGO_REFRESH = 15000;

/**
 * Wraps pages that may watch for live results. While any of them is watching, it shows a
 * Live badge so people know the page updates by itself. When the page gives it recent
 * changes, the badge opens a list of them.
 */
export function LiveProvider(props: { children: ReactNode }) {
    const [watchers, setWatchers] = useState(0);
    const [recent, setRecentState] = useState<RecentChange[] | null>(null);
    const [open, setOpen] = useState(false);
    const [now, setNow] = useState(() => Date.now());
    const live = watchers > 0;
    const changes = live && recent !== null && recent.length > 0 ? recent : null;
    const showing = open && changes !== null;

    const watch = useCallback(() => {
        setWatchers(count => count + 1);
        return () => { setWatchers(count => count - 1); };
    }, []);
    const setRecent = useCallback((list: RecentChange[] | null) => { setRecentState(list); }, []);

    // keep "2m ago" current while the list is open
    useEffect(() => {
        if (!showing) {
            return;
        }
        setNow(Date.now());
        const tick = setInterval(() => { setNow(Date.now()); }, AGO_REFRESH);
        return () => { clearInterval(tick); };
    }, [showing, recent]);

    // Escape closes the list
    useEffect(() => {
        if (!showing) {
            return;
        }
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setOpen(false);
            }
        };
        window.addEventListener('keydown', onKey);
        return () => { window.removeEventListener('keydown', onKey); };
    }, [showing]);

    const badge = (
        <>
            <span className="live-dot" aria-hidden="true" />
            <span className="live-label">Live</span>
            <span className="live-detail">Results update automatically</span>
        </>
    );

    return (
        <LiveContext.Provider value={{ watch, setRecent }}>
            {props.children}
            { live &&
                <div className="live-status">
                    { showing &&
                        <div className="live-recent shadow" id="live-recent">
                            <div className="live-recent-title">Latest results</div>
                            <ol className="live-recent-list" aria-live="polite" aria-label="Latest results">
                                { changes.map(change =>
                                    <li key={change.key} className="live-recent-item">
                                        <div className="live-recent-main">
                                            <Link to={change.link} className="live-recent-name" onClick={() => { setOpen(false); }}>{change.name}</Link>
                                            <span className="live-recent-time">{change.time}</span>
                                        </div>
                                        <div className="live-recent-sub">
                                            <span>{change.detail}</span>
                                            <span className="live-recent-ago">{timeAgo(change.at, now)}</span>
                                        </div>
                                    </li>
                                )}
                            </ol>
                        </div>
                    }
                    { changes !== null
                        ? <button
                            type="button"
                            className="live-badge live-badge-button shadow-sm"
                            title={showing ? 'Hide the latest results' : 'Show the latest results'}
                            aria-expanded={showing}
                            aria-controls="live-recent"
                            onClick={() => { setOpen(value => !value); }}
                            >
                            {badge}
                            <span className={`live-caret${showing ? ' live-caret-open' : ''}`} aria-hidden="true" />
                          </button>
                        : <div className="live-badge shadow-sm" title="This page updates as new results come in">
                            {badge}
                          </div>
                    }
                </div>
            }
        </LiveContext.Provider>
    );
}
