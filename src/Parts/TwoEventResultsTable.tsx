import { Component } from 'react';
import FormatTime from './FormatTime';
import { TwoEventResultsTableProps } from '../Interfaces/props';

class TwoEventResultsTable extends Component<TwoEventResultsTableProps> {
    render() {
        const sorted = this.props.sorted;
        const results = this.props.results;
        const distance1 = this.props.distance1;
        const distance2 = this.props.distance2;
        //const search = this.props.search;
        return (
            <div className="table-responsive-sm m-3">
                <table className="table table-sm">
                    <thead>
                        <tr>
                            <th className="col-sm text-center">Pl</th>
                            <th className="overflow-hidden-lg col-sm text-center">Pts</th>
                            <th className="col-lg">Name</th>
                            <th className="overflow-hidden-sm col-sm text-center">Gender</th>
                            <th className="overflow-hidden-sm col-md text-center">Age Grp</th>
                            <th className="col-lg text-center" >{distance1}</th>
                            <th className="col-lg text-center" >{distance2}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            sorted.map((name, index) => {
                                // Use variables for displaying rank strings so we can hide if not a finish time
                                const result1 = results.get(name)![distance1];
                                const result2 = results.get(name)![distance2];
                                const rankStr = (result1.ranking + result2.ranking).toString();
                                // Modify the gender field. 
                                // Make string into the upper case string for easier checks.
                                let gender = result1.gender.toLocaleUpperCase();
                                // Check for NB or NS before consolidating down to 2 characters.
                                if (gender === "NON-BINARY" || gender === "NON BINARY" || gender === "NONBINARY") {
                                    gender = "X"
                                }
                                if (gender === "NOT SPECIFIED") {
                                    gender = ""
                                }
                                // We only want the first two characters for display here.
                                gender = gender.substring(0,2)
                                if (gender === "U" || gender === "O" || gender === "UN" || gender === "OT" || gender === "NS") {
                                    gender = ""
                                }
                                if (gender === "F" || gender === "WO" || gender === "W") {
                                    gender = "W"
                                }
                                if (gender === "M" || gender === "MA") {
                                    gender = "M"
                                }
                                return (
                                    <tr key={`${result1.first}-${result1.last}`}>
                                        <td className="text-center">{index + 1}</td>
                                        <td className="overflow-hidden-lg text-center">{rankStr}</td>
                                        <td>{`${result1.first} ${result1.last}`}</td>
                                        <td className="overflow-hidden-sm text-center">{gender}</td>
                                        <td className="overflow-hidden-sm text-center">{result1.age_group}</td>
                                        <td className="text-center">{FormatTime(result1.seconds, result1.milliseconds, result1, false, true)}</td>
                                        <td className="text-center">{FormatTime(result2.seconds, result2.milliseconds, result2, false, true)}</td>
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

export default TwoEventResultsTable