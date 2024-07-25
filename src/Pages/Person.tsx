import { Link, useParams } from 'react-router-dom';
import DateString from '../Parts/DateString';
import ErrorMsg from '../Parts/ErrorMsg';
import FormatTime, { FormatPace } from '../Parts/FormatTime';
import Loading from '../Parts/Loading';
import PersonTime from '../Parts/PersonTime';
import PersonDistance from '../Parts/PersonDistance';
import { Segment, TimeResult } from '../Interfaces/types';
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
    const segments: Segment[] = state.segments
    segments.sort((a, b) => {
        return a.distance_value - b.distance_value;
    })
    console.log(segments)
    let latestResult: TimeResult | null = results.length > 0 ? results[results.length-1] : null;
    let prevResult: TimeResult | null = results.length > 1 ? results[results.length-2] : start ?? null;
    let prevSegment: Segment | null = null;
    let curSegment: Segment | null = null;
    let nextSegment: Segment | null = null;
    let finishSegment: Segment | null = null;
    for (const seg of segments) {
        if (latestResult !== null && latestResult.segment.trim() === seg.name.trim()) {
            curSegment = seg;
        }
        if (prevResult !== null && prevResult.segment.trim() === seg.name.trim()) {
            prevSegment = seg;
        }
        if ((curSegment != null && seg.distance_value > curSegment.distance_value)
            && (nextSegment === null || seg.distance_value < nextSegment.distance_value)) {
            nextSegment = seg;
        }
        if (seg.name === "Finish") {
            finishSegment = seg;
        }
    }
    console.log(latestResult)
    console.log(prevResult)
    console.log(prevSegment)
    console.log(curSegment)
    console.log(nextSegment)
    console.log(finishSegment)
    // segment pace
    let segmentPace = 0;
    let segmentPaceStr = "";
    if (prevResult != null && latestResult != null && curSegment != null && prevSegment != null) {
        segmentPace = Math.floor((latestResult.seconds - prevResult.seconds) / (curSegment.distance_value - prevSegment.distance_value));
        segmentPaceStr = FormatPace(segmentPace);
    } else if (latestResult != null && curSegment != null) {
        segmentPace = Math.floor(latestResult.chip_seconds / curSegment.distance_value);
        segmentPaceStr = FormatPace(segmentPace);
    }
    console.log(segmentPaceStr)
    // overall pace
    let overallPace = 0;
    let overallPaceStr = "";
    if (latestResult != null && curSegment != null) {
        overallPace = Math.floor(latestResult.chip_seconds / curSegment.distance_value);
        overallPaceStr = FormatPace(overallPace);
    }
    console.log(overallPaceStr)
    // Difference between paces. Runners usually slow down so this will be a positive value,
    // if they make a negative split then this will be negative.
    let paceDiff = segmentPace - overallPace;
    // estimated time to next (segment pace & segment pace + segment/overall pace diff)
    let estimatedNextMin: Date | null = null;
    let estimatedNextMax: Date | null = null;
    let estimatedNextClockMin = "";
    let estimatedNextClockMax = "";
    let estimatedNextChipMin = "";
    let estimatedNextChipMax = "";
    if (latestResult != null && curSegment != null && nextSegment != null) {
        estimatedNextMin = new Date(latestResult.local_time);
        estimatedNextMin.setSeconds(estimatedNextMin.getSeconds() + (segmentPace * (nextSegment.distance_value - curSegment.distance_value)));
        estimatedNextMax = new Date(latestResult.local_time)
        estimatedNextMax.setSeconds(estimatedNextMax.getSeconds() + ((segmentPace + paceDiff) * (nextSegment.distance_value - curSegment.distance_value)));
        estimatedNextClockMin = FormatTime(latestResult.seconds + (segmentPace * (nextSegment.distance_value - curSegment.distance_value)), 0, latestResult, false, true);
        estimatedNextClockMax = FormatTime(latestResult.seconds + ((segmentPace + paceDiff) * (nextSegment.distance_value - curSegment.distance_value)), 0, latestResult, false, true);
        estimatedNextChipMin = FormatTime(latestResult.chip_seconds + (segmentPace * (nextSegment.distance_value - curSegment.distance_value)), 0, latestResult, false, true);
        estimatedNextChipMax = FormatTime(latestResult.chip_seconds + ((segmentPace + paceDiff) * (nextSegment.distance_value - curSegment.distance_value)), 0, latestResult, false, true);
    }
    console.log(estimatedNextMin, estimatedNextMax)
    // estimated finish (if not next)
    let estimatedFinishMin: Date | null = null;
    let estimatedFinishMax: Date | null = null;
    let estimatedFinishClockMin = "";
    let estimatedFinishClockMax = "";
    let estimatedFinishChipMin = "";
    let estimatedFinishChipMax = "";
    if (latestResult != null && curSegment != null && finishSegment != null) {
        estimatedFinishMin = new Date(latestResult.local_time);
        estimatedFinishMin.setSeconds(estimatedFinishMin.getSeconds() + (segmentPace * (finishSegment.distance_value - curSegment.distance_value)));
        estimatedFinishMax = new Date(latestResult.local_time)
        estimatedFinishMax.setSeconds(estimatedFinishMax.getSeconds() + ((segmentPace + paceDiff) * (finishSegment.distance_value - curSegment.distance_value)));
        estimatedFinishClockMin = FormatTime(latestResult.seconds + (segmentPace * (finishSegment.distance_value - curSegment.distance_value)), 0, latestResult, false, true);
        estimatedFinishClockMax = FormatTime(latestResult.seconds + ((segmentPace + paceDiff) * (finishSegment.distance_value - curSegment.distance_value)), 0, latestResult, false, true);
        estimatedFinishChipMin = FormatTime(latestResult.chip_seconds + (segmentPace * (finishSegment.distance_value - curSegment.distance_value)), 0, latestResult, false, true);
        estimatedFinishChipMax = FormatTime(latestResult.chip_seconds + ((segmentPace + paceDiff) * (finishSegment.distance_value - curSegment.distance_value)), 0, latestResult, false, true);
    }
    console.log(estimatedFinishMin, estimatedFinishMax)
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
    let event: string = `${state.year.year} ${state.event.name}`;
    if (state.single_distance === false) {
        event = `${state.year.year} ${state.event.name} ${state.person.distance}`;
    }
    const Certificate: JSX.Element | null = finish !== null ? CertificateGenerator(
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
                    <div className="text-center text-important text-secondary m-0">{`${state.person.gender === "" ? "" : state.person.gender + (state.person.age > 0 && state.person.age < 130 ? " - " : "")}${state.person.age > 0 && state.person.age < 130 ? state.person.age : ""}`}</div>
                </div>
                { state.single_distance === false &&
                    <div className="h3 m-2 mt-0 text-center text-important text-secondary mx-auto">{state.person.distance}</div>
                }
                <div className="bib-box h4 m-2 p-2 mx-auto">{state.person.bib}</div>
            </div>
            { finish &&
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
            }
            { !finish && curSegment &&
            <div className="row container-lg lg-max-width shadow mx-auto gx-6 gy-3 pb-3 justify-content-center align-items-center">
                <div>
                    Current location: {curSegment.name}
                </div>
                <div>
                    Segment pace: {segmentPaceStr}
                </div>
                <div>
                    Overall pace: {overallPaceStr}
                </div>
                <div>
                    Estimated arrival time at { nextSegment != null ? nextSegment.name : "next location" }: { `Clock - ${estimatedNextClockMin}-${estimatedNextClockMax} -- Chip - ${estimatedNextChipMin}-${estimatedNextChipMax}` } {estimatedNextMin != null ? estimatedNextMin.toLocaleTimeString() : ""}
                </div>
                <div>
                    Estimated finish time: { `Clock - ${estimatedFinishClockMin}-${estimatedFinishClockMax} -- Chip - ${estimatedFinishChipMin}-${estimatedFinishChipMax}` } {estimatedFinishMin != null ? estimatedFinishMin.toLocaleTimeString() : ""}
                </div>
            </div>
            }
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