import { Component } from 'react';
import FormatTime from './FormatTime';
import { TimeResult } from '../Interfaces/types';
import { PNTFTableProps } from '../Interfaces/props';

class PNTFResultsTable extends Component<PNTFTableProps> {
    render() {
        let results = this.props.results;
        const distance = this.props.distance;
        const showTitle = this.props.showTitle;
        let genderResults: { [index: string]: TimeResult[] } = {}
        results.map(result => {
            result.gender = result.gender.toLocaleUpperCase();
            result.gender = result.gender.substring(0,2)
            if (result.gender === "F" || result.gender === "WO" || result.gender === "W") {
                result.gender = "W"
            } else if (result.gender === "M" || result.gender === "MA") {
                result.gender = "M"
            } else {
                result.gender = "X"
            }
            if (genderResults[result.gender] === undefined) {
                genderResults[result.gender] = []
            }
            genderResults[result.gender].push(result)
        })
        return (
            <div className="table-responsive-sm m-3" key={distance} id={distance}>
                <table className="table table-sm">
                    <thead>
                        { showTitle &&
                        <tr>
                            <th className="table-distance-header text-important text-center" colSpan={10}>{distance}</th>
                        </tr>
                        }
                        <tr>
                            <th className="col-sm text-center">Place</th>
                            <th className="col-sm text-center">Masters</th>
                            <th className="col-lg">Name</th>
                            <th className="overflow-hidden-lg col-sm text-center">Bib</th>
                            <th className="overflow-hidden-sm col-sm text-center">Age</th>
                            <th className="overflow-hidden-sm col-md text-center"><a href="#disclaimer" className="nav-link m-0 p-0">Chip Time*</a></th>
                            <th className="col-md text-center">Clock Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        { genderResults["W"] && genderResults["W"].length &&
                            <tr>
                                <th className='col-xl text-important text-center' colSpan={10}>Women</th>
                            </tr>
                        }
                        { genderResults["W"] && genderResults["W"].length &&
                            genderResults["W"].map(result => {
                                // Use variables for displaying rank strings so we can hide if not a finish time
                                let rankStr = result.gender_ranking.toString()
                                let arankStr = result.age_ranking.toString()
                                if (result.age_ranking < 1) {
                                    arankStr = "";
                                }
                                // If ranking is set to -1, or it is a start time then ignore output
                                // otherwise display the current ranking for that value
                                if (result.ranking < 1 || result.occurence === 0) {
                                    rankStr = arankStr = ""
                                }
                                // DNF - DNF - DNS
                                if (result.type === 3 || result.type === 30 || result.type === 31) {
                                    rankStr = arankStr = ""
                                }
                                if (result.age_group === "Open" || result.age_group === "Youth") {
                                    arankStr = "";
                                }
                                if (result.anonymous === true) {
                                    return (
                                        <tr key={result.bib}>
                                            <td className="text-center">{rankStr}</td>
                                            <td className="text-center">{arankStr}</td>
                                            <td>{`Bib ${result.bib}`}</td>
                                            <td className="overflow-hidden-lg text-center">{result.bib}</td>
                                            <td className="overflow-hidden-sm text-center">{result.age > 0 && result.age < 130 ? result.age : ""}</td>
                                            <td className="overflow-hidden-sm text-center">{
                                                FormatTime(result.chip_seconds, result.chip_milliseconds, result)
                                            }</td>
                                            <td className="text-center">{
                                                FormatTime(result.seconds, result.milliseconds, result, true)
                                            }</td>
                                        </tr>
                                    );
                                }
                                return (
                                    <tr key={result.bib}>
                                        <td className="text-center">{rankStr}</td>
                                        <td className="text-center">{arankStr}</td>
                                        <td>{`${result.first} ${result.last}`}</td>
                                        <td className="overflow-hidden-lg text-center">{result.bib}</td>
                                        <td className="overflow-hidden-sm text-center">{result.age > 0 && result.age < 130 ? result.age : ""}</td>
                                        <td className="overflow-hidden-sm text-center">{
                                            FormatTime(result.chip_seconds, result.chip_milliseconds, result)
                                        }</td>
                                        <td className="text-center">{
                                            FormatTime(result.seconds, result.milliseconds, result, true)
                                        }</td>
                                    </tr>
                                );
                            })
                        }
                        { genderResults["M"] && genderResults["M"].length > 0 &&
                            <tr>
                                <th className='col-xl text-important text-center' colSpan={10}>Men</th>
                            </tr>
                        }
                        { genderResults["M"] && genderResults["M"].length &&
                            genderResults["M"].map(result => {
                                // Use variables for displaying rank strings so we can hide if not a finish time
                                let rankStr = result.gender_ranking.toString()
                                let arankStr = result.age_ranking.toString()
                                if (result.age_ranking < 1) {
                                    arankStr = "";
                                }
                                // If ranking is set to -1, or it is a start time then ignore output
                                // otherwise display the current ranking for that value
                                if (result.ranking < 1 || result.occurence === 0) {
                                    rankStr = arankStr = ""
                                }
                                // DNF - DNF - DNS
                                if (result.type === 3 || result.type === 30 || result.type === 31) {
                                    rankStr = arankStr = ""
                                }
                                if (result.age_group === "Open" || result.age_group === "Youth") {
                                    arankStr = "";
                                }
                                if (result.anonymous === true) {
                                    return (
                                        <tr key={result.bib}>
                                            <td className="text-center">{rankStr}</td>
                                            <td className="text-center">{arankStr}</td>
                                            <td>{`Bib ${result.bib}`}</td>
                                            <td className="overflow-hidden-lg text-center">{result.bib}</td>
                                            <td className="overflow-hidden-sm text-center">{result.age > 0 && result.age < 130 ? result.age : ""}</td>
                                            <td className="overflow-hidden-sm text-center">{
                                                FormatTime(result.chip_seconds, result.chip_milliseconds, result)
                                            }</td>
                                            <td className="text-center">{
                                                FormatTime(result.seconds, result.milliseconds, result, true)
                                            }</td>
                                        </tr>
                                    );
                                }
                                return (
                                    <tr key={result.bib}>
                                        <td className="text-center">{rankStr}</td>
                                        <td className="text-center">{arankStr}</td>
                                        <td>{`${result.first} ${result.last}`}</td>
                                        <td className="overflow-hidden-lg text-center">{result.bib}</td>
                                        <td className="overflow-hidden-sm text-center">{result.age > 0 && result.age < 130 ? result.age : ""}</td>
                                        <td className="overflow-hidden-sm text-center">{
                                            FormatTime(result.chip_seconds, result.chip_milliseconds, result)
                                        }</td>
                                        <td className="text-center">{
                                            FormatTime(result.seconds, result.milliseconds, result, true)
                                        }</td>
                                    </tr>
                                );
                            })
                        }
                        { genderResults["X"] && genderResults["X"].length &&
                            <tr>
                                <th className='col-xl text-important text-center' colSpan={10}>Non-Binary</th>
                            </tr>
                        }
                        { genderResults["X"] && genderResults["X"].length &&
                            genderResults["X"].map(result => {
                                // Use variables for displaying rank strings so we can hide if not a finish time
                                let rankStr = result.gender_ranking.toString()
                                let arankStr = result.age_ranking.toString()
                                if (result.age_ranking < 1) {
                                    arankStr = "";
                                }
                                // If ranking is set to -1, or it is a start time then ignore output
                                // otherwise display the current ranking for that value
                                if (result.ranking < 1 || result.occurence === 0) {
                                    rankStr = arankStr = ""
                                }
                                // DNF - DNF - DNS
                                if (result.type === 3 || result.type === 30 || result.type === 31) {
                                    rankStr = arankStr = ""
                                }
                                if (result.age_group === "Open" || result.age_group === "Youth") {
                                    arankStr = "";
                                }
                                if (result.anonymous === true) {
                                    return (
                                        <tr key={result.bib}>
                                            <td className="text-center">{rankStr}</td>
                                            <td className="text-center">{arankStr}</td>
                                            <td>{`Bib ${result.bib}`}</td>
                                            <td className="overflow-hidden-lg text-center">{result.bib}</td>
                                            <td className="overflow-hidden-sm text-center">{result.age > 0 && result.age < 130 ? result.age : ""}</td>
                                            <td className="overflow-hidden-sm text-center">{
                                                FormatTime(result.chip_seconds, result.chip_milliseconds, result)
                                            }</td>
                                            <td className="text-center">{
                                                FormatTime(result.seconds, result.milliseconds, result, true)
                                            }</td>
                                        </tr>
                                    );
                                }
                                return (
                                    <tr key={result.bib}>
                                        <td className="text-center">{rankStr}</td>
                                        <td className="text-center">{arankStr}</td>
                                        <td>{`${result.first} ${result.last}`}</td>
                                        <td className="overflow-hidden-lg text-center">{result.bib}</td>
                                        <td className="overflow-hidden-sm text-center">{result.age > 0 && result.age < 130 ? result.age : ""}</td>
                                        <td className="overflow-hidden-sm text-center">{
                                            FormatTime(result.chip_seconds, result.chip_milliseconds, result)
                                        }</td>
                                        <td className="text-center">{
                                            FormatTime(result.seconds, result.milliseconds, result, true)
                                        }</td>
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

export default PNTFResultsTable