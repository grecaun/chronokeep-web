import { Component } from 'react';
import FormatTime from './FormatTime';

import { TimeResult } from '../Interfaces/types';
import { AwardsProps } from '../Interfaces/props';

class TimeResultsTable extends Component<AwardsProps> {
    render() {
        const results = this.props.results;
        const distance = this.props.distance;
        const showTitle = this.props.showTitle;
        const genders: string[] = [];
        const lastDict: {[index: string]: TimeResult} = {};
        results.forEach(result => {
            if (!genders.includes(result.gender)) {
                genders.push(result.gender);
            }
            if ((result.bib in lastDict) === false || (lastDict[result.bib].occurence < result.occurence)) {
                lastDict[result.bib] = result
            }
        })
        const finishResults = Object.values(lastDict);
        finishResults.sort((a, b) => {
            return a.ranking - b.ranking
        })
        const groups = ["Overall"]
        const groupings: {[index: string]: {[index: string]: TimeResult[]}} = {}
        groupings["Overall"] = {}
        genders.forEach(gender => {
            groupings["Overall"][gender] = []
        })
        if (this.props.masters) {
            groups.push("Masters")
            groupings["Masters"] = {}
            genders.forEach(gender => {
                groupings["Masters"][gender] = []
            })
        }
        if (this.props.grandMasters) {
            groups.push("Grand Masters")
            groupings["Grand Masters"] = {}
            genders.forEach(gender => {
                groupings["Grand Masters"][gender] = []
            })
        }
        finishResults.forEach(result => {
            if (groupings["Overall"][result.gender].length < this.props.numberOV) {
                groupings["Overall"][result.gender].push(result)
                if (this.props.overallInc === true) {
                    const exists = result.age_group in groupings
                    if (exists === false) {
                        groups.push(result.age_group)
                        groupings[result.age_group] = {}
                        genders.forEach(gender => {
                            groupings[result.age_group][gender] = []
                        })
                    }
                    if (groupings[result.age_group][result.gender].length < this.props.numberAG) {
                        groupings[result.age_group][result.gender].push(result)
                    }
                }
            } else {
                const exists = result.age_group in groupings
                if (exists === false) {
                    groups.push(result.age_group)
                    groupings[result.age_group] = {}
                    genders.forEach(gender => {
                        groupings[result.age_group][gender] = []
                    })
                    groupings[result.age_group][result.gender].push(result)
                } else {
                    if (groupings[result.age_group][result.gender].length < this.props.numberAG) {
                        groupings[result.age_group][result.gender].push(result)
                    }
                }
            }
            if (this.props.masters && result.age >= 40 && (result.age < 60 || !this.props.grandMasters) && groupings["Masters"][result.gender].length < this.props.numberOV) {
                groupings["Masters"][result.gender].push(result)
            }
            if (this.props.grandMasters && result.age >= 60 && groupings["Grand Masters"][result.gender].length < this.props.numberOV) {
                groupings["Grand Masters"][result.gender].push(result)
            }
        })
        groups.sort((a, b) => {
            const avalues = a.split("-")
            const bvalues = b.split("-")
            return Number(avalues[0]) - Number(bvalues[0])
        })
        return (
            <div>
                { showTitle &&
                    <div className="awards-header text-important text-center" key={distance} id={distance}>{distance}</div>
                }
                {
                    groups.map(group => {
                        return (
                            <div key={group}>
                                { genders.map(gender => {
                                    let displGender = gender.toUpperCase();
                                    if (displGender === "F" || displGender === "W" || displGender === "WOMAN") {
                                        displGender = "Women";
                                    }
                                    if (displGender === "M" || displGender === "MAN") {
                                        displGender = "Men";
                                    }
                                    if (displGender === gender.toUpperCase()) {
                                        displGender = gender;
                                    }
                                    return (
                                        <div key={group+gender}>
                                            { groupings[group][gender].length > 0 && 
                                            <div className="table-responsive-sm m-3" key={group + "-" + gender} id={group + "-" + gender}>
                                                <table className="table table-sm">
                                                    <thead>
                                                        <tr>
                                                            <th className="table-distance-header text-important text-center" colSpan={10}>{displGender} {group}</th>
                                                        </tr>
                                                        <tr>
                                                            <th className="overflow-hidden-sm col-md text-center">Bib</th>
                                                            <th className="col-sm text-center">Place</th>
                                                            <th className="col-lg">Name</th>
                                                            <th className="overflow-hidden-lg col-sm text-center">Age</th>
                                                            <th className="col-lg text-center">Time</th>
                                                            <th className="col-lg text-center"></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {
                                                            groupings[group][gender].map((result, index) => {
                                                                // Use variables for displaying rank strings so we can hide if not a finish time
                                                                let rankStr = (index + 1).toString()
                                                                // If not a finish time
                                                                if (result.finish !== true) {
                                                                    rankStr = ''
                                                                }
                                                                let segName = result.segment;
                                                                if (segName === "Finish") {
                                                                    segName = "Lap " + result.occurence;
                                                                }
                                                                return (
                                                                    <tr key={result.bib}>
                                                                        <td className="overflow-hidden-sm text-center">{result.bib}</td>
                                                                        <td className="text-center">{rankStr}</td>
                                                                        <td>{result.anonymous === true ? `Bib ${result.bib}` : `${result.first} ${result.last}`}</td>
                                                                        <td className="overflow-hidden-lg text-center">{result.age}</td>
                                                                        <td className="text-center">{FormatTime(result.seconds, result.milliseconds, result)}</td>
                                                                        <td className="text-center">{segName}</td>
                                                                    </tr>
                                                                );
                                                            })
                                                        }
                                                    </tbody>
                                                </table>
                                            </div>
                                            }
                                        </div>
                                    )
                                })}
                            </div>
                        )
                    })
                }
            </div>
        )
    }
}

export default TimeResultsTable