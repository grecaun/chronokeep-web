import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import FormatTime from './FormatTime';

class TimeResultsTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            distance: props.distance,
            results: props.results,
            index: props.index,
            info: props.info,
            show: props.show,
        }
    }

    render() {
        const results = this.state.results;
        const distance = this.state.distance;
        const info = this.state.info;
        const sorted = results.sort((a, b) => {
            return a.ranking - b.ranking
        })
        return (
            <div className="table-responsive-sm m-3" key={distance} id={distance}>
                <table class="table table-sm">
                    <thead>
                        <tr>
                            <td class="table-distance-header text-important text-center" colSpan="10">{distance}</td>
                        </tr>
                        <tr>
                            <th class="overflow-hidden-sm col-md text-center">Bib</th>
                            <th class="col-sm text-center">Place</th>
                            <th class="col-lg">Name</th>
                            <th class="overflow-hidden-lg col-sm text-center">Age</th>
                            <th class="overflow-hidden-lg col-sm text-center">Pl</th>
                            <th class="overflow-hidden-lg col-sm text-center">Gender</th>
                            <th class="overflow-hidden-lg col-sm text-center">Pl</th>
                            <th class="col-lg text-center">Time</th>
                            <th class="col-lg text-center"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            sorted.map(result => {
                                return (
                                    <tr key={result.bib}>
                                        <td class="overflow-hidden-sm text-center">{result.bib}</td>
                                        <td class="text-center">{result.ranking}</td>
                                        <td><Link to={`/results/${info.slug}/${info.year}/${result.bib}`} className="nav-link m-0 p-0">{`${result.first} ${result.last}`}</Link></td>
                                        <td class="overflow-hidden-lg text-center">{result.age}</td>
                                        <td class="overflow-hidden-lg text-center">{result.age_ranking}</td>
                                        <td class="overflow-hidden-lg text-center">{result.gender}</td>
                                        <td class="overflow-hidden-lg text-center">{result.gender_ranking}</td>
                                        <td class="text-center">{FormatTime(result.seconds, result.milliseconds, result)}</td>
                                        <td class="text-center">{result.segment}</td>
                                    </tr>
                                );
                            })
                        }
                    </tbody>
                </table>
            </div>
        )
    }
}

export default TimeResultsTable