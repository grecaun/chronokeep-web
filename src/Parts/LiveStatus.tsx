import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { LiveContext } from './liveContext';

/** How long after the refresh notice a second refresh goes through. */
export const REFRESH_CONFIRM_WINDOW = 5000;

function isRefreshKey(e: KeyboardEvent) {
    return e.key === 'F5' || ((e.ctrlKey || e.metaKey) && (e.key === 'r' || e.key === 'R'));
}

/**
 * Wraps pages that may watch for live results. While any of them is watching, it shows a
 * Live badge and asks people not to refresh: refresh keys show a notice first (pressing
 * again refreshes anyway), the browser's own refresh or close asks to confirm, and phones'
 * pull-to-refresh is turned off.
 */
export function LiveProvider(props: { children: ReactNode }) {
    const [watchers, setWatchers] = useState(0);
    const [notice, setNotice] = useState(false);
    const live = watchers > 0;
    // set once someone has been told and refreshes anyway
    const allowRefresh = useRef(false);
    const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const watch = useCallback(() => {
        setWatchers(count => count + 1);
        return () => { setWatchers(count => count - 1); };
    }, []);

    useEffect(() => {
        if (!live) {
            return;
        }
        allowRefresh.current = false;
        const onKeyDown = (e: KeyboardEvent) => {
            if (!isRefreshKey(e)) {
                return;
            }
            if (noticeTimer.current !== null) {
                // asked once already, so let this refresh through without the browser asking again
                allowRefresh.current = true;
                return;
            }
            e.preventDefault();
            setNotice(true);
            noticeTimer.current = setTimeout(() => {
                noticeTimer.current = null;
                // if the second press didn't end up reloading, guard again from here on
                allowRefresh.current = false;
                setNotice(false);
            }, REFRESH_CONFIRM_WINDOW);
        };
        const onBeforeUnload = (e: BeforeUnloadEvent) => {
            if (allowRefresh.current) {
                return;
            }
            // browsers show their own "Leave site?" message for this
            e.preventDefault();
            e.returnValue = '';
        };
        const root = document.documentElement;
        const overscroll = root.style.overscrollBehaviorY;
        root.style.overscrollBehaviorY = 'contain';
        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('beforeunload', onBeforeUnload);
        return () => {
            window.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('beforeunload', onBeforeUnload);
            root.style.overscrollBehaviorY = overscroll;
            if (noticeTimer.current !== null) {
                clearTimeout(noticeTimer.current);
                noticeTimer.current = null;
            }
            setNotice(false);
        };
    }, [live]);

    return (
        <LiveContext.Provider value={{ watch }}>
            {props.children}
            { live &&
                <div className="live-status" aria-live="polite">
                    { notice &&
                        <div className="live-notice shadow-sm" role="status">
                            Results update automatically, so there's no need to refresh. Press refresh again to reload anyway.
                        </div>
                    }
                    <div className="live-badge shadow-sm" title="This page updates as new results come in">
                        <span className="live-dot" aria-hidden="true" />
                        <span className="live-label">Live</span>
                        <span className="live-detail">Results update automatically</span>
                    </div>
                </div>
            }
        </LiveContext.Provider>
    );
}
