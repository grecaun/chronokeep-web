import { useEffect, useState } from 'react';
import { SetURLSearchParams, useParams, useSearchParams } from 'react-router-dom';
import AwardsTable from '../Parts/AwardsTable';
import TimeAwardsTable from '../Parts/TimeAwardsTable';
import Loading from '../Parts/Loading';
import ErrorMsg from '../Parts/ErrorMsg';
import DateString from '../Parts/DateString';
import { AwardsState } from '../Interfaces/states';
import { ResultsLoader } from '../loaders/results';

function pushHistory(state: AwardsState, setSearchParams: SetURLSearchParams): void {
    setSearchParams(params => {
        params.set("ov", state.numOV.toString());
        params.set("ag", state.numAG.toString())
        params.set("inc", state.overallInc ? "true" : "false")
        params.set("gmas", state.grandMasters ? "true" : "false")
        params.set("mas", state.masters ? "true" : "false")
        return params;
    });
}

function handleAGChange(
    event: { target: HTMLSelectElement },
    setState: React.Dispatch<React.SetStateAction<AwardsState>>,
    state: AwardsState
    ) {
    setState({
        ...state,
        numAG: Number(event.target.value)
    });
}

function handleOVChange(
    event: { target: HTMLSelectElement },
    setState: React.Dispatch<React.SetStateAction<AwardsState>>,
    state: AwardsState
    ) {
    setState({
        ...state,
        numOV: Number(event.target.value)
    });
}

function handleOverallChange(
    event: { target: HTMLInputElement },
    setState: React.Dispatch<React.SetStateAction<AwardsState>>,
    state: AwardsState
    ) {
    setState({
        ...state,
        overallInc: event.target.checked
    });
}

function handleMastersChange(
    event: { target: HTMLInputElement },
    setState: React.Dispatch<React.SetStateAction<AwardsState>>,
    state: AwardsState
    ) {
    setState({
        ...state,
        masters: event.target.checked
    });
}

function handleGrandMastersChange(
    event: { target: HTMLInputElement },
    setState: React.Dispatch<React.SetStateAction<AwardsState>>,
    state: AwardsState
    ) {
    setState({
        ...state,
        grandMasters: event.target.checked
    });
}

