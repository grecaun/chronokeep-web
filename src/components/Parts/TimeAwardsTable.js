import React, { Component } from 'react';
import FormatTime from './FormatTime';

class TimeResultsTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            distance: props.distance,
            results: props.results,
            index: props.index,
            info: props.info,
            showTitle: props.showTitle,
            numberAG: props.vars.numberAG,
            numberOV: props.vars.numberOV,
            overallInc: props.vars.overallInc,
            grandMasters: props.vars.grandMasters,
            masters: props.vars.masters
        }
    }

    static getDerivedStateFromProps(props, state) {
        if (props.numberAG !== state.numberAG || props.numberOV !== state.numberOV || props.overallInc !== state.overallInc) {
            return {
                numberAG: props.vars.numberAG,
                numberOV: props.vars.numberOV,
                overallInc: props.vars.overallInc,
                grandMasters: props.vars.grandMasters,
                masters: props.vars.masters
            }
        }
        return null;
    }

    render() {
        const results = this.state.results;
        const distance = this.state.distance;
        const showTitle = this.state.showTitle;
        const genders = [];
        const lastDict = {};
        results.forEach(result => {
            if (!genders.includes(result.gender)) {
                console.log("Gender is " + result.gender);
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
        const groupings = {}
        groupings["Overall"] = {}
        genders.forEach(gender => {
            groupings["Overall"][gender] = []
        })
        if (this.state.masters) {
            groups.push("Masters")
            groupings["Masters"] = {}
            genders.forEach(gender => {
                groupings["Masters"][gender] = []
            })
        }
        if (this.state.grandMasters) {
            groups.push("Grand Masters")
            groupings["Grand Masters"] = {}
            genders.forEach(gender => {
                groupings["Grand Masters"][gender] = []
            })
        }
        console.log(finishResults)
        finishResults.forEach(result => {
            if (groupings["Overall"][result.gender].length < this.state.numberOV) {
                groupings["Overall"][result.gender].push(result)
                if (this.state.overallInc === true) {
                    var exists = result.age_group in groupings
                    if (exists === false) {
                        groups.push(result.age_group)
                        groupings[result.age_group] = {}
                        genders.forEach(gender => {
                            groupings[result.age_group][gender] = []
                        })
                    }
                    if (groupings[result.age_group][result.gender].length < this.state.numberAG) {
                        groupings[result.age_group][result.gender].push(result)
                    }
                }
            } else {
                exists = result.age_group in groupings
                if (exists === false) {
                    groups.push(result.age_group)
                    groupings[result.age_group] = {}
                    genders.forEach(gender => {
                        groupings[result.age_group][gender] = []
                    })
                    groupings[result.age_group][result.gender].push(result)
                } else {
                    if (groupings[result.age_group][result.gender].length < this.state.numberAG) {
                        groupings[result.age_group][result.gender].push(result)
                    }
                }
            }
            if (this.state.masters && result.age >= 40 && (result.age < 60 || !this.state.grandMasters) && groupings["Masters"][result.gender].length < this.state.numberOV) {
                groupings["Masters"][result.gender].push(result)
            }
            if (this.state.grandMasters && result.age >= 60 && groupings["Grand Masters"][result.gender].length < this.state.numberOV) {
                groupings["Grand Masters"][result.gender].push(result)
            }
        })
        groups.sort((a, b) => {
            const avalues = a.split("-")
            const bvalues = b.split("-")
            return avalues[0] - bvalues[0]
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
                                    var displGender = gender.toUpperCase();
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
                                                            <th className="table-distance-header text-important text-center" colSpan="10">{displGender} {group}</th>
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
                                                                var rankStr = index + 1
                                                                // If not a finish time
                                                                if (result.finish !== true) {
                                                                    rankStr = ''
                                                                }
                                                                var segName = result.segment;
                                                                if (segName === "Finish") {
                                                                    segName = "Lap " + result.occurence;
                                                                }
                                                                return (
                                                                    <tr key={result.bib}>
                                                                        <td className="overflow-hidden-sm text-center">{result.bib}</td>
                                                                        <td className="text-center">{rankStr}</td>
                                                                        <td>{`${result.first} ${result.last}`}</td>
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