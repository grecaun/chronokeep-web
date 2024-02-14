import { Component } from 'react';
import { Link, useParams } from 'react-router-dom';
import DateString from '../Parts/DateString';
import ErrorMsg from '../Parts/ErrorMsg';
import Footer from '../Parts/Footer';
import FormatTime from '../Parts/FormatTime';
import Header from '../Parts/Header';
import Loading from '../Parts/Loading';
import PersonTime from '../Parts/PersonTime';
import PersonDistance from '../Parts/PersonDistance';
import { PersonState } from '../Interfaces/states';
import { TimeResult } from '../Interfaces/types';
import { ParamProps } from '../Interfaces/props';
import { ErrorResponse, GetBibResultsResponse } from '../Interfaces/responses';

class Person extends Component<ParamProps, PersonState> {
    state: PersonState = {
        status: 0,
        loading: true,
        error: false,
        distance: null,
        message: null,
        event: {
            name: '',
            slug: '',
            website: '',
            image: '',
            contact_email: '',
            access_restricted: false,
            type: '',
            recent_time: ''
        },
        year: {
            year: '',
            date_time: ''
        },
        results: [],
        person: {
            bib: '',
            first: '',
            last: '',
            gender: '',
            anonymous: false,
            distance: '',
            age: 0
        }
    }

    componentDidMount() {
        const params = this.props.params as { slug: string, year: string, bib: string };
        const BASE_URL = import.meta.env.VITE_CHRONOKEEP_API_URL;
        const requestOptions = {
            method: 'POST',
            body: JSON.stringify({ slug: params.slug, year: params.year, bib: params.bib }),
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + import.meta.env.VITE_CHRONOKEEP_ACCESS_TOKEN
            }
        }
        fetch(BASE_URL + 'results/bib', requestOptions)
        .then(response => {
            if (response.status === 200) {
                this.setState({
                    status: response.status
                });
            } else {
                this.setState({
                    error: true,
                    status: response.status
                });
            }
            return response.json();
        })
        .then(data => {
            if (Object.prototype.hasOwnProperty.call(data, 'results')) {
                const dta = data as GetBibResultsResponse
                this.setState({
                    loading: false,
                    event: dta.event,
                    year: dta.year,
                    results: dta.results,
                    person: dta.person
                })
            } else {
                const err = data as ErrorResponse
                this.setState({
                    loading: false,
                    error: true,
                    message: err.message
                })
            }
        })
        .catch(error => {
            this.setState({
                error: true
            });
            console.error("There was an error!", error)
        })
    }

    render() {
        document.title = `Chronokeep - Individual Results`
        const state = this.state
        if (state.error === true) {
            document.title = "Chronokeep - Error"
            return (
                <div>
                    <Header page={"person"} />
                    <ErrorMsg status={state.status} message={state.message} />
                    <Footer />
                </div>
            );
        }
        if (state.loading === true) {
            return (
                <div>
                    <Header page={"person"} />
                    <div className="mx-auto sm-max-width text-center container-md p-5 pt-4">
                        <h1 className="text-important display-4">Loading Results</h1>
                        <Loading />
                    </div>
                    <Footer />
                </div>
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
        return (
            <div>
                <Header page={"person"} />
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
                    <div className="h3 m-2 mt-0 text-center text-important text-secondary mx-auto">{state.person.distance}</div>
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
                                <div className="h5">{FormatTime(start.seconds, start.milliseconds, start, true)}</div>
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
                {state.event.type === "time" &&
                    <PersonTime results={results} gender={state.person.gender} />
                }
                {state.event.type !== "time" &&
                    <PersonDistance results={results} gender={state.person.gender} />
                }
                <Footer />
            </div>
        );
    }
}

const PersonPage = () => (
    <Person
        params={useParams()}
    />);

export default PersonPage;