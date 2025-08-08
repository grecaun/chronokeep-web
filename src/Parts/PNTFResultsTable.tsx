import { Component } from 'react';
import FormatTime from './FormatTime';
import { TimeResult } from '../Interfaces/types';
import { PNTFTableProps } from '../Interfaces/props';

class PNTFResultsTable extends Component<PNTFTableProps> {
    render() {
        const results = this.props.results;
        const distance = this.props.distance;
        const showTitle = this.props.showTitle;
        const genderResults: { [index: string]: TimeResult[] } = {}
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
                            <th className="overflow-hidden-lg col-sm text-center">Overall</th>
                            <th className="overflow-hidden-lg col-md text-center">Age Group</th>
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
                                var rankStr = result.gender_ranking.toString()
                                var dRankStr = result.division_ranking.toString()
                                if (result.age_ranking < 1) {
                                    dRankStr = "";
                                }
                                // If ranking is set to -1, or it is a start time then ignore output
                                // otherwise display the current ranking for that value
                                if (result.ranking < 1 || result.occurence === 0) {
                                    rankStr = dRankStr = ""
                                }
                                // DNF - DNF - DNS
                                if (result.type === 3 || result.type === 30 || result.type === 31) {
                                    rankStr = dRankStr = ""
                                }
                                if (result.division === "Open" || result.division === "Youth") {
                                    dRankStr = "";
                                }
                                var suffix = ''
                                const rem = result.age_ranking % 10
                                if (result.age_ranking === 11 || result.age_ranking === 12 || result.age_ranking === 13 || (rem !== 1 && rem !== 2 && rem !== 3)) {
                                    suffix = 'th'
                                } else if (rem === 1) {
                                    suffix = 'st'
                                } else if (rem === 2) {
                                    suffix = 'nd'
                                } else if (rem === 3) {
                                    suffix = 'rd'
                                }
                                var ageGroupRanking = `${result.age_ranking}${suffix} ${result.age_group}`
                                const ageGroupSplit = result.age_group.split(' ')
                                if (ageGroupSplit.length > 1) {
                                    ageGroupRanking = `${result.age_ranking}${suffix} ${ageGroupSplit[1]}`
                                }
                                if (result.anonymous === true) {
                                    return (
                                        <tr key={result.bib}>
                                            <td className="text-center">{rankStr}</td>
                                            <td className="text-center">{dRankStr}</td>
                                            <td>{`Bib ${result.bib}`}</td>
                                            <td className="overflow-hidden-lg text-center">{result.ranking}</td>
                                            <td className="overflow-hidden-lg text-center">{ageGroupRanking}</td>
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
                                        <td className="text-center">{dRankStr}</td>
                                        <td>{`${result.first} ${result.last}`}</td>
                                        <td className="overflow-hidden-lg text-center">{result.ranking}</td>
                                        <td className="overflow-hidden-lg text-center">{ageGroupRanking}</td>
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
                                var rankStr = result.gender_ranking.toString()
                                var dRankStr = result.division_ranking.toString()
                                if (result.age_ranking < 1) {
                                    dRankStr = "";
                                }
                                // If ranking is set to -1, or it is a start time then ignore output
                                // otherwise display the current ranking for that value
                                if (result.ranking < 1 || result.occurence === 0) {
                                    rankStr = dRankStr = ""
                                }
                                // DNF - DNF - DNS
                                if (result.type === 3 || result.type === 30 || result.type === 31) {
                                    rankStr = dRankStr = ""
                                }
                                if (result.division === "Open" || result.division === "Youth") {
                                    dRankStr = "";
                                }
                                var suffix = ''
                                const rem = result.age_ranking % 10
                                if (result.age_ranking === 11 || result.age_ranking === 12 || result.age_ranking === 13 || (rem !== 1 && rem !== 2 && rem !== 3)) {
                                    suffix = 'th'
                                } else if (rem === 1) {
                                    suffix = 'st'
                                } else if (rem === 2) {
                                    suffix = 'nd'
                                } else if (rem === 3) {
                                    suffix = 'rd'
                                }
                                var ageGroupRanking = `${result.age_ranking}${suffix} ${result.age_group}`
                                const ageGroupSplit = result.age_group.split(' ')
                                if (ageGroupSplit.length > 1) {
                                    ageGroupRanking = `${result.age_ranking}${suffix} ${ageGroupSplit[1]}`
                                }
                                if (result.anonymous === true) {
                                    return (
                                        <tr key={result.bib}>
                                            <td className="text-center">{rankStr}</td>
                                            <td className="text-center">{dRankStr}</td>
                                            <td>{`Bib ${result.bib}`}</td>
                                            <td className="overflow-hidden-lg text-center">{result.ranking}</td>
                                            <td className="overflow-hidden-lg text-center">{ageGroupRanking}</td>
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
                                        <td className="text-center">{dRankStr}</td>
                                        <td>{`${result.first} ${result.last}`}</td>
                                        <td className="overflow-hidden-lg text-center">{result.ranking}</td>
                                        <td className="overflow-hidden-lg text-center">{ageGroupRanking}</td>
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
                                var rankStr = result.gender_ranking.toString()
                                var dRankStr = result.division_ranking.toString()
                                if (result.age_ranking < 1) {
                                    dRankStr = "";
                                }
                                // If ranking is set to -1, or it is a start time then ignore output
                                // otherwise display the current ranking for that value
                                if (result.ranking < 1 || result.occurence === 0) {
                                    rankStr = dRankStr = ""
                                }
                                // DNF - DNF - DNS
                                if (result.type === 3 || result.type === 30 || result.type === 31) {
                                    rankStr = dRankStr = ""
                                }
                                if (result.division === "Open" || result.division === "Youth") {
                                    dRankStr = "";
                                }
                                var suffix = ''
                                const rem = result.age_ranking % 10
                                if (result.age_ranking === 11 || result.age_ranking === 12 || result.age_ranking === 13 || (rem !== 1 && rem !== 2 && rem !== 3)) {
                                    suffix = 'th'
                                } else if (rem === 1) {
                                    suffix = 'st'
                                } else if (rem === 2) {
                                    suffix = 'nd'
                                } else if (rem === 3) {
                                    suffix = 'rd'
                                }
                                var ageGroupRanking = `${result.age_ranking}${suffix} ${result.age_group}`
                                const ageGroupSplit = result.age_group.split(' ')
                                if (ageGroupSplit.length > 1) {
                                    ageGroupRanking = `${result.age_ranking}${suffix} ${ageGroupSplit[1]}`
                                }
                                if (result.anonymous === true) {
                                    return (
                                        <tr key={result.bib}>
                                            <td className="text-center">{rankStr}</td>
                                            <td className="text-center">{dRankStr}</td>
                                            <td>{`Bib ${result.bib}`}</td>
                                            <td className="overflow-hidden-lg text-center">{result.ranking}</td>
                                            <td className="overflow-hidden-lg text-center">{ageGroupRanking}</td>
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
                                        <td className="text-center">{dRankStr}</td>
                                        <td>{`${result.first} ${result.last}`}</td>
                                        <td className="overflow-hidden-lg text-center">{result.ranking}</td>
                                        <td className="overflow-hidden-lg text-center">{ageGroupRanking}</td>
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