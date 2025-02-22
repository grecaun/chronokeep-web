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

const googleMapsRegex = new RegExp("^https:\\/\\/www\\.google\\.com\\/maps\\/");

function MapsFrame(link: string) {
    return (
        <iframe src={link} width="640" height="480"></iframe>
    )
}

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
        if (res.segment.trim() === "Start") {
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
    // overall pace
    let overallPace = 0;
    let overallPaceStr = "";
    if (latestResult != null && curSegment != null) {
        overallPace = Math.floor(latestResult.chip_seconds / curSegment.distance_value);
        overallPaceStr = FormatPace(overallPace);
    }
    // finish pace
    let finishPace = 0;
    let finishPaceStr = "";
    if (finish != null && finishSegment != null) {
        finishPace = Math.floor(finish.chip_seconds / finishSegment.distance_value)
        finishPaceStr = FormatPace(finishPace)
    }
    // Difference between paces. Runners usually slow down so this will be a positive value,
    // if they make a negative split then this will be negative.
    let paceDiff = segmentPace - overallPace;
    // estimated time to next (segment pace & segment pace + segment/overall pace diff)
    let estimatedNext: Date | null = null;
    let estimatedNextChip = "";
    if (latestResult != null && curSegment != null && nextSegment != null) {
        if (paceDiff < 0) {
            estimatedNext = new Date(latestResult.local_time);
            estimatedNext.setSeconds(estimatedNext.getSeconds() + (segmentPace * (nextSegment.distance_value - curSegment.distance_value)));
            estimatedNextChip = FormatTime(latestResult.chip_seconds + (segmentPace * (nextSegment.distance_value - curSegment.distance_value)), 0, latestResult, false, true);
        } else {
            estimatedNext = new Date(latestResult.local_time)
            estimatedNext.setSeconds(estimatedNext.getSeconds() + ((segmentPace + paceDiff) * (nextSegment.distance_value - curSegment.distance_value)));
            estimatedNextChip = FormatTime(latestResult.chip_seconds + ((segmentPace + paceDiff) * (nextSegment.distance_value - curSegment.distance_value)), 0, latestResult, false, true);
        }
    }
    // estimated finish (if not next)
    let estimatedFinish: Date | null = null;
    let estimatedFinishChip = "";
    if (latestResult != null && curSegment != null && finishSegment != null) {
        estimatedFinish = new Date(latestResult.local_time)
        if (paceDiff < 0) {
            estimatedFinish.setSeconds(estimatedFinish.getSeconds() + (segmentPace * (finishSegment.distance_value - curSegment.distance_value)));
            estimatedFinishChip = FormatTime(latestResult.chip_seconds + (segmentPace * (finishSegment.distance_value - curSegment.distance_value)), 0, latestResult, false, true);
        } else {
            estimatedFinish.setSeconds(estimatedFinish.getSeconds() + ((segmentPace + paceDiff) * (finishSegment.distance_value - curSegment.distance_value)));
            estimatedFinishChip = FormatTime(latestResult.chip_seconds + ((segmentPace + paceDiff) * (finishSegment.distance_value - curSegment.distance_value)), 0, latestResult, false, true);
        }
    }
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
    const pretty_year = state.year.year.replace(/\D/g, "");
    document.title = `Chronokeep - ${pretty_year} ${state.event.name} Results - ${state.person.first} ${state.person.last}`
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
    let event: string = `${pretty_year} ${state.event.name}`;
    if (state.single_distance === false) {
        event = `${pretty_year} ${state.event.name} ${state.person.distance}`;
    }
    if (state.event.cert_name.length > 0) {
        event = `${pretty_year} ${state.event.cert_name} ${state.person.distance}`;
    }
    const Certificate: JSX.Element | null = finish !== null ? CertificateGenerator(
        `${state.person.first} ${state.person.last}`,
        event,
        FormatTime(finish.chip_seconds, 0, finish, true, true),
        DateString(state.year.date_time),
        state.cert_distance !== null ? state.cert_distance.certification : '',
        false
    ) : null;
    return (
        <div>
            <div className="container-sm m-2 p-4 mx-auto">
                <div className="p-2">
                    <div className="text-center text-important display-4 m-0">{`${pretty_year} ${state.event.name}`}</div>
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
            { finish !== null &&
            <div className="row container-lg lg-max-width shadow mx-auto gx-6 gy-3 pb-3 justify-content-center align-items-center">
                <div className="col-lg-8 p-4">
                    <div className="row d-flex justify-content-left align-items-center gx-4 gy-3 mb-4">
                        { 
                        <div className="col-sm-8 text-center">
                            <div className="h2 border-bottom">Time</div>
                            <div className="h2">{FormatTime(finish.chip_seconds, finish.chip_milliseconds, finish, true)}</div>
                        </div>
                        }
                        { finishPaceStr.length > 0 && finishSegment !== null &&
                        <div className="col-sm-4 text-center">
                            <div className="h5 border-bottom">Pace </div>
                            <div className="h5">{`${finishPaceStr} / ${finishSegment?.distance_unit}`}</div>
                        </div>
                        }
                    </div>
                    {  finish.ranking > 0 &&
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
                        { finish !== null && finish.type === 0 &&
                        <div className="col col-cst text-center">
                            <div className="h5 border-bottom">Clock Time</div>
                            <div className="h5">{FormatTime(finish.seconds, finish.milliseconds, finish, true)}</div>
                        </div>
                        }
                    </div>
                </div>
            </div>
            }
            { !finish && curSegment != null && curSegment.name !== "Finish" &&
            <div>
                { curSegment.map_link != null && curSegment.map_link.length > 0 && curSegment.map_link.match(googleMapsRegex) &&
                <div className="row container-lg lg-max-width shadow mx-auto gx-6 gy-3 pb-3 mb-4 justify-content-center align-items-center">
                    {MapsFrame(curSegment.map_link)}
                </div>
                }
                <div className="row container-lg lg-max-width shadow mx-auto gx-6 gy-3 pb-3 justify-content-center align-items-center">
                    <div className='mx-auto text-center mt-3 mb-3 text-important h2'>
                        <div className='h5 mb-0'>{state.person.anonymous === false ? `${state.person.first} was last` : "Last"} seen at</div>
                        <div>{curSegment.name}</div>
                    </div>
                    <div className="col-md-4 my-0 text-important h6 text-center">
                        <div className='mb-0'>Current Pace</div>
                        <div className='h2'>{`${segmentPaceStr} / ${curSegment?.distance_unit}`}</div>
                    </div>
                    <div className="col-md-4 my-0 text-important h6 text-center">
                        <div className='mb-0'>Overall Pace</div>
                        <div className='h2'>{`${overallPaceStr} / ${finishSegment?.distance_unit}`}</div>
                    </div>
                    { (estimatedNextChip.length > 0 || estimatedNext) && nextSegment !== finishSegment &&
                    <div className="col-lg-12 row my-0 text-important h6 text-center justify-content-center align-items-center">
                        { estimatedNextChip.length > 0 &&
                            <div className="col-md-4 my-0 text-important h6 text-center">
                                <div className='mb-0'>Estimated Chip Time at { nextSegment != null ? nextSegment.name : "Next Location" }</div>
                                <div className='h2'>{`${estimatedNextChip}`}</div>
                            </div>
                        }
                        { estimatedNext &&
                            <div className="col-md-4 my-0 text-important h6 text-center">
                                <div className='mb-0'>Estimated Local Time at { nextSegment != null ? nextSegment.name : "Next Location" }</div>
                                <div className='h2'>{`${estimatedNext.toLocaleTimeString()}`}</div>
                            </div>
                        }
                    </div>
                    }
                    { (estimatedFinishChip.length > 0 || estimatedFinish) && 
                    <div className="col-lg-12 row my-0 text-important h6 text-center justify-content-center align-items-center">
                        { estimatedFinishChip.length > 0 &&
                            <div className="col-md-4 my-0 text-important h6 text-center">
                                <div className='mb-0'>Estimated Chip Time at Finish</div>
                                <div className='h2'>{`${estimatedFinishChip}`}</div>
                            </div>
                        }
                        { estimatedFinish &&
                            <div className="col-md-4 my-0 text-important h6 text-center">
                                <div className='mb-0'>Estimated Local Time at Finish</div>
                                <div className='h2'>{`${estimatedFinish.toLocaleTimeString()}`}</div>
                            </div>
                        }
                    </div>
                    }
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