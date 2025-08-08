import Loading from '../Parts/Loading';
import ErrorMsg from '../Parts/ErrorMsg';
import DateString from '../Parts/DateString';
import { useParams } from 'react-router-dom';
import { ResultsLoader } from '../loaders/results';
import { TimeResult } from '../Interfaces/types';
import PNTFResultsTable from '../Parts/PNTFResultsTable';
import { PageProps } from '../Interfaces/props';
import PNTFAwardsTable from '../Parts/PNTFAwardsTable';

function PNTF(props: PageProps) {
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
    var distances = Object.keys(state.results)
    const results: { [index: string]: TimeResult[] } = {}
    distances.map(distance => {
        state.results[distance].map(result => {
            if (result.division.trim() === "pntf" && result.finish === true) {
                if (results[distance] === undefined) {
                    results[distance] = []
                }
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
                var division = "Open"
                if (result.age >= 40 && result.age < 130) {
                    division = "Masters"
                }
                var age_group = ""
                if (result.age / 5 < 4) {
                    age_group = `${gender} Under 20`
                } else if (result.age / 5 < 5) {
                    age_group = `${gender} 20-24`
                } else if (result.age / 5 < 6) {
                    age_group = `${gender} 25-29`
                } else if (result.age / 5 < 7) {
                    age_group = `${gender} 30-34`
                } else if (result.age / 5 < 8) {
                    age_group = `${gender} 35-39`
                } else if (result.age / 5 < 9) {
                    age_group = `${gender} 40-44`
                } else if (result.age / 5 < 10) {
                    age_group = `${gender} 45-49`
                } else if (result.age / 5 < 11) {
                    age_group = `${gender} 50-54`
                } else if (result.age / 5 < 12) {
                    age_group = `${gender} 55-59`
                } else if (result.age / 5 < 13) {
                    age_group = `${gender} 60-64`
                } else if (result.age / 5 < 14) {
                    age_group = `${gender} 65-69`
                } else if (result.age / 5 < 15) {
                    age_group = `${gender} 70-74`
                } else if (result.age / 5 < 16) {
                    age_group = `${gender} 75-79`
                } else if (result.age / 5 < 17) {
                    age_group = `${gender} 80-84`
                } else if (result.age / 5 < 18) {
                    age_group = `${gender} 85-89`
                } else if (result.age / 5 < 19) {
                    age_group = `${gender} 90-94`
                } else if (result.age / 5 < 20) {
                    age_group = `${gender} 95-99`
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
                        division: division,
                        division_ranking: result.division_ranking
                    })
            }
        })
    })
    distances = Object.keys(results)
    distances.map(distance => {
        results[distance].sort((a,b) => {
            if (a.seconds === b.seconds) {
                return a.milliseconds - b.milliseconds;
            }
            return a.seconds - b.seconds;
        })
        var place = 1;
        var genderPlace: { [gend: string]: number } = {}
        var ageGroupPlace: { [age_group: string]: { [gend: string]: number } } = {}
        var divisionPlace: { [age_group: string]: { [gend: string]: number } } = {}
        results[distance].map(result => {
            if (result.finish === true) {
                result.ranking = place;
                place = place + 1;
                if (genderPlace[result.gender] === undefined) {
                    result.gender_ranking = 1;
                    genderPlace[result.gender] = 2;
                } else {
                    result.gender_ranking = genderPlace[result.gender];
                    genderPlace[result.gender] = genderPlace[result.gender] + 1;
                }
                if (ageGroupPlace[result.age_group] === undefined) {
                    result.age_ranking = 1;
                    ageGroupPlace[result.age_group] = {};
                    ageGroupPlace[result.age_group][result.gender] = 2;
                } else if (ageGroupPlace[result.age_group][result.gender] === undefined) {
                    result.age_ranking = 1;
                    ageGroupPlace[result.age_group][result.gender] = 2;
                } else {
                    result.age_ranking = ageGroupPlace[result.age_group][result.gender];
                    ageGroupPlace[result.age_group][result.gender] = ageGroupPlace[result.age_group][result.gender] + 1;
                }
                if (divisionPlace[result.division] === undefined) {
                    result.division_ranking = 1
                    divisionPlace[result.division] = {}
                    divisionPlace[result.division][result.gender] = 2
                } else if (divisionPlace[result.division][result.gender] === undefined) {
                    result.division_ranking = 1
                    divisionPlace[result.division][result.gender] = 2
                } else {
                    result.division_ranking = divisionPlace[result.division][result.gender]
                    divisionPlace[result.division][result.gender] = divisionPlace[result.division][result.gender] + 1
                }
            }
        })
    })
    const pageSubTitle = props.page === 'rankings' ? 'PNTF Championship Rankings' : 'PNTF Championship Awards'
    document.title = `Chronokeep - ${state.event!.name} - ${pageSubTitle}`
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
                            { props.page === 'rankings' &&
                                distances.map((distance, index) => {
                                    return (
                                        <PNTFResultsTable
                                            distance={distance}
                                            results={results[distance]}
                                            key={index}
                                            showTitle={distances.length > 1}
                                            />
                                    )
                                })
                            }
                            { props.page === 'awards' &&
                                distances.map((distance, index) => {
                                    return (
                                        <PNTFAwardsTable
                                            distance={distance}
                                            results={results[distance]}
                                            key={index}
                                            showTitle={distances.length > 1}
                                            />
                                    )
                                })
                            }
                        </div>
                    </div>
                </div>
                <div id='disclaimer' className='container-lg lg-max-width shadow-sm text-center p-3 mb-3 border border-light overflow-hidden-sm'>{"*Rankings are ranked based upon the Clock Time and not the Chip Time."}</div>
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

export default PNTF;