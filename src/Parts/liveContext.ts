import { createContext } from 'react';
import { RecentChange } from './recentChanges';

/**
 * Lets live loaders tell the page they're watching for result changes. watch() returns
 * a function to call when they stop. setRecent() gives the latest reads to list under the
 * live badge, or null when there are none to list. Provided by LiveProvider in Parts/LiveStatus.
 */
export const LiveContext = createContext<{
    watch: () => () => void
    setRecent: (changes: RecentChange[] | null) => void
} | null>(null);
