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
                <table className="table table-sm">
                    <thead>
                        <tr>
                            <td className="table-distance-header text-important text-center" colSpan="10">{distance}</td>
                        </tr>
                        <tr>
                            <th className="overflow-hidden-sm col-md text-center">Bib</th>
                            <th className="col-sm text-center">Place</th>
                            <th className="col-lg">Name</th>
                            <th className="overflow-hidden-lg col-sm text-center">Age</th>
                            <th className="overflow-hidden-lg col-sm text-center">Pl</th>
                            <th className="overflow-hidden-lg col-sm text-center">Gender</th>
                            <th className="overflow-hidden-lg col-sm text-center">Pl</th>
                            <th className="col-lg text-center">Time</th>
                            <th className="col-lg text-center"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            sorted.map(result => {
                                // Use variables for displaying rank strings so we can hide if not a finish time
                                var rankStr = result.ranking
                                var arankStr = result.age_ranking
                                var grankStr = result.gender_ranking
                                // If not a finish time
                                if (result.finish !== true) {
                                    rankStr = arankStr = grankStr = ''
                                }
                                var segName = result.segment;
                                if (segName === "Finish") {
                                    segName = "Lap " + result.occurence;
                                }
                                if (result.gender === "U" || result.gender === "u" || result.gender === "O" || result.gender === "o") {
                                    arankStr = grankStr = ""
                                    result.gender = ""
                                }
                                return (
                                    <tr key={result.bib}>
                                        <td className="overflow-hidden-sm text-center">{result.bib}</td>
                                        <td className="text-center">{rankStr}</td>
                                        <td><Link to={`/results/${info.slug}/${info.year}/${result.bib}`} className="nav-link m-0 p-0">{`${result.first} ${result.last}`}</Link></td>
                                        <td className="overflow-hidden-lg text-center">{result.age}</td>
                                        <td className="overflow-hidden-lg text-center">{arankStr}</td>
                                        <td className="overflow-hidden-lg text-center">{result.gender}</td>
                                        <td className="overflow-hidden-lg text-center">{grankStr}</td>
                                        <td className="text-center">{FormatTime(result.seconds, result.milliseconds, result)}</td>
                                        <td className="text-center">{segName}</td>
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