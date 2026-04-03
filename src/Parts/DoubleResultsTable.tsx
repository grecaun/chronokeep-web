import { Component } from 'react';
import { DoubleResultsTableProps } from '../Interfaces/props';
import { DoubleResult } from '../Interfaces/types';
import { the_double } from '../Pages/Results';
import { SimpleFormatTime } from './FormatTime';

class DoubleResultsTable extends Component<DoubleResultsTableProps> {
    render() {
        const results = this.props.results;
        const search = this.props.search;
        let sort_by = this.props.sort_by;
        const resMap: Map<string, DoubleResult> = new Map();
        const rank_by_chip = this.props.rank_by_selected;
        const distances = this.props.distances;
        let only_age_group = ""
        if (sort_by > 2) {
            sort_by = 1;
            const tmp = this.props.age_group_map.get(this.props.sort_by)
            if (tmp != undefined) {
                only_age_group = tmp
            }
        }
        if (distances.length < 2) {
            return;
        }
        // Create new DoubleResult variables for participants.
        results.forEach(res => {
            // The Double only cares about finish results.
            if (res.finish === true) {
                const name_key = `${res.first.toLocaleLowerCase()} ${res.last.toLocaleLowerCase()}`;
                let double_res: DoubleResult = {
                    first: res.first,
                    last: res.last,
                    seconds_one: 0,
                    milliseconds_one: 0,
                    chip_seconds_one: 0,
                    chip_milliseconds_one: 0,
                    seconds_two: 0,
                    milliseconds_two: 0,
                    chip_seconds_two: 0,
                    chip_milliseconds_two: 0,
                    gender: res.gender,
                    age_group: res.age_group,
                    age: res.age,
                    ranking: 0,
                    age_ranking: 0,
                    gender_ranking: 0,
                    anonymous: false,
                    distance_one: distances[0],
                    distance_two: distances[1]
                };
                // Pull known information.
                if (resMap.has(name_key)) {
                    double_res = resMap.get(name_key)!;
                }
                // Update distance seconds.
                if (res.distance === distances[0]) {
                    double_res.seconds_one = res.seconds;
                    double_res.milliseconds_one = res.milliseconds;
                    double_res.chip_seconds_one = res.chip_seconds;
                    double_res.chip_milliseconds_one = res.chip_milliseconds;
                } else if (res.distance === distances[1]) {
                    double_res.seconds_two = res.seconds;
                    double_res.milliseconds_two = res.milliseconds;
                    double_res.chip_seconds_two = res.chip_seconds;
                    double_res.chip_milliseconds_two = res.chip_milliseconds;
                }
                resMap.set(name_key, double_res);
            }
        })
        const doub_results = Array.from(resMap.values())
        const dispResults = new Array<DoubleResult>()
        // sort results
        doub_results.sort((a, b) => {
            if (rank_by_chip) {
                let a_seconds = a.chip_seconds_one + a.chip_seconds_two;
                let a_milliseconds = a.chip_milliseconds_one + a.chip_milliseconds_two;
                if (a_milliseconds > 1000) {
                    a_seconds += 1;
                    a_milliseconds -= 1000;
                }
                let b_seconds = b.chip_seconds_one + b.chip_seconds_two;
                let b_milliseconds = b.chip_milliseconds_one + b.chip_milliseconds_two;
                if (b_milliseconds > 1000) {
                    b_seconds += 1;
                    b_milliseconds -= 1000;
                }
                if (a_seconds === b_seconds) {
                    return a_milliseconds - b_milliseconds;
                }
                return a_seconds - b_seconds;
            } else {
                let a_seconds = a.seconds_one + a.seconds_two;
                let a_milliseconds = a.milliseconds_one + a.milliseconds_two;
                if (a_milliseconds > 1000) {
                    a_seconds += 1;
                    a_milliseconds -= 1000;
                }
                let b_seconds = b.seconds_one + b.seconds_two;
                let b_milliseconds = b.milliseconds_one + b.milliseconds_two;
                if (b_milliseconds > 1000) {
                    b_seconds += 1;
                    b_milliseconds -= 1000;
                }
                if (a_seconds === b_seconds) {
                    return a_milliseconds - b_milliseconds;
                }
                return a_seconds - b_seconds;
            }
        })
        // rank results
        let place = 0;
        const genderPlace: { [gend: string]: number } = {}
        const ageGroupPlace: { [age_group: string]: { [gend: string]: number } } = {}
        doub_results.forEach(res => {
            if (res.seconds_one > 0 && res.seconds_two > 0) {
                place += 1;
                res.ranking = place;
                if (genderPlace[res.gender] === undefined) {
                    genderPlace[res.gender] = 0;
                }
                genderPlace[res.gender] += 1;
                res.gender_ranking = genderPlace[res.gender];
                if (ageGroupPlace[res.age_group] === undefined) {
                    ageGroupPlace[res.age_group] = { };
                    ageGroupPlace[res.age_group][res.gender] = 0;
                } else if (ageGroupPlace[res.age_group][res.gender] === undefined) {
                    ageGroupPlace[res.age_group][res.gender] = 0;
                }
                ageGroupPlace[res.age_group][res.gender] += 1;
                res.age_ranking = ageGroupPlace[res.age_group][res.gender];
            }
        })
        doub_results.forEach(res => {
            const name = `${res.first.toLocaleLowerCase()} ${res.last.toLocaleLowerCase()}`
            if ((name.indexOf(search) >= 0 || search === "")
                && (only_age_group.length < 1 || res.age_group === only_age_group)
            ) {
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
            // always sort those who haven't finished one event after those who have finished both
            if ((a.seconds_one < 1 || a.seconds_two < 1)
                && (b.seconds_one > 0 && b.seconds_two > 0))
            {
                return 1;
            }
            if ((b.seconds_one < 1 || b.seconds_two < 1)
                && (a.seconds_one > 0 && a.seconds_two > 0))
            {
                return -1;
            }
            // finally sort by ranking
            return a.ranking - b.ranking
        })
        if (dispResults.length < 1) {
            return('');
        }
        const chip_time = rank_by_chip ? "Clock Time*" : "Chip Time*";
        const clock_time = rank_by_chip ? "Chip Time" : "Clock Time";
        return (
            <div className="table-responsive-sm m-3" key={the_double} id={the_double}>
                <table className="table table-sm">
                    <thead>
                        <tr>
                            <th className="table-distance-header text-important text-center" colSpan={10}>{the_double}</th>
                        </tr>
                        <tr>
                            <th className="col-sm text-center">Place</th>
                            <th className="col-xl">Name</th>
                            <th className="overflow-hidden-lg col-sm text-center">Age</th>
                            <th className="overflow-hidden-lg col-sm text-center">Pl</th>
                            <th className="overflow-hidden-sm col-sm text-center">Gender</th>
                            <th className="overflow-hidden-sm col-sm text-center">Pl</th>
                            <th className="overflow-hidden-lg col-lg text-center">{distances[0]}</th>
                            <th className="overflow-hidden-lg col-lg text-center">{distances[1]}</th>
                            <th className="overflow-hidden-lg col-lg text-center"><a href="#disclaimer" className="nav-link m-0 p-0">{chip_time}</a></th>
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
                                let seconds = 0;
                                let milliseconds = 0;
                                let chip_seconds = 0;
                                let chip_milliseconds = 0;
                                if (result.seconds_one > 0 && result.seconds_two > 0) {
                                    seconds = result.seconds_one + result.seconds_two;
                                    milliseconds = result.milliseconds_one + result.milliseconds_two;
                                    if (milliseconds > 1000) {
                                        seconds += 1;
                                        milliseconds -= 1000;
                                    }
                                    chip_seconds = result.chip_seconds_one + result.chip_seconds_two;
                                    chip_milliseconds = result.chip_milliseconds_one + result.chip_milliseconds_two;
                                    if (chip_milliseconds > 1000) {
                                        chip_seconds += 1;
                                        chip_milliseconds -= 1000;
                                    }
                                }
                                return (
                                    <tr key={`${result.first}${result.last}doub`}>
                                        <td className="text-center">{rankStr}</td>
                                        <td>{result.anonymous === true ? `Anon` : `${result.first} ${result.last}`}</td>
                                        <td className="overflow-hidden-lg text-center">{result.age > 0 && result.age < 130 ? result.age : ""}</td>
                                        <td className="overflow-hidden-lg text-center">{arankStr}</td>
                                        <td className="overflow-hidden-sm text-center">{result.gender}</td>
                                        <td className="overflow-hidden-sm text-center">{grankStr}</td>
                                        <td className="overflow-hidden-lg text-center">{
                                            rank_by_chip ? SimpleFormatTime(result.chip_seconds_one, result.chip_milliseconds_one) : SimpleFormatTime(result.seconds_one, result.milliseconds_one)
                                        }</td>
                                        <td className="overflow-hidden-lg text-center">{
                                            rank_by_chip ? SimpleFormatTime(result.chip_seconds_two, result.chip_milliseconds_two) : SimpleFormatTime(result.seconds_two, result.milliseconds_two)
                                        }</td>
                                        <td className="overflow-hidden-lg text-center">{
                                            rank_by_chip ? SimpleFormatTime(seconds, milliseconds) : SimpleFormatTime(chip_seconds, chip_milliseconds)
                                        }</td>
                                        <td className="text-center">{
                                            rank_by_chip ? SimpleFormatTime(chip_seconds, chip_milliseconds) : SimpleFormatTime(seconds, milliseconds)
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

export default DoubleResultsTable