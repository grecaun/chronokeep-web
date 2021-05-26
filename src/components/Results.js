import React, { Component } from 'react';

class Results extends Component {
    constructor(props) {
        super(props);
        this.state = {
            slug: props.match.params.slug,
            year: props.match.params.year
        }
    }

    componentDidMount() {
    }

    render() {
        const state = this.state
        console.log("slug: " + state.slug + " -- year: " + state.year)
        return (
            <div>
                <h2>Results</h2>
            </div>
        )
    }
}

export default Results;