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
            numberAg: props.numberAG,
            numberOv: props.numberOV,
            overallIncluded: props.overallIncluded,
        }
    }

    static getDerivedStateFromProps(props, state) {
        if (props.numberAG !== state.numberAg || props.numberOV !== state.numberOv || props.overallIncluded !== state.overallIncluded) {
            return {
                numberAg: props.numberAG,
                numberOv: props.numberOV,
                overallIncluded: props.overallIncluded,
            }
        }
        return null;
    }

    render() {
        const results = this.state.results;
        const distance = this.state.distance;
        const showTitle = this.state.showTitle;
        results.sort((a, b) => {
            return a.ranking - b.ranking
        })
        const groups = ["Overall"]
        const groupings = {}
        groupings["Overall"] = {}
        groupings["Overall"]["M"] = []
        groupings["Overall"]["F"] = []
        results.map(result => {
            // DNF - DNF - DNS
            if (result.finish != true) {
                // ignore these entries
            } else if (groupings["Overall"][result.gender].length < this.state.numberOv) {
                groupings["Overall"][result.gender].push(result)
                if (this.state.overallIncluded === true) {
                    var exists = result.age_group in groupings
                    if (exists === false) {
                        groups.push(result.age_group)
                        groupings[result.age_group] = {}
                        groupings[result.age_group]["M"] = []
                        groupings[result.age_group]["F"] = []
                    }
                    if (groupings[result.age_group][result.gender].length < this.state.numberAg) {
                        groupings[result.age_group][result.gender].push(result)
                    }
                }
            } else {
                var exists = result.age_group in groupings
                if (exists === false) {
                    groups.push(result.age_group)
                    groupings[result.age_group] = {}
                    groupings[result.age_group]["M"] = []
                    groupings[result.age_group]["F"] = []
                    groupings[result.age_group][result.gender].push(result)
                } else {
                    if (groupings[result.age_group][result.gender].length < this.state.numberAg) {
                        groupings[result.age_group][result.gender].push(result)
                    }
                }
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
                                { groupings[group]["M"].length > 0 &&
                                <div className="table-responsive-sm m-3" key={group + "-m"} id={group + "-m"}>
                                    <table className="table table-sm">
                                        <thead>
                                            <tr>
                                                <th className="table-distance-header text-important text-center" colSpan="10">Male {group}</th>
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
                                                groupings[group]["M"].map((result, index) => {
                                                    // Use variables for displaying rank strings so we can hide if not a finish time
                                                    var rankStr = index + 1
                                                    // Use variables for displaying rank strings so we can hide if not a finish time
                                                    var rankStr = result.ranking
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
                                { groupings[group]["F"].length > 0 &&
                                <div className="table-responsive-sm m-3" key={group + "-f"} id={group + "-f"}>
                                    <table className="table table-sm">
                                        <thead>
                                            <tr>
                                                <th className="table-distance-header text-important text-center" colSpan="10">Female {group}</th>
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
                                                groupings[group]["F"].map((result, index) => {
                                                    // Use variables for displaying rank strings so we can hide if not a finish time
                                                    var rankStr = index + 1
                                                    // Use variables for displaying rank strings so we can hide if not a finish time
                                                    var rankStr = result.ranking
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
                    })
                }
            </div>
        )
    }
}

export default TimeResultsTable