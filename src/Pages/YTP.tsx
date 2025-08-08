import Loading from '../Parts/Loading';
import ErrorMsg from '../Parts/ErrorMsg';
import DateString from '../Parts/DateString';
import { useParams } from 'react-router-dom';
import { YTPTimeResult } from '../Interfaces/types';
import YTPScoreTable from '../Parts/YTPScoreTable';
import { ResultsLoader } from '../loaders/results';
import { PageProps } from '../Interfaces/props';
import YTPAwardsTable from '../Parts/YTPAwardsTable';

function YTP(props: PageProps) {
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
    var distances = Object.keys(state.results)
    const results: { [index: string]: YTPTimeResult[] } = {}
    distances.map(distance => {
        state.results[distance].map(result => {
            if (result.division.trim() === "ytp" && result.finish === true) {
                if (results[distance] === undefined) {
                    results[distance] = []
                }
                var age_group = ""
                var gender: string
                result.gender = result.gender.toLocaleUpperCase();
                result.gender = result.gender.substring(0,2)
                if (result.gender === "F" || result.gender === "WO" || result.gender === "W") {
                    result.gender = "F"
                    gender = "Female"
                } else if (result.gender === "M" || result.gender === "MA") {
                    result.gender = "M"
                    gender = "Male"
                } else {
                    result.gender = "X"
                    gender = "Non-Binary"
                }
                if (result.age < 9) {
                    age_group = `${gender} 8/under`
                } else if (result.age < 11) {
                    age_group = `${gender} 9-10`
                } else if (result.age < 13) {
                    age_group = `${gender} 11-12`
                } else if (result.age < 15) {
                    age_group = `${gender} 13-14`
                } else if (result.age < 17) {
                    age_group = `${gender} 15-16`
                } else if (result.age < 19) {
                    age_group = `${gender} 17-18`
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
                        age_group: age_group,
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
                        division_ranking: result.division_ranking,
                        cougar_score: 0,
                        combined_score: 0,
                        highest_score: 0,
                        tiger_score: 0,
                        seward_score: 0
                    })
            }
        })
    })
    distances = Object.keys(results)
    document.title = `Chronokeep - ${state.event!.name}`
    const pageSubTitle = props.page === 'series' ? 'YTP Series' : 'PNTF Youth Trail Championship / YTP Race Awards'
    return (
        <div>
            <div className="row container-lg lg-max-width mx-auto d-flex mt-4 mb-3 align-items-stretch">
                <div className="col-md-10 flex-fill text-center mx-auto m-1">
                    <p className="text-important mb-0 mt-1 h1">{`${state.event!.name}`}</p>
                    <p className="text-important mb-2 mt-0 h2">{pageSubTitle}</p>
                    <p className="text-important h5">{DateString(state.year!.date_time)}</p>
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
                            {   props.page === "series" &&
                                distances.map((distance, index) => {
                                    return (
                                        <YTPScoreTable
                                            distance={distance}
                                            results={results[distance]}
                                            key={index}
                                            showTitle={distances.length > 1}
                                            info={info}
                                            />
                                    )
                                })
                            }
                            { props.page === "championship" &&
                                distances.map((distance, index) => {
                                    return (
                                        <YTPAwardsTable
                                            distance={distance}
                                            results={results[distance]}
                                            key={index}
                                            showTitle={distances.length > 1}
                                            info={info}
                                            />
                                    )
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