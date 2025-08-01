import Loading from '../Parts/Loading';
import ErrorMsg from '../Parts/ErrorMsg';
import DateString from '../Parts/DateString';
import { useParams } from 'react-router-dom';
import { ResultsLoader } from '../loaders/results';
import { TimeResult } from '../Interfaces/types';

function YTP() {
    const params = useParams();
    const { state } = ResultsLoader(params, 'results');
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
    const info = {
        slug: params.slug,
        year: state.year?.year
    }
    const distances = Object.keys(state.results)
    const results: { [index: string]: TimeResult[] } = {}
    distances.map(distance => {
        state.results[distance].map(result => {
            if (result.division.trim() === "ytp") {
                if (results[distance] === undefined) {
                    results[distance] = []
                }
                results[distance].push({
                        bib: result.bib,
                        first: result.first,
                        last: result.last,
                        seconds: result.seconds,
                        milliseconds: result.milliseconds,
                        chip_seconds: result.chip_seconds,
                        chip_milliseconds: result.chip_milliseconds,
                        gender: result.gender,
                        occurence: result.occurence,
                        age_group: result.age_group,
                        age: result.age,
                        ranking: result.ranking,
                        age_ranking: result.age_ranking,
                        gender_ranking: result.gender_ranking,
                        finish: result.finish,
                        segment: result.segment,
                        type: result.type,
                        anonymous: result.anonymous,
                        distance: result.distance,
                        location: result.location,
                        local_time: result.local_time,
                        division: result.division,
                        division_ranking: result.division_ranking
                    })
            }
        })
    })
    document.title = `Chronokeep - ${state.event!.name}`
    return (
        <div>
            <div className="row container-lg lg-max-width mx-auto d-flex mt-4 mb-3 align-items-stretch">
                <div className="col-md-10 flex-fill text-center mx-auto m-1">
                    <p className="text-important mb-2 mt-1 h1">{`${state.event!.name}`}</p>
                    <p className="text-important h4">{DateString(state.year!.date_time)}</p>
                </div>
            </div>
            { distances.length > 0 &&
            <div>
                <div className="row container-lg lg-max-width mx-auto d-flex align-items-stretch shadow-sm p-0 mb-3 border border-light">
                    <div className="p-0">
                        <ul className="nav nav-tabs nav-fill">
                            { distances.length > 1 &&
                                distances.map((distance, index) => {
                                    return (
                                        <li className="nav-item" key={`distance${index}`}>
                                            <a className="nav-link text-important h5 text-secondary" href={`#${distance}`} role="button">{distance}</a>
                                        </li>
                                    );
                                })
                            }
                        </ul>
                        <div id="results-parent">
                            {
                                distances.map((distance, index) => {
                                    return `${distance} ${index}`;
                                })
                            }
                        </div>
                    </div>
                </div>
            </div>
            }
            { distances.length === 0 &&
            <div className="container-lg lg-max-width shadow-sm p-5 mb-3 border border-light">
                <div className="text-center">
                    <h2>No results to display.</h2>
                </div>
            </div>
            }
            
        </div>
    )
}

export default YTP;