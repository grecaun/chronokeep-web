import { Component } from 'react';
import { Link } from 'react-router-dom';
import FormatTime from './FormatTime';
import { TimeResult } from '../Interfaces/types';
import { ResultsTableProps } from '../Interfaces/props';

class BackyardResultsTable extends Component<ResultsTableProps> {

    render() {
        let results = this.props.results;
        const distance = this.props.distance;
        const info = this.props.info;
        const showTitle = this.props.showTitle;
        const search = this.props.search;
        var sort_by = this.props.sort_by;
        const resMap: Map<string, TimeResult> = new Map();
        const rank_by_chip = this.props.rank_by_selected;
        var only_age_group = ""
        if (sort_by > 2) {
            sort_by = 1;
            const tmp = this.props.age_group_map.get(this.props.sort_by)
            if (tmp != undefined) {
                only_age_group = tmp
            }
        }
        results.forEach(res => {
            if (resMap.has(res.bib)) {
                // if res comes later than current value, replace current value
                if (resMap.get(res.bib)!.seconds < res.seconds) {
                    resMap.set(res.bib, res)
                }
            } else {
                resMap.set(res.bib, res)
            }
        })
        results = Array.from(resMap.values())
        const dispResults = new Array<TimeResult>()
        results.forEach(res => {
            const name = `${res.first.toLocaleLowerCase()} ${res.last.toLocaleLowerCase()}`
            const bib = `${res.bib}`
            if ((name.indexOf(search) >= 0 || bib === search || search === "") && (only_age_group.length < 1 || res.age_group === only_age_group)) {
                dispResults.push(res);
            }
        })
        const sorted = dispResults.sort((a: TimeResult, b: TimeResult) => {
            switch (sort_by) {
                case 1:
                    if (a.gender != b.gender) {
                        return a.gender.localeCompare(b.gender)
                    }
                    break;
                case 2:
                    if (a.gender != b.gender) {
                        return a.gender.localeCompare(b.gender)
                    }
                    if (a.age_group != b.age_group) {
                        const a_start = Number(a.age_group.split('-')[0]) || 0
                        const b_start = Number(b.age_group.split('-')[0]) || 1
                        return a_start - b_start;
                    }
                    break;
            }
            // sort all DNF and DNS to the bottom
            if (a.type === 3 || a.type >= 30 || b.type === 3 || b.type >= 30) {
                return a.type - b.type;
            }
            // propogate finish times to the top of the list
            if (a.finish && !b.finish) {
                return -1;
            }
            if (!a.finish && b.finish) {
                return 1;
            }
            // if both values are set to the same ranking (start times with -1 or 0 set essentially)
            // sort by gun time given
            if (a.ranking === b.ranking) {
                // the other case here is that one runner passed another
                if (a.occurence != b.occurence) {
                    // sort high to low (instead of low to high for times and ranks)
                    return b.occurence - a.occurence;
                }
                if (a.seconds === b.seconds) {
                    return a.milliseconds - b.milliseconds;
                }
                return a.seconds - b.seconds;
            }
            // finally sort by ranking
            return a.ranking - b.ranking
        })
        const chip_time = rank_by_chip ? "Cumulative*" : "Elapsed*";
        const clock_time = rank_by_chip ? "Elapsed" : "Cumulative";
        return (
            <div className="table-responsive-sm m-3" key={distance} id={distance}>
                <table className="table table-sm">
                    <thead>
                        {showTitle &&
                            <tr>
                                <td className="table-distance-header text-important text-center" colSpan={10}>{distance}
                                    { this.props.certification !== undefined &&
                                    <div className='chronokeep-certification'>Course Certification: {this.props.certification}</div>
                                    }
                                </td>
                            </tr>
                        }
                        <tr>
                            <th className="overflow-hidden-sm col-md text-center">Bib</th>
                            <th className="col-sm text-center">Place</th>
                            <th className="col-lg">Name</th>
                            <th className="overflow-hidden-lg col-sm text-center">Age</th>
                            <th className="overflow-hidden-lg col-sm text-center">Pl</th>
                            <th className="overflow-hidden-lg col-sm text-center">Gender</th>
                            <th className="overflow-hidden-lg col-sm text-center">Pl</th>
                            <th className="overflow-hidden-lg col-sm text-center"><a href="#disclaimer" className="nav-link m-0 p-0">{chip_time}</a></th>
                            <th className="col-lg text-center">{clock_time}</th>
                            <th className="col-lg text-center"></th>
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
                                    arankStr = "";
                                }
                                // If not a finish time
                                if (result.finish !== true) {
                                    rankStr = arankStr = grankStr = ""
                                }
                                if (result.ranking < 1) {
                                    rankStr = arankStr = grankStr = "";
                                }
                                let segName = result.segment;
                                if (segName === "Finish") {
                                    segName = "Hour " + Math.floor((result.occurence/ 2) + 1);
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
                                            <td className="overflow-hidden-lg text-center">{result.age > 0 && result.age < 130 ? result.age : ""}</td>
                                            <td className="overflow-hidden-lg text-center">{arankStr}</td>
                                            <td className="overflow-hidden-lg text-center">{result.gender}</td>
                                            <td className="overflow-hidden-lg text-center">{grankStr}</td>
                                            <td className="overflow-hidden-lg text-center">{
                                                !rank_by_chip ? FormatTime(result.seconds, result.milliseconds, result, true) : FormatTime(result.chip_seconds, result.chip_milliseconds, result)
                                            }</td>
                                            <td className="text-center">{
                                                !rank_by_chip ? FormatTime(result.chip_seconds, result.chip_milliseconds, result) : FormatTime(result.seconds, result.milliseconds, result, true)
                                            }</td>
                                            <td className="text-center">{segName}</td>
                                        </tr>
                                    );
                                }
                                return (
                                    <tr key={result.bib}>
                                        <td className="overflow-hidden-sm text-center">{result.bib}</td>
                                        <td className="text-center">{rankStr}</td>
                                        <td><Link to={`/results/${info.slug}/${info.year}/${result.bib}`} className="nav-link m-0 p-0">{`${result.first} ${result.last}`}</Link></td>
                                        <td className="overflow-hidden-lg text-center">{result.age > 0 && result.age < 130 ? result.age : ""}</td>
                                        <td className="overflow-hidden-lg text-center">{arankStr}</td>
                                        <td className="overflow-hidden-lg text-center">{result.gender}</td>
                                        <td className="overflow-hidden-lg text-center">{grankStr}</td>
                                        <td className="overflow-hidden-lg text-center">{
                                            !rank_by_chip ? FormatTime(result.seconds, result.milliseconds, result, true) : FormatTime(result.chip_seconds, result.chip_milliseconds, result)
                                        }</td>
                                        <td className="text-center">{
                                            !rank_by_chip ? FormatTime(result.chip_seconds, result.chip_milliseconds, result) : FormatTime(result.seconds, result.milliseconds, result, true)
                                        }</td>
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

export default BackyardResultsTable