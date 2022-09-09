import React, { Component } from 'react';
import AwardsTable from '../Parts/AwardsTable';
import TimeAwardsTable from '../Parts/TimeAwardsTable';
import Header from '../Parts/Header';
import Footer from '../Parts/Footer';
import Loading from '../Parts/Loading';
import ErrorMsg from '../Parts/ErrorMsg';
import DateString from '../Parts/DateString';

class Awards extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            error: false,
            slug: props.match.params.slug,
            year: props.match.params.year,
            found: null,
            numAG: 3,
            numOV: 3,
            overallInc: false
        }
        this.handleAGChange = this.handleAGChange.bind(this);
        this.handleOVChange = this.handleOVChange.bind(this);
        this.handleOverallChange = this.handleOverallChange.bind(this);
    }

    componentDidMount() {
        const BASE_URL = process.env.REACT_APP_CHRONOKEEP_API_URL;
        const requestOptions = {
            method: 'POST',
            body: JSON.stringify({ slug: this.state.slug, year: this.state.year }),
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + process.env.REACT_APP_CHRONOKEEP_ACCESS_TOKEN
            }
        }
        fetch(BASE_URL + 'results', requestOptions)
        .then(response => {
            if (response.status === 200) {
                this.setState({
                    status: response.status,
                    response: true
                });
            } else {
                this.setState({
                    error: true,
                    status: response.status,
                    response: true
                });
            }
            return response.json();
        })
        .then(data => {
            this.setState({
                loading: false,
                found: data,
                count: data.count,
                event: data.event,
                years: data.years,
                year: data.event_year,
                results: data.results
            });
        })
        .catch(error => {
            this.setState({
                error: true,
                errorMessage: error.toString()
            });
            console.error("There was an error!", error)
        })
    }

    handleAGChange(event) {
        this.setState({
            numAG: Number(event.target.value)
        })
    }

    handleOVChange(event) {
        this.setState({
            numOV: Number(event.target.value)
        })
    }

    handleOverallChange(event) {
        this.setState({
            overallInc: event.target.checked
        })
    }

    render() {
        document.title = `Chronokeep - Awards`
        const state = this.state
        if (state.error === true) {
            document.title = `Chronokeep - Error`
            return (
                <div>
                    <Header page={"awards"} />
                    <ErrorMsg status={state.status} data={state.found} />
                    <Footer />
                </div>
            );
        }
        if (state.loading === true) {
            return (
                <div>
                    <Header page={"awards"} />
                    <div className="mx-auto sm-max-width text-center container-md border border-light p-5 pt-4">
                        <h1 className="text-important display-4">Loading Results</h1>
                        <Loading />
                    </div>
                    <Footer />
                </div>
            );
        }
        const distances = Object.keys(state.results)
        const years = state.years.sort((a, b) => {
            var aDate = new Date(a.date_time)
            var bDate = new Date(b.date_time)
            return aDate - bDate
        })
        const info = {
            slug: state.slug,
            year: state.year.year
        }
        document.title = `Chronokeep - ${state.year.year} ${state.event.name} Awards`
        return (
            <div>
                <Header page={"awards"} />
                <div className="row container-lg lg-max-width mx-auto d-flex mt-4 mb-3 align-items-stretch">
                    <div className="col-md-10 flex-fill text-center mx-auto m-1">
                        <p className="text-important mb-2 mt-1 h1">{`${state.year.year} ${state.event.name} Awards`}</p>
                        <p className="text-important h4">{DateString(state.year.date_time)}</p>
                    </div>
                    { years.length > 1 && 
                        <div className="col-md-2 nav flex-md-column justify-content-center p-0">
                            {
                                years.map((year, index) => {
                                    var className = "nav-link text-center text-important text-secondary"
                                    if (year.year === state.year.year) {
                                        className = "nav-link disabled text-center text-important text-dark"
                                    }
                                    return <a href={`/results/${state.slug}/${year.year}`} key={`year${index}`} className={className}>{year.year}</a>
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
                            <select className="form-select" aria-label="Default select count" defaultValue={state.numOV} id="numberOVWinners" onChange={this.handleOVChange}>
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
                            <select className="form-select" aria-label="Default select count" defaultValue={state.numAG} id="numberAGWinners" onChange={this.handleAGChange}>
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
                        <div className="col">
                            <div className="form-check form-check-inline">
                                <input className="form-check-input" type="checkbox" id="overallIncluded" defaultValue={state.overallInc} onChange={this.handleOverallChange} />
                                <label className="form-check-label" htmlFor="overallIncluded">Include overall in age group awards?</label>
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
                                    const numAg = state.numAG
                                    const numOv = state.numOV
                                    const ovInc = state.overallInc
                                    if (state.event.type === "time") {
                                        return (
                                            <TimeAwardsTable distance={distance} results={state.results[distance]} info={info} key={index} showTitle={distances.length > 1} numberAG={numAg} numberOV={numOv} overallIncluded={ovInc}/>
                                        )
                                    } else {
                                        console.log("overall", numOv, "ag", numAg, "include", ovInc)
                                        return (
                                            <AwardsTable distance={distance} results={state.results[distance]} info={info} key={index} showTitle={distances.length > 1} numberAG={numAg} numberOV={numOv} overallIncluded={ovInc}/>
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
                        <h2>No results to display.</h2>
                    </div>
                </div>
                }
            </div>
        )
    }
}

export default Awards;