export default function Awards() {
    const [searchParams] = useSearchParams();
    const params = useParams();
    const { state } = ResultsLoader(params, 'awards');
    const [awardsState, setAwardsState] = useState<AwardsState>({
        numAG: searchParams.get("ag") === null ? 3 : Number(searchParams.get("ag")) < 0 ? 3 : Number(searchParams.get("ag")),
        numOV: searchParams.get("ov") === null ? 3 : Number(searchParams.get("ov")) < 0 ? 3 : Number(searchParams.get("ov")),
        overallInc: (searchParams.get("inc")) !== "false",
        grandMasters: (searchParams.get("gmas")) === "true",
        masters: (searchParams.get("mas")) === "true"
    });
    useEffect(() => {
        pushHistory(awardsState, setSearchParams);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [awardsState]);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, setSearchParams] = useSearchParams();
    document.title = `Chronokeep - Awards`
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
    const distances = Object.keys(state.results)
    const years = state.years.sort((a, b) => {
        return Date.parse(a.date_time) - Date.parse(b.date_time)
    })
    const info = {
        slug: params.slug,
        year: state.year?.year
    }
    document.title = `Chronokeep - ${state.year?.year} ${state.event?.name} Awards`
    return (
        <div>
            <div className="row container-lg lg-max-width mx-auto d-flex mt-4 mb-3 align-items-stretch">
                <div className="col-md-10 flex-fill text-center mx-auto m-1">
                    <p className="text-important mb-2 mt-1 h1">{`${state.year?.year} ${state.event?.name} Awards`}</p>
                    <p className="text-important h4">{DateString(state.year!.date_time)}</p>
                </div>
                { years.length > 1 && 
                    <div className="col-md-2 nav flex-md-column justify-content-center p-0">
                        {
                            years.map((year, index) => {
                                let className = "nav-link text-center text-important text-secondary"
                                if (year.year === state.year?.year) {
                                    className = "nav-link disabled text-center text-important text-dark"
                                }
                                return <a href={`/results/${params.slug}/${year.year}`} key={`year${index}`} className={className}>{year.year}</a>
                            })
                        }
                    </div>
                }
            </div>
            { distances.length > 0 &&
            <div className="row container-lg lg-max-width mx-auto d-flex align-items-stretch shadow-sm p-0 border border-light">
                <div className='awards-options row align-items-center'>
                    <div className='col'>
                        <label htmlFor="numberOVWinners">Number of Overall Awards</label>
                        <select className="form-select" aria-label="Default select count" defaultValue={awardsState.numOV} id="numberOVWinners" onChange={(event) => handleOVChange(event, setAwardsState, awardsState)}>
                            <option value="0">Zero</option>
                            <option value="1">One</option>
                            <option value="2">Two</option>
                            <option value="3">Three</option>
                            <option value="4">Four</option>
                            <option value="5">Five</option>
                            <option value="6">Six</option>
                            <option value="7">Seven</option>
                            <option value="8">Eight</option>
                            <option value="9">Nine</option>
                            <option value="10">Ten</option>
                        </select>
                    </div>
                    <div className='col'>
                        <label htmlFor="numberAGWinners">Number of Age Group Awards</label>
                        <select className="form-select" aria-label="Default select count" defaultValue={awardsState.numAG} id="numberAGWinners" onChange={(event) => handleAGChange(event, setAwardsState, awardsState)}>
                            <option value="0">Zero</option>
                            <option value="1">One</option>
                            <option value="2">Two</option>
                            <option value="3">Three</option>
                            <option value="4">Four</option>
                            <option value="5">Five</option>
                            <option value="6">Six</option>
                            <option value="7">Seven</option>
                            <option value="8">Eight</option>
                            <option value="9">Nine</option>
                            <option value="10">Ten</option>
                        </select>
                    </div>
                </div>
                <div className='awards-options-bottom row align-items-center'>
                    <div className="col">
                        <div className="form-check form-check-inline">
                            <input className="form-check-input" type="checkbox" id="overallIncluded" checked={awardsState.overallInc} onChange={(event) => handleOverallChange(event, setAwardsState, awardsState)} />
                            <label className="form-check-label" htmlFor="overallIncluded">Include overall in age groups?</label>
                        </div>
                    </div>
                    <div className="col">
                        <div className="form-check form-check-inline">
                            <input className="form-check-input" type="checkbox" id="masters" checked={awardsState.masters} onChange={(event) => handleMastersChange(event, setAwardsState, awardsState)} />
                            <label className="form-check-label" htmlFor="masters">Display Masters Group?</label>
                        </div>
                    </div>
                    <div className="col">
                        <div className="form-check form-check-inline">
                            <input className="form-check-input" type="checkbox" id="grandMasters" checked={awardsState.grandMasters} onChange={(event) => handleGrandMastersChange(event, setAwardsState, awardsState)} />
                            <label className="form-check-label" htmlFor="grandMasters">Display Grand Masters Group?</label>
                        </div>
                    </div>
                </div>
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
                                if (state.event?.type === "time") {
                                    return (
                                        <TimeAwardsTable
                                            distance={distance}
                                            results={state.results[distance]}
                                            info={info}
                                            key={index}
                                            showTitle={distances.length > 1}
                                            numberAG={awardsState.numAG}
                                            numberOV={awardsState.numOV}
                                            overallInc={awardsState.overallInc}
                                            grandMasters={awardsState.grandMasters}
                                            masters={awardsState.masters}
                                            search={state.search}
                                            sort_by={state.sort_by}
                                            />
                                    )
                                } else {
                                    return (
                                        <AwardsTable
                                            distance={distance}
                                            results={state.results[distance]}
                                            info={info}
                                            key={index}
                                            showTitle={distances.length > 1}
                                            numberAG={awardsState.numAG}
                                            numberOV={awardsState.numOV}
                                            overallInc={awardsState.overallInc}
                                            grandMasters={awardsState.grandMasters}
                                            masters={awardsState.masters}
                                            search={state.search}
                                            sort_by={state.sort_by}
                                            />
                                    )
                                }
                            })
                        }
                    </div>
                </div>
            </div>
            }
            { distances.length === 0 &&
            <div className="container-lg lg-max-width shadow-sm p-5 border border-light">
                <div className="text-center">
                    <h2>No awards to display.</h2>
                </div>
            </div>
            }
        </div>
    )
}