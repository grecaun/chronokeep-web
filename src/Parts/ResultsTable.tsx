import { Component } from 'react';
import { Link } from 'react-router-dom';
import FormatTime from './FormatTime';
import { ResultsTableProps } from '../Interfaces/props';
import { TimeResult } from '../Interfaces/types';

class ResultsTable extends Component<ResultsTableProps> {
    render() {
        let results = this.props.results;
        const distance = this.props.distance;
        const info = this.props.info;
        const showTitle = this.props.show_title;
        const search = this.props.search;
        let sort_by = this.props.sort_by;
        const resMap: Map<string, TimeResult> = new Map();
        const segMap = this.props.segment_map;
        const rank_by_chip = this.props.rank_by_selected;
        let only_age_group = ""
        if (sort_by > 2) {
            sort_by = 1;
            const tmp = this.props.age_group_map.get(this.props.sort_by)
            if (tmp != undefined) {
                only_age_group = tmp
            }
        }
        let one_time = true;
        let disp_age = false;
        let disp_gend = false;
        results.forEach(res => {
            if (res.seconds != res.chip_seconds || res.milliseconds != res.chip_milliseconds) {
                one_time = false;
            }
            if (res.gender.trim().length > 1 && res.gender !== "Not Specified") {
                disp_gend = true;
            }
            if (res.age > 0 && res.age < 100) {
                disp_age = true;
            }
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
        const sorted = dispResults.sort((a, b) => {
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
            const aSeg = a.segment.trim();
            const bSeg = b.segment.trim();
            // propogate start times below other results (but not below DNS/DNF)
            if (aSeg === "Start" && bSeg !== "Start") {
                return 1;
            }
            if (aSeg !== "Start" && bSeg === "Start") {
                return -1;
            }
            // if segments are defined and they have numeric values then sort by that distance value
            if (segMap.has(aSeg) && segMap.has(bSeg)) {
                const aSegDist = segMap.get(aSeg)!.distance_value;
                const bSegDist = segMap.get(bSeg)!.distance_value;
                if (aSegDist > 0 || bSegDist > 0) {
                    return bSegDist - aSegDist;
                }
            }
            // If segments are not defined, try to find distance values by parsing the segment name provided.
            if (aSeg !== bSeg) {
                if (aSeg.startsWith("Mile") && bSeg.startsWith("Mile")) {
                    const aMile: number = +aSeg.substring(5);
                    const bMile: number = +bSeg.substring(5);
                    return bMile - aMile;
                }
                if (aSeg.startsWith("Kilometer") && bSeg.startsWith("Kilometer")) {
                    const aKilo: number = +aSeg.substring(10);
                    const bKilo: number = +bSeg.substring(10);
                    return bKilo - aKilo;
                }
            }
            // Workaround for the API not giving segments when giving results.
            if (a.ranking == b.ranking && aSeg !== "Start" && bSeg !== "Start") {
                // Rank later results at the same ranking as higher values.
                if (a.seconds == b.seconds) {
                    return b.milliseconds - a.milliseconds;
                }
                return b.seconds - a.seconds;
            }
            // sort by occurrence again! only if the location is the same this time though
            // the occurrence being higher doesn't always indicate that the runner is ahead of another runner
            // for example: A course is set for the runner to go A -> A -> B -> Finish.  With our current algorithm
            // the runner at point A will display above the runner at point B even though the runner at A is behind
            // the runner at B -- with this in mind it is most likely better to not sort by occurence.
            // if locations are the same and occurrences differ, it is safe to sort by occurrence
            if (a.location === b.location && a.occurence !== b.occurence) {
                return b.occurence - a.occurence;
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
        const chip_time = rank_by_chip ? "Clock Time*" : "Chip Time*";
        const clock_time = one_time ? "Time" : rank_by_chip ? "Chip Time" : "Clock Time";
        const chip_column = one_time ? "hidden" : "overflow-hidden-lg col-lg text-center";
        const age_column = disp_age ? "overflow-hidden-lg col-sm text-center" : "hidden";
        const age_pl_column = disp_age ? "overflow-hidden-lg col-sm text-center" : "hidden";
        const gend_column = disp_gend ? "overflow-hidden-sm col-sm text-center" : "hidden";
        const gend_pl_column = disp_gend ? "overflow-hidden-sm col-sm text-center" : "hidden";
        return (
            <div className="table-responsive-sm m-3" key={distance} id={distance}>
                <table className="table table-sm">
                    <thead>
                        { showTitle &&
                        <tr>
                            <th className="table-distance-header text-important text-center" colSpan={10}>{distance}
                                { this.props.certification !== undefined &&
                                    <div className='chronokeep-certification'>Course Certification: {this.props.certification}</div>
                                }
                            </th>
                        </tr>
                        }
                        <tr>
                            <th className="overflow-hidden-sm col-md text-center">Bib</th>
                            <th className="col-sm text-center">Place</th>
                            <th className="col-xl">Name</th>
                            <th className={age_column}>Age</th>
                            <th className={age_pl_column}>Pl</th>
                            <th className={gend_column}>Gender</th>
                            <th className={gend_pl_column}>Pl</th>
                            <th className={chip_column}><a href="#disclaimer" className="nav-link m-0 p-0">{chip_time}</a></th>
                            <th className="col-lg text-center">{clock_time}</th>
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
                                if (result.ranking < 1 || result.occurence === 0) {
                                    rankStr = arankStr = grankStr = ""
                                }
                                // DNF - DNF - DNS
                                if (result.type === 3 || result.type === 30 || result.type === 31) {
                                    rankStr = arankStr = grankStr = ""
                                }
                                // Drop
                                if (result.type === 10) {
                                    rankStr = `${rankStr}d`
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
                                    <tr key={result.bib}>
                                        <td className="overflow-hidden-sm text-center">{result.bib}</td>
                                        <td className="text-center">{rankStr}</td>
                                        <td><Link to={`/results/${info.slug}/${info.year}/${result.bib}`} className="nav-link m-0 p-0">{result.anonymous === true ? `Bib ${result.bib}` : `${result.first} ${result.last}`}</Link></td>
                                        <td className={age_column}>{result.age > 0 && result.age < 130 ? result.age : ""}</td>
                                        <td className={age_pl_column}>{arankStr}</td>
                                        <td className={gend_column}>{result.gender}</td>
                                        <td className={gend_pl_column}>{grankStr}</td>
                                        <td className={chip_column}>{
                                            rank_by_chip ? FormatTime(result.seconds, result.milliseconds, result, true) : FormatTime(result.chip_seconds, result.chip_milliseconds, result)
                                        }</td>
                                        <td className="text-center">{
                                            rank_by_chip ? FormatTime(result.chip_seconds, result.chip_milliseconds, result) : FormatTime(result.seconds, result.milliseconds, result, true)
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

export default ResultsTable