import React, { Component } from 'react';
import ResultsTable from '../Parts/ResultsTable'
import TimeResultsTable from '../Parts/TimeResultsTable'

class Results extends Component {
    constructor(props) {
        super(props);
        const query = new URLSearchParams(this.props.location.search);
        const dist = query.get('dist')
        console.log("Distance specified: " + dist)
        this.state = {
            loading: true,
            slug: props.match.params.slug,
            year: props.match.params.year,
            dist: dist
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
        console.log("slug: " + state.slug + " -- year: " + state.year)
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
        return (
            <div>
                <div class="card center mx-auto results-container">
                    <p class="text-important results-header">{`${state.year.year} ${state.event.name} Results`}</p>
                    <p class="text-important results-date">{date}</p>
                </div>
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
                                    <li class="nav-item">
                                        <a class="nav-link active text-important text-h1" data-bs-toggle="collapse" href={"#distance" + index} role="button" aria-expanded={show} aria-controls={"distance" + index}>{distance}</a>
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
            </div>
        )
    }
}

export default Results;