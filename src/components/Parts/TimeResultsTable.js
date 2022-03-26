import React, { Component } from 'react';

class TimeResultsTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            distance: props.distance,
            results: props.results,
            index: props.index,
            show: props.show,
        }
    }

    render() {
        const results = this.state.results;
        const distance = this.state.distance;
        const sorted = results.sort((a, b) => {
            return a.ranking - b.ranking
        })
        return (
            <div className="table-responsive-sm m-3" key={distance} id={distance}>
                <table class="table table-sm">
                    <thead>
                        <tr>
                            <td class="table-distance-header text-important text-center" colSpan="10">{distance}</td>
                        </tr>
                        <tr>
                            <th class="overflow-hidden-sm col-md text-center">Bib</th>
                            <th class="col-sm text-center">Place</th>
                            <th class="col-xl">Name</th>
                            <th class="overflow-hidden-lg col-sm text-center">Age</th>
                            <th class="overflow-hidden-lg col-sm text-center">Pl</th>
                            <th class="overflow-hidden-lg col-sm text-center">Gender</th>
                            <th class="overflow-hidden-lg col-sm text-center">Pl</th>
                            <th class="col-lg text-center">Time</th>
                            <th class="col-lg text-center"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            sorted.map(result => {
                                // Calculate the string to display for Gun Time
                                const timeHour = Math.floor(result.seconds / 3600)
                                var timeMinutes = Math.floor((result.seconds % 3600) / 60)
                                // Change minutes into a string starting with 0 if its less than 10, i.e. 09
                                timeMinutes = timeMinutes < 10 ? `0${timeMinutes}` : timeMinutes
                                var timeSeconds = result.seconds % 60
                                // Change seconds into a string starting with 0 if its less than 10, i.e. 09
                                timeSeconds = timeSeconds < 10 ? `0${timeSeconds}` : timeSeconds
                                // Only care about tenths of a second
                                const timeMill = Math.floor(result.milliseconds / 100)
                                var timeString = '';
                                // Only show hour if it exists.
                                if (timeHour > 0) {
                                    timeString = `${timeHour}:${timeMinutes}:${timeSeconds}.${timeMill}`
                                } else {
                                    timeString = `${timeMinutes}:${timeSeconds}.${timeMill}`
                                }
                                return (
                                    <tr key={result.bib}>
                                        <td class="overflow-hidden-sm text-center">{result.bib}</td>
                                        <td class="text-center">{result.ranking}</td>
                                        <td>{`${result.first} ${result.last}`}</td>
                                        <td class="overflow-hidden-lg text-center">{result.age}</td>
                                        <td class="overflow-hidden-lg text-center">{result.age_ranking}</td>
                                        <td class="overflow-hidden-lg text-center">{result.gender}</td>
                                        <td class="overflow-hidden-lg text-center">{result.gender_ranking}</td>
                                        <td class="text-center">{timeString}</td>
                                        <td class="text-center">{result.segment}</td>
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

export default TimeResultsTable