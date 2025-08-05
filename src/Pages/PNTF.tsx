import Loading from '../Parts/Loading';
import ErrorMsg from '../Parts/ErrorMsg';
import DateString from '../Parts/DateString';
import { useParams } from 'react-router-dom';
import { ResultsLoader } from '../loaders/results';
import { TimeResult } from '../Interfaces/types';
import PNTFResultsTable from '../Parts/PNTFResultsTable';

function PNTF() {
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
                var age_group = "Open"
                if (result.age >= 40 && result.age < 130) {
                    age_group = "Masters"
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
        var ageGroupPlace: { [age_group: string]: { [gend: string]: number } } = {};
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
            }
        })
    })
    document.title = `Chronokeep - ${state.event!.name} PNTF Championship`
    return (
        <div>
            <div className="row container-lg lg-max-width mx-auto d-flex mt-4 mb-3 align-items-stretch">
                <div className="col-md-10 flex-fill text-center mx-auto m-1">
                    <p className="text-important mb-0 mt-1 h1">{`${state.event!.name}`}</p>
                    <p className="text-important mb-2 mt-0 h2">PNTF Championship Rankings</p>
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
                            {
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