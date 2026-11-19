import { ReactNode, useCallback, useState } from 'react';
import { LiveContext } from './liveContext';

/**
 * Wraps pages that may watch for live results. While any of them is watching, it shows a
 * Live badge so people know the page updates by itself.
 */
export function LiveProvider(props: { children: ReactNode }) {
    const [watchers, setWatchers] = useState(0);
    const live = watchers > 0;

    const watch = useCallback(() => {
        setWatchers(count => count + 1);
        return () => { setWatchers(count => count - 1); };
    }, []);

    return (
        <LiveContext.Provider value={{ watch }}>
            {props.children}
            { live &&
                <div className="live-status" aria-live="polite">
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
