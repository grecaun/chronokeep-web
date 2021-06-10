import React, { Component } from 'react';
import ResultsTable from '../Parts/ResultsTable'
import TimeResultsTable from '../Parts/TimeResultsTable'

class Results extends Component {
    constructor(props) {
        super(props);
        const query = new URLSearchParams(this.props.location.search);
        const dist = query.get('dist')
        console.log(`Distance specified: ${dist}`)
        this.state = {
            loading: true,
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
        .then(response =>{
            console.log("response found for results query")
            this.setState({
                status: response.status,
                response: true,
            });
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
        console.log(`slug: ${state.slug} -- year: ${state.year}`)
        if (state.loading === true) {
            return (
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            );
        }
        console.log(state.results)
        const distances = Object.keys(state.results)
        const date =  new Date(state.year.date_time).toLocaleDateString()
        const years = state.years.sort((a, b) => {
            var aDate = new Date(a.date_time)
            var bDate = new Date(b.date_time)
            console.log("A date")
            console.log(aDate)
            console.log("B date")
            console.log(bDate)
            return aDate - bDate
        })
        console.log(years)
        return (
            <div>
                <div class="row container-lg lg-max-width mx-auto d-flex align-items-center event-header-container">
                    <div class="col-md-10 text-center mx-auto results-container">
                        <p class="text-important results-header">{`${state.year.year} ${state.event.name} Results`}</p>
                        <p class="text-important results-date">{date}</p>
                    </div>
                    { years.length > 1 && 
                        <div class="col-md-2 nav flex-row flex-md-column justify-content-center">
                            {
                                years.map((year, index) => {
                                    var className = "nav-link text-center text-important"
                                    if (year.year === state.year.year) {
                                        className = "nav-link disabled text-center text-important"
                                    }
                                    return <a href={`/results/${state.slug}/${year.year}`} key={`year${index}`} class={className}>{year.year}</a>
                                })
                            }
                        </div>
                    }
                </div>
                { distances.length > 0 &&
                <div class="container-lg lg-max-width">
                    <ul class="nav nav-tabs nav-fill">
                        {
                            distances.map((distance, index) => {
                                var show = false
                                if (state.dist !== "" && state.dist === distance) {
                                    show = true
                                } else if (state.dist === "" && index === 0) {
                                    show = true
                                }
                                return (
                                    <li class="nav-item" key={`distance${index}`}>
                                        <a class="nav-link text-important h5" data-bs-toggle="collapse" href={`#distance${index}`} role="button" aria-expanded={show} aria-controls={`distance${index}`}>{distance}</a>
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
                                    return TimeResultsTable(distance, state.results[distance], index, show)
                                } else {
                                    return ResultsTable(distance, state.results[distance], index, show)
                                }
                            })
                        }
                    </div>
                </div>
                }
                { distances.length === 0 &&
                <div class="container-lg lg-max-width">
                    <div class="text-center">
                        <h2>No results to display.</h2>
                    </div>
                </div>
                }
            </div>
        )
    }
}

export default Results;