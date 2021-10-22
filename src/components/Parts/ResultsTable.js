import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import FormatTime from './FormatTime';

class ResultsTable extends Component {
    constructor(props) {
        super(props);

        this.state = {
            distance: props.distance,
            results: props.results,
            info: props.info,
            showTitle: props.showTitle,
        }
    }

    render() {
        const results = this.state.results;
        const distance = this.state.distance;
        const info = this.state.info;
        const showTitle = this.state.showTitle;
        const sorted = results.sort((a, b) => {
            // sorting by type first (again, this was a problem with the program not the website)
            if ((a.type !== 0 || b.type !== 0) && a.type !== b.type) {
                return a.type - b.type
            }
            // otherwise sort by occurrence then type then ranking
            if (a.occurence !== b.occurence) {
                return b.occurence - a.occurence
            }
            return a.ranking - b.ranking
        })
        return (
            <div className="table-responsive-sm m-3" key={distance} id={distance}>
                <table className="table table-sm">
                    <thead>
                        { showTitle &&
                        <tr>
                            <th className="table-distance-header text-important text-center" colSpan="10">{distance}</th>
                        </tr>
                        }
                        <tr>
                            <th className="overflow-hidden-sm col-md text-center">Bib</th>
                            <th className="col-sm text-center">Place</th>
                            <th className="col-xl">Name</th>
                            <th className="overflow-hidden-lg col-sm text-center">Age</th>
                            <th className="overflow-hidden-lg col-sm text-center">Pl</th>
                            <th className="overflow-hidden-lg col-sm text-center">Gender</th>
                            <th className="overflow-hidden-lg col-sm text-center">Pl</th>
                            <th className="overflow-hidden-sm col-lg text-center">Gun Time</th>
                            <th className="col-lg text-center">Time</th>
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
                                // DNF
                                if (result.type === 3) {
                                    rankStr = arankStr = grankStr = ''
                                }
                                // Early start time
                                if (result.type === 1) {
                                    rankStr = `${rankStr}e`
                                }
                                // Unofficial time
                                if (result.Type === 2) {
                                    rankStr = `${rankStr}u`
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
                                        <td className="overflow-hidden-sm text-center">{FormatTime(result.seconds, result.milliseconds, result)}</td>
                                        <td className="text-center">{FormatTime(result.chip_seconds, result.chip_milliseconds, result, true)}</td>
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

export default ResultsTable