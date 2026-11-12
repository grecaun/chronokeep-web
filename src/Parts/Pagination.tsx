function Chevron(props: { direction: 'left' | 'right' }) {
    const path = props.direction === 'left'
        ? 'M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z'
        : 'M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z';
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true" style={{ verticalAlign: '-0.125em' }}>
            <path fillRule="evenodd" d={path} />
        </svg>
    );
}

/**
 * Page numbers for a paged list, using Bootstrap's pagination styles. Shows
 * nothing when everything fits on one page. With many pages, only the first,
 * last, and pages next to the current one are numbered, with gaps between.
 */
function Pagination(props: { page: number, pageCount: number, onPage: (page: number) => void, label: string }) {
    const { page, pageCount, onPage, label } = props;
    if (pageCount <= 1) {
        return null;
    }
    const numbered = (p: number) => p === 1 || p === pageCount || Math.abs(p - page) <= 1;
    const shown: (number | null)[] = [];
    for (let p = 1; p <= pageCount; p++) {
        // a gap that would hide just one page shows that page instead
        if (numbered(p) || (numbered(p - 1) && numbered(p + 1))) {
            shown.push(p);
        } else if (shown[shown.length - 1] !== null) {
            shown.push(null);
        }
    }
    return (
        <nav aria-label={label}>
            <ul className="pagination justify-content-center mt-3 mb-0">
                <li className={`page-item${page <= 1 ? ' disabled' : ''}`}>
                    <button type="button" className="page-link" aria-label="Previous page" disabled={page <= 1} onClick={() => { onPage(page - 1) }}><Chevron direction="left" /></button>
                </li>
                { shown.map((p, index) => p === null
                    ? <li className="page-item disabled" key={`gap${index}`}><span className="page-link">…</span></li>
                    : <li className={`page-item${p === page ? ' active' : ''}`} key={p}>
                        <button type="button" className="page-link" aria-current={p === page ? 'page' : undefined} onClick={() => { onPage(p) }}>{p}</button>
                    </li>
                )}
                <li className={`page-item${page >= pageCount ? ' disabled' : ''}`}>
                    <button type="button" className="page-link" aria-label="Next page" disabled={page >= pageCount} onClick={() => { onPage(page + 1) }}><Chevron direction="right" /></button>
                </li>
            </ul>
        </nav>
    );
}

export default Pagination;
