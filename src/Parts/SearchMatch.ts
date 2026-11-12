/**
 * Whether a result matches the results page search box. `search` is expected to
 * already be trimmed and lower case. An empty search matches everyone; otherwise
 * a result matches if the search is part of its name or exactly its bib (when it has one).
 */
export function matchesSearch(res: { first: string, last: string, bib?: string }, search: string): boolean {
    if (search === "") {
        return true;
    }
    const name = `${res.first.toLocaleLowerCase()} ${res.last.toLocaleLowerCase()}`;
    return name.indexOf(search) >= 0 || (res.bib !== undefined && res.bib === search);
}
