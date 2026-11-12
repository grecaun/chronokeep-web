import { createContext } from 'react';

/**
 * Lets live loaders tell the page they're watching for result changes. watch() returns
 * a function to call when they stop. Provided by LiveProvider in Parts/LiveStatus.
 */
export const LiveContext = createContext<{ watch: () => () => void } | null>(null);
