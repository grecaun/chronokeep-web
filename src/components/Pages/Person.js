import { Component } from 'react';

class Person extends Component {
    constructor(props) {
        super(props);
        this.state = {
            slug: props.match.params.slug,
            year: props.match.params.year,
            bib: props.match.params.bib,
            person: null
        }
    }

    componentDidMount() {
        const BASE_URL = process.env.REACT_APP_BASE_URL;
        fetch(BASE_URL + '/api/results/bib')
        .then(res => res.json())
        .then(json => json.events)
        .then(events => {this.setState({

        })})
    }

}

export default Person;