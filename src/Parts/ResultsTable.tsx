import { Component } from 'react';
import { Link } from 'react-router-dom';
import FormatTime from './FormatTime';
import { ResultsTableProps } from '../Interfaces/props';
import { TimeResult } from '../Interfaces/types';

class ResultsTable extends Component<ResultsTableProps> {
    render() {
        const results = this.props.results;
        const distance = this.props.distance;
        const info = this.props.info;
        const showTitle = this.props.showTitle;
        var resMap = new Map();
        results.forEach(res => {
            if (resMap.has(res.bib)) {
                var tmp = resMap.get(res.bib);
                // if res comes later than tmp, replace tmp
                if (tmp.seconds < res.seconds) {
                    resMap.set(res.bib, res)
                }
            } else {
                resMap.set(res.bib, res)
            }
        })
        var res: TimeResult[] = []
        resMap.forEach((value) => {
            res.push(value);
        })
        const sorted = res.sort((a, b) => {
            // sort all DNF and DNS to the bottom
            if (a.type === 3 || a.type >= 30 || b.type === 3 || b.type >= 30) {
                return a.type - b.type;
            }
            // sort by occurence, this will place everyone who's finished above those who haven't
            if (a.occurence !== b.occurence) {
                return b.occurence - a.occurence
            }
            // if both values are set to the same ranking (start times with -1 or 0 set essentially)
            // sort by gun time given
            if (a.ranking === b.ranking) {
                if (a.seconds === b.seconds) {
                    return a.milliseconds - b.milliseconds;
                }
                return a.seconds - b.seconds;
            }
            // finally sort by ranking
            return a.ranking - b.ranking
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
                            <th className="overflow-hidden-sm col-md text-center">Bib</th>
                            <th className="col-sm text-center">Place</th>
                            <th className="col-xl">Name</th>
                            <th className="overflow-hidden-lg col-sm text-center">Age</th>
                            <th className="overflow-hidden-lg col-sm text-center">Pl</th>
                            <th className="overflow-hidden-sm col-sm text-center">Gender</th>
                            <th className="overflow-hidden-sm col-sm text-center">Pl</th>
                            <th className="overflow-hidden-lg col-lg text-center"><a href="#disclaimer" className="nav-link m-0 p-0">Chip Time*</a></th>
                            <th className="col-lg text-center">Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            sorted.map(result => {
                                // Use variables for displaying rank strings so we can hide if not a finish time
                                var rankStr = result.ranking.toString()
                                var arankStr = result.age_ranking.toString()
                                var grankStr = result.gender_ranking.toString()
                                // If ranking is set to -1, or it is a start time then ignore output
                                // otherwise display the current ranking for that value
                                if (result.ranking < 1 || result.occurence === 0) {
                                    rankStr = arankStr = grankStr = ''
                                }
                                // DNF - DNF - DNS
                                if (result.type === 3 || result.type === 30 || result.type === 31) {
                                    rankStr = arankStr = grankStr = ''
                                }
                                // Early start time
                                if (result.type === 1 || result.type === 11) {
                                    rankStr = `${rankStr}e`
                                }
                                // Unofficial time
                                if (result.type === 2 || result.type === 12) {
                                    rankStr = `${rankStr}u`
                                }
                                // Virtual
                                if (result.type === 13) {
                                    rankStr = `${rankStr}v`
                                }
                                // Late time
                                if (result.type === 14) {
                                    rankStr = `${rankStr}l`
                                }
                                // Modify the gender field. 
                                // Make string into the upper case string for easier checks.
                                result.gender = result.gender.toLocaleUpperCase();
                                // Check for NB or NS before consolidating down to 2 characters.
                                if (result.gender === "NON-BINARY" || result.gender === "NON BINARY" || result.gender === "NONBINARY") {
                                    result.gender = "NB"
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
                                if (result.gender === "F" || result.gender === "WO") {
                                    result.gender = "W"
                                }
                                if (result.gender === "M" || result.gender === "MA") {
                                    result.gender = "M"
                                }
                                if (result.anonymous === true) {
                                    return (
                                        <tr key={result.bib}>
                                            <td className="overflow-hidden-sm text-center">{result.bib}</td>
                                            <td className="text-center">{rankStr}</td>
                                            <td><Link to={`/results/${info.slug}/${info.year}/${result.bib}`} className="nav-link m-0 p-0">{`Bib ${result.bib}`}</Link></td>
                                            <td className="overflow-hidden-lg text-center">{result.age}</td>
                                            <td className="overflow-hidden-lg text-center">{arankStr}</td>
                                            <td className="overflow-hidden-sm text-center">{result.gender}</td>
                                            <td className="overflow-hidden-sm text-center">{grankStr}</td>
                                            <td className="overflow-hidden-lg text-center">{FormatTime(result.chip_seconds, result.chip_milliseconds, result)}</td>
                                            <td className="text-center">{FormatTime(result.seconds, result.milliseconds, result, true)}</td>
                                        </tr>
                                    );
                                }
                                return (
                                    <tr key={result.bib}>
                                        <td className="overflow-hidden-sm text-center">{result.bib}</td>
                                        <td className="text-center">{rankStr}</td>
                                        <td><Link to={`/results/${info.slug}/${info.year}/${result.bib}`} className="nav-link m-0 p-0">{`${result.first} ${result.last}`}</Link></td>
                                        <td className="overflow-hidden-lg text-center">{result.age}</td>
                                        <td className="overflow-hidden-lg text-center">{arankStr}</td>
                                        <td className="overflow-hidden-sm text-center">{result.gender}</td>
                                        <td className="overflow-hidden-sm text-center">{grankStr}</td>
                                        <td className="overflow-hidden-lg text-center">{FormatTime(result.chip_seconds, result.chip_milliseconds, result)}</td>
                                        <td className="text-center">{FormatTime(result.seconds, result.milliseconds, result, true)}</td>
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