import Loading from '../Parts/Loading';
import ErrorMsg from '../Parts/ErrorMsg';
import { useParams } from 'react-router-dom';
import { TimeResult } from '../Interfaces/types';
import { DoubleResultsLoader } from '../loaders/double_results';
import TwoEventResultsTable from '../Parts/TwoEventResultsTable';

function DoublePage() {
    const params = useParams();
    const { state } = DoubleResultsLoader(params, 'results');
    document.title = `Chronokeep - Results`
    if (state.error === true) {
        document.title = `Chronokeep - Error`
        return (
            <ErrorMsg status={state.status} message={state.message} />
        );
    }
    if (state.loading === true) {
        return (
            <Loading />
        );
    }
    const results = state.results;
    // Map used for keeping track of all participants and their results in the series
    const participants: Map<string, { [index: string]: TimeResult }> = new Map<string, { [index: string]: TimeResult }>()
    // Go through the results for each year
    Object.keys(results).map(distance => {
        // Go through the list and record their result in a SeriesResult
        results[distance].map(result => {
            if (result.finish && result.type !== 3 && result.type < 30) {
                const name = `${result.first.toLocaleLowerCase()} ${result.last.toLocaleLowerCase()} ${result.age}`
                if (!participants.has(name)) {
                    participants.set(name, { })
                }
                participants.get(name)![distance] = result;
            }
        })
    })
    const partRank: Map<string, number> = new Map<string, number>();
    Object.keys(participants).map(name => {
        const results = participants.get(name);
        const dist1 = state.selected_year?.double[0].distance ?? "";
        const dist2 = state.selected_year?.double[1].distance ?? "";
        if (results && results[dist1] && results[dist2]) {
            partRank.set(name, results[dist1].ranking + results[dist2].ranking);
        }
    });
    const sorted: string[] = Object.keys(partRank).sort((a,b) => {
        return partRank.get(a)! - partRank.get(b)!;
    });
    const pageSubTitle = 'Results'
    document.title = `Chronokeep - ${state.selected_year!.display_name} - ${pageSubTitle}`
    return (
        <div>
            <div className="row container-lg lg-max-width mx-auto d-flex mt-4 mb-3 align-items-stretch">
                <div className="col-md-10 flex-fill text-center mx-auto m-1">
                    <p className="text-important mb-0 mt-1 h1">{`${state.selected_year!.display_name}`}</p>
                    <p className="text-important mb-2 mt-0 h2">{pageSubTitle}</p>
                    <p className="text-important h5">{state.selected_year?.display_year === undefined? '' : state.selected_year?.display_year}</p>
                </div>
                { state.years !== null && state.years.length > 1 && 
                    <div className="col-md-2 nav flex-md-column justify-content-center p-0">
                        {
                            state.years.map((year, index) => {
                                let className = "nav-link text-center text-important text-secondary"
                                if (year.display_year === state.selected_year!.display_year) {
                                    className = "nav-link disabled text-center text-important text-dark"
                                }
                                return <a href={`/double/${params.slug}/${year.display_year}`} key={`year${index}`} className={className}>{year.display_year}</a>
                            })
                        }
                    </div>
                }
            </div>
            { sorted.length > 0 &&
            <div id="results-parent">
                <TwoEventResultsTable
                    results={participants}
                    sorted={sorted}
                    distance1={state.selected_year?.double[0].distance ?? ""}
                    distance2={state.selected_year?.double[1].distance ?? ""}
                    />
            </div>
            }
            { sorted.length === 0 &&
            <div className="container-lg lg-max-width shadow-sm p-5 mb-3 border border-light">
                <div className="text-center">
                    <h2>No results to display.</h2>
                </div>
            </div>
            }
        </div>
    )
}

export default DoublePage;