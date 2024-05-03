import { Link, useParams } from 'react-router-dom';
import DateString from '../Parts/DateString';
import ErrorMsg from '../Parts/ErrorMsg';
import FormatTime from '../Parts/FormatTime';
import Loading from '../Parts/Loading';
import PersonTime from '../Parts/PersonTime';
import PersonDistance from '../Parts/PersonDistance';
import { TimeResult } from '../Interfaces/types';
import { PersonLoader } from '../loaders/person';
import { CertificateGenerator } from './Certificate';

function Person() {
    const params = useParams();
    const state = PersonLoader(params);
    document.title = `Chronokeep - Individual Results`
    if (state.error === true) {
        document.title = "Chronokeep - Error"
        return (
            <ErrorMsg status={state.status} message={state.message} />
        );
    }
    if (state.loading === true) {
        return (
            <Loading />
        );
    }
    const results: TimeResult[] = []
    let start: TimeResult | null = null
    let finish: TimeResult | null = null
    for (const res of state.results) {
        if (res.segment === "Start") {
            start = res
        } else if (res.finish && state.event.type !== "time") {
            finish = res
        } else {
            if (state.event.type === "time" && res.finish && ((finish !== null && finish.occurence < res.occurence) || finish === null)) {
                finish = res
            }
            results.push(res)
        }
    }
    results.sort((a, b) => {
        return a.seconds - b.seconds;
    })
    const gend = state.person.gender.toUpperCase()
    if (gend === "U" || gend === "O" || gend === "NS" || gend === "NOT SPECIFIED") {
        if (finish !== null) {
            finish.gender_ranking = 0;
            finish.age_ranking = 0;
        }
        state.person.gender = "";
    }
    if (state.person.gender === "F" || state.person.gender === "f" || state.person.gender === "W" || state.person.gender === "w") {
        state.person.gender = "Woman"
    }
    if (state.person.gender === "M" || state.person.gender === "m") {
        state.person.gender = "Man"
    }
    document.title = `Chronokeep - ${state.year.year} ${state.event.name} Results - ${state.person.first} ${state.person.last}`
    let ranking_gender = state.person.gender.toUpperCase();
    if (ranking_gender === "W" || ranking_gender === "F" || ranking_gender === "WOMAN") {
        ranking_gender = "Women"
    }
    if (ranking_gender === "M" || ranking_gender === "MAN") {
        ranking_gender = "Men"
    }
    if (ranking_gender === state.person.gender.toUpperCase()) {
        ranking_gender = state.person.gender;
    }
    let event: string = `${state.event.name}`;
    if (state.single_distance === false) {
        event = `${state.event.name} ${state.person.distance}`;
    }
    let Certificate: JSX.Element | null = finish !== null ? CertificateGenerator(
        `${state.person.first} ${state.person.last}`,
        event,
        FormatTime(finish.chip_seconds, 0, finish, true, true),
        DateString(state.year.date_time),
        false
    ) : null;
    return (
        <div>
            <div className="container-sm m-2 p-4 mx-auto">
                <div className="p-2">
                    <div className="text-center text-important display-4 m-0">{`${state.year.year} ${state.event.name}`}</div>
                    <div className="text-center text-important text-secondary m-0 mt-2">{DateString(state.year.date_time)}</div>
                </div>
                <div className="mx-auto fit-width mt-3"><Link to={`/results/${state.event.slug}/${state.year.year}`} className="btn btn-danger btn-chronokeep">Back</Link></div>
            </div>
            <div className="container-sm sm-max-width m-5 mt-0 p-4 mx-auto shadow">
                <div className="p-2">
                    <div className="text-center text-important display-4 m-0">{`${state.person.anonymous === false ? state.person.first : "Bib"} ${state.person.anonymous === false ? state.person.last : state.person.bib}`}</div>
                    <div className="text-center text-important text-secondary m-0">{`${state.person.gender === "" ? "" : state.person.gender + " - "}${state.person.age}`}</div>
                </div>
                { state.single_distance === false &&
                    <div className="h3 m-2 mt-0 text-center text-important text-secondary mx-auto">{state.person.distance}</div>
                }
                <div className="bib-box h4 m-2 p-2 mx-auto">{state.person.bib}</div>
            </div>
            <div className="row container-lg lg-max-width shadow mx-auto gx-6 gy-3 pb-3 justify-content-center align-items-center">
                <div className="col-lg-8 p-4">
                    <div className="row d-flex justify-content-left align-items-center gx-4 gy-3 mb-4">
                        { finish !== null &&
                        <div className="col-sm-8 text-center">
                            <div className="h2 border-bottom">Time</div>
                            <div className="h2">{FormatTime(finish.seconds, finish.milliseconds, finish, true)}</div>
                        </div>
                        }
                        { finish !== null &&  state.distance !== null &&
                        <div className="col-sm-4 overflow-hidden">
                            <div className="d-flex border-bottom text-center">
                                <div className="h5 me-1 mb-0">Pace </div>
                                <div className="text-secondary">(per {state.distance.unit})</div>
                            </div>
                            <div className="h5">{FormatTime(finish.chip_seconds / state.distance.dist, 0, finish, true)}</div>
                        </div>
                        }
                    </div>
                    { finish !== null && finish.ranking > 0 &&
                    <div className="row d-flex justify-content-center align-items-center gx-4 gy-3">
                        <div className="col-sm-4 text-center">
                            <div className="h5 border-bottom">Overall</div>
                            <div className="h5">{finish.ranking}</div>
                        </div>
                        { finish.gender_ranking > 0 &&
                        <div className="col-sm-4 text-center">
                            <div className="h5 border-bottom">{ranking_gender}</div>
                            <div className="h5">{finish.gender_ranking}</div>
                        </div>
                        }
                        { finish.gender !== "" && finish.age_group !== "" && finish.age_ranking > 0 &&
                        <div className="col-sm-4 text-center">
                            <div className="h5 border-bottom">{`${ranking_gender} ${finish.age_group}`}</div>
                            <div className="h5">{finish.age_ranking}</div>
                        </div>
                        }
                    </div>
                    }
                </div>
                <div className="col-lg-4 p-4">
                    <div className="row flex-lg-column align-items-center justify-content-stretch p-0 gx-4 gy-3">
                        { start !== null &&
                        <div className="col col-cst text-center">
                            <div className="h5 border-bottom">Start Time</div>
                            <div className="h5">{FormatTime(start.seconds, start.milliseconds, start)}</div>
                        </div>
                        }
                        { state.distance !== null &&
                        <div className="col col-cst text-center">
                            <div className="h5 border-bottom">Distance</div>
                            <div className="h5">{state.distance.dist} {state.distance.unit}</div>
                        </div>
                        }
                        { finish !== null && finish.type === 0 &&
                        <div className="col col-cst text-center">
                            <div className="h5 border-bottom">Chip Time</div>
                            <div className="h5">{FormatTime(finish.chip_seconds, finish.chip_milliseconds, finish, true)}</div>
                        </div>
                        }
                    </div>
                </div>
            </div>
            { Certificate !== null &&
                Certificate
            }
            {state.event.type === "time" &&
                <PersonTime results={results} gender={state.person.gender} />
            }
            {state.event.type !== "time" &&
                <PersonDistance results={results} gender={state.person.gender} />
            }
        </div>
    );
}

export default Person;