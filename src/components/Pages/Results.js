import React, { Component } from 'react';
import ResultsTable from '../Parts/ResultsTable';
import TimeResultsTable from '../Parts/TimeResultsTable';
import Header from '../Parts/Header';
import Footer from '../Parts/Footer';
import Loading from '../Parts/Loading';
import ErrorMsg from '../Parts/ErrorMsg';
import DateString from '../Parts/DateString';

class Results extends Component {
    constructor(props) {
        super(props);
        const query = new URLSearchParams(this.props.location.search);
        const dist = query.get('dist')
        console.log(`Distance specified: ${dist}`)
        this.state = {
            loading: true,
            error: false,
            slug: props.match.params.slug,
            year: props.match.params.year,
            dist: dist === null ? "" : dist
        }
    }

    componentDidMount() {
        const BASE_URL = process.env.REACT_APP_BASE_URL;
        const requestOptions = {
            method: 'POST',
            body: JSON.stringify({ slug: this.state.slug, year: this.state.year })
        }
        fetch(BASE_URL + '/api/results', requestOptions)
        .then(response => {
            console.log("response found for results query")
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

    render() {
        const state = this.state
        if (state.error === true) {
            return (
                <div>
                    { Header("results") }
                    { ErrorMsg() }
                    { Footer() }
                </div>
            );
        }
        if (state.loading === true) {
            return (
                <div>
                    { Header("results") }
                    { Loading() }
                    { Footer() }
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
        console.log(years)
        return (
            <div>
                { Header("results") }
                <div className="row container-lg lg-max-width mx-auto d-flex mt-4 mb-3 align-items-stretch">
                    <div className="col-md-10 flex-fill text-center mx-auto m-1">
                        <p className="text-important text-primary mb-2 mt-1 h1">{`${state.year.year} ${state.event.name} Results`}</p>
                        <p className="text-important text-primary h4">{DateString(state.year.date_time)}</p>
                    </div>
                    { years.length > 1 && 
                        <div className="col-md-2 nav flex-md-column justify-content-center p-0">
                            {
                                years.map((year, index) => {
                                    var className = "nav-link text-center text-important"
                                    if (year.year === state.year.year) {
                                        className = "nav-link disabled text-center text-important"
                                    }
                                    return <a href={`/results/${state.slug}/${year.year}`} key={`year${index}`} className={className}>{year.year}</a>
                                })
                            }
                        </div>
                    }
                </div>
                { distances.length > 0 &&
                <div className="row container-lg lg-max-width mx-auto d-flex align-items-stretch shadow-sm p-0 border border-light">
                    <div className="p-0">
                        <ul className="nav nav-tabs nav-fill">
                            {
                                distances.map((distance, index) => {
                                    var show = false
                                    if (state.dist !== "" && state.dist === distance) {
                                        show = true
                                    } else if (state.dist === "" && index === 0) {
                                        show = true
                                    }
                                    return (
                                        <li className="nav-item" key={`distance${index}`}>
                                            <a className="nav-link text-important h5" data-bs-toggle="collapse" href={`#distance${index}`} role="button" aria-expanded={show} aria-controls={`distance${index}`}>{distance}</a>
                                        </li>
                                    );
                                })
                            }
                        </ul>
                        <div id="results-parent">
                            {
                                distances.map((distance, index) => {
                                    var show = false
                                    if (state.dist !== "" && state.dist === distance) {
                                        show = true
                                    } else if (state.dist === "" && index === 0) {
                                        show = true
                                    }
                                    if (state.event.type === "time") {
                                        return TimeResultsTable(distance, state.results[distance], index, show, info)
                                    } else {
                                        return ResultsTable(distance, state.results[distance], index, show, info)
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

export default Results;