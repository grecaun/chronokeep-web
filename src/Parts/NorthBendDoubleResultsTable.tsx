import { Component } from 'react';
import { SimpleFormatTime } from './FormatTime';
import { NorthBendDoubleResultsTableProps} from '../Interfaces/props';

class NorthBendDoubleResultsTable extends Component<NorthBendDoubleResultsTableProps> {
    render() {
        const sorted = this.props.results;
        //const search = this.props.search;
        return (
            <div className="table-responsive-sm m-3">
                <table className="table table-sm">
                    <thead>
                        <tr>
                            <th className="col-sm text-center">Pl</th>
                            <th className="col-lg">Name</th>
                            <th className="col-sm text-center">Gender</th>
                            <th className="col-md text-center">Age Grp</th>
                            <th className="col-lg text-center">Time</th>
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
                                if (result.gender === "WO" || result.gender === "W") {
                                    result.gender = "W"
                                }
                                if (result.gender === "FE" || result.gender === "F") {
                                    result.gender = "F"
                                }
                                if (result.gender === "M" || result.gender === "MA") {
                                    result.gender = "M"
                                }
                                return (
                                    <tr key={`${result.first}-${result.last}`}>
                                        <td className="text-center">{rankStr}</td>
                                        <td>{`${result.first} ${result.last}`}</td>
                                        <td className="text-center">{grankStr.length > 0 ? `${grankStr} ${result.gender}` : grankStr}</td>
                                        <td className="text-center">{arankStr.length > 0 ? `${arankStr} ${result.gender} ${result.age_group}` : arankStr}</td>
                                        <td className="text-center">{SimpleFormatTime(result.seconds, result.milliseconds)}</td>
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

export default NorthBendDoubleResultsTable