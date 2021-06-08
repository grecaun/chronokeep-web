import React, { Component } from 'react';
import ResultsTable from '../Parts/ResultsTable'

class Results extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            slug: props.match.params.slug,
            year: props.match.params.year
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
                <div>
                    <h2>Results</h2>
                    <p>Loading...</p>
                </div>
            );
        }
        console.log(state.results)
        const distances = Object.keys(state.results)
        return (
            <div>
                <h2>Results</h2>
                <p>Count: {state.count}</p>
                <p>Event Name: {state.event.name}</p>
                <p>Year: {state.year.year}</p>
                <p>Date: {state.year.date_time}</p>
                {
                    distances.map(distance => {
                        return ResultsTable(distance, state.results[distance])
                    })
                }
            </div>
        )
    }
}

export default Results;