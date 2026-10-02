import Loading from '../Parts/Loading';
import ErrorMsg from '../Parts/ErrorMsg';
import { useParams } from 'react-router-dom';
import { NorthBendDoubleResult } from '../Interfaces/types';
import NorthBendDoubleResultsTable from '../Parts/NorthBendDoubleResultsTable';
import { DoubleResultsLoader } from '../loaders/double_results';

function NorthBendDoublePage() {
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
    const participants: Map<string, NorthBendDoubleResult> = new Map<string, NorthBendDoubleResult>()
    // Go through the results for each year
    Object.keys(results).map(distance => {
        // Go through the list and record their result in a SeriesResult
        results[distance].map(result => {
            if (result.finish && result.type !== 3 && result.type < 30) {
                if (!participants.has(result.bib)) {
                    participants.set(result.bib, {
                        first: result.first,
                        last: result.last,
                        gender: result.gender,
                        age: result.age,
                        age_group: result.age_group,
                        seconds: 0,
                        milliseconds: 0,
                        results: [],
                        ranking: 0,
                        gender_ranking: 0,
                        age_ranking: 0
                    })
                }
                const part = participants.get(result.bib)!
                part.seconds += result.seconds;
                part.milliseconds += result.milliseconds;
                if (part.milliseconds >= 1000) {
                    part.seconds += 1
                    part.milliseconds -= 1000
                }
                part.results.push(result)
                participants.set(result.bib, part)
            }
        })
    })
    const doubleResults: NorthBendDoubleResult[] = []
    participants.forEach(part => {
        if (part.results.length == 2) {
            doubleResults.push(part)
        }
    })
    // go through all of the results and rank the results
    doubleResults.sort((a,b) => {
        if (a.seconds === b.seconds) {
            return a.milliseconds - b.milliseconds
        }
        return a.seconds - b.seconds
    })
    let rank = 1;
    const ageRank: Map<string, number> = new Map<string, number>()
    const genderRank: Map<string, number> = new Map<string, number>()
    doubleResults.forEach(part => {
        part.ranking = rank;
        rank += 1;
        if (!ageRank.has(`${part.gender} ${part.age_group}`)) {
            ageRank.set(`${part.gender} ${part.age_group}`, 1)
        }
        part.age_ranking = ageRank.get(`${part.gender} ${part.age_group}`)!
        ageRank.set(`${part.gender} ${part.age_group}`, part.age_ranking + 1)
        if (!genderRank.has(part.gender)) {
            genderRank.set(part.gender, 1)
        }
        part.gender_ranking = genderRank.get(part.gender)!
        genderRank.set(part.gender, part.gender_ranking + 1)
    })
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
                                return <a href={`/series/${params.slug}/${year.display_year}`} key={`year${index}`} className={className}>{year.display_year}</a>
                            })
                        }
                    </div>
                }
            </div>
            { doubleResults.length > 0 &&
            <div id="results-parent">
                <NorthBendDoubleResultsTable
                    results={doubleResults}
                    search={""}
                    />
            </div>
            }
            { doubleResults.length === 0 &&
            <div className="container-lg lg-max-width shadow-sm p-5 mb-3 border border-light">
                <div className="text-center">
                    <h2>No results to display.</h2>
                </div>
            </div>
            }
        </div>
    )
}

export default NorthBendDoublePage;