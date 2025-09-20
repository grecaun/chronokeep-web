import { Component } from 'react';
import { FormatPace } from './FormatTime';
import { SeriesResultsTableProps } from '../Interfaces/props';
import { SeriesResult } from '../Interfaces/types';

class SeriesResultsTable extends Component<SeriesResultsTableProps> {
    render() {
        const results = this.props.results;
        const distances = this.props.distances;
        const name = this.props.name;
        const key = name.toLocaleLowerCase().replace(' ', '-')
        const showTitle = this.props.show_title;
        //const search = this.props.search;
        const eventCount = distances.length
        const sorted: SeriesResult[] = results.sort((a,b) => {
            if (a.ranking === b.ranking) {
                if (a.last.toLocaleLowerCase() === b.last.toLocaleLowerCase()) {
                    return a.first.localeCompare(b.first)
                }
                return a.last.localeCompare(b.last)
            }
            if (a.ranking === 0) {
                return 1
            }
            if (b.ranking === 0) {
                return -1
            }
            return a.ranking - b.ranking
        })
        return (
            <div className="table-responsive-sm m-3" key={key} id={key}>
                <table className="table table-sm">
                    <thead>
                        { showTitle &&
                        <tr>
                            <th className="table-distance-header text-important text-center" colSpan={6 + (4 * eventCount)}>{name}</th>
                        </tr>
                        }
                        <tr>
                            <th className="col-sm text-center">Pl</th>
                            <th className="col-sm text-center">Pts</th>
                            <th className="col-md text-center">Pace</th>
                            <th className="col-lg">Name</th>
                            <th className="overflow-hidden-sm col-sm text-center">Gender</th>
                            <th className="overflow-hidden-sm col-md text-center">Age Grp</th>
                            { distances && distances.map(distance => {
                                var splitDist = distance.split(' ')
                                var dist = distance
                                if (splitDist.length > 2) {
                                    dist = `${splitDist[1]} ${splitDist[2]}`
                                } else if (splitDist.length > 1) {
                                    dist = splitDist[1]
                                }
                                return (
                                    <th className="overflow-hidden-lg col-lg text-center" key={dist}>{dist}</th>
                                )
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {
                            sorted.map(result => {
                                // Use variables for displaying rank strings so we can hide if not a finish time
                                let rankStr = result.ranking.toString()
                                let arankStr = result.age_ranking.toString()
                                if (result.age_ranking < 1) {
                                    arankStr = "";
                                }
                                let grankStr = result.gender_ranking.toString()
                                if (result.gender_ranking < 1) {
                                    grankStr = "";
                                }
                                // If ranking is set to -1, or it is a start time then ignore output
                                // otherwise display the current ranking for that value
                                if (result.ranking < 1) {
                                    rankStr = arankStr = grankStr = ""
                                }
                                // Modify the gender field. 
                                // Make string into the upper case string for easier checks.
                                result.gender = result.gender.toLocaleUpperCase();
                                // Check for NB or NS before consolidating down to 2 characters.
                                if (result.gender === "NON-BINARY" || result.gender === "NON BINARY" || result.gender === "NONBINARY") {
                                    result.gender = "X"
                                }
                                if (result.gender === "NOT SPECIFIED") {
                                    arankStr = grankStr = ""
                                    result.gender = ""
                                }
                                // We only want the first two characters for display here.
                                result.gender = result.gender.substring(0,2)
                                if (result.gender === "U" || result.gender === "O" || result.gender === "UN" || result.gender === "OT" || result.gender === "NS") {
                                    arankStr = grankStr = ""
                                    result.gender = ""
                                }
                                if (result.gender === "F" || result.gender === "WO" || result.gender === "W") {
                                    result.gender = "W"
                                }
                                if (result.gender === "M" || result.gender === "MA") {
                                    result.gender = "M"
                                }
                                return (
                                    <tr key={`${result.first}-${result.last}`}>
                                        <td className="text-center">{rankStr}</td>
                                        <td className="text-center">{result.series_points}</td>
                                        <td className="text-center">{`${FormatPace(result.average_pace)}/${result.pace_type}`}</td>
                                        <td>{`${result.first} ${result.last}`}</td>
                                        <td className="overflow-hidden-sm text-center">{grankStr.length > 0 ? `${grankStr} ${result.gender}` : grankStr}</td>
                                        <td className="overflow-hidden-sm text-center">{arankStr.length > 0 ? `${arankStr} ${result.gender} ${result.age_group}` : arankStr}</td>
                                        { distances && distances.map(distance => {
                                            var visibleStr = ''
                                            if (result.results.has(distance)) {
                                                const res = result.results.get(distance)!
                                                visibleStr = `${res.ranking} - ${FormatPace(res.division_ranking)}/${res.division}`
                                            }
                                            return (
                                                <td className="overflow-hidden-lg text-center" key={`${result.first}-${result.last}-${distance}`}>{visibleStr}</td>
                                            )
                                        })}
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

export default SeriesResultsTable