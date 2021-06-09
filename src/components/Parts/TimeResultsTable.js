import React from 'react';

const TimeResultsTable = (distance, results, index, show) => {
    const sorted = results.sort((a, b) => {
        return a.ranking - b.ranking
    })
    var collapseClass = "collapse"
    if (show === true) {
        collapseClass = "collapse show"
    }
    return (
        <div class={collapseClass} key={distance} id={"distance" + index} data-bs-parent="#results-parent">
            <table class="table table-sm table-bordered">
                <thead>
                    <tr>
                        <td class="table-header text-important center" colSpan="10">{distance}</td>
                    </tr>
                    <tr>
                        <th class="overflow-hidden-sm col-md center">Bib</th>
                        <th class="col-sm center">Place</th>
                        <th class="col-lg">First</th>
                        <th class="col-lg">Last</th>
                        <th class="overflow-hidden-lg col-sm center">Age</th>
                        <th class="overflow-hidden-lg col-sm center">Pl</th>
                        <th class="overflow-hidden-lg col-sm center">Gender</th>
                        <th class="overflow-hidden-lg col-sm center">Pl</th>
                        <th class="col-lg center">Time</th>
                        <th class="col-lg center">Laps</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        sorted.map(result => {
                            // Calculate the string to display for Gun Time
                            const timeHour = Math.floor(result.seconds / 3600)
                            var timeMinutes = Math.floor((result.seconds % 3600) / 60)
                            // Change minutes into a string starting with 0 if its less than 10, i.e. 09
                            timeMinutes = timeMinutes < 10 ? '0' + timeMinutes : timeMinutes
                            var timeSeconds = result.seconds % 60
                            // Change seconds into a string starting with 0 if its less than 10, i.e. 09
                            timeSeconds = timeSeconds < 10 ? '0' + timeSeconds : timeSeconds
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
                                    <td class="overflow-hidden-sm center">{result.bib}</td>
                                    <td class="center">{result.ranking}</td>
                                    <td>{result.first}</td>
                                    <td>{result.last}</td>
                                    <td class="overflow-hidden-lg center">{result.age}</td>
                                    <td class="overflow-hidden-lg center">{result.age_ranking}</td>
                                    <td class="overflow-hidden-lg center">{result.gender}</td>
                                    <td class="overflow-hidden-lg center">{result.gender_ranking}</td>
                                    <td class="center">{timeString}</td>
                                    <td class="center">{result.segment}</td>
                                </tr>
                            );
                        })
                    }
                </tbody>
            </table>
        </div>
    )
}

export default TimeResultsTable