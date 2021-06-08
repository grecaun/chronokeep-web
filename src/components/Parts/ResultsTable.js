import React from 'react';

const ResultsTable = (distance, results) => {
    return (
        <div key={distance}>
            <h3>{ distance }</h3>
            <table>
                <thead>
                    <tr>
                        <th>Bib</th>
                        <th>Place</th>
                        <th></th>
                        <th></th>
                        <th>First</th>
                        <th>Last</th>
                        <th>Age</th>
                        <th>Gender</th>
                        <th>Gun Time</th>
                        <th>Time</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        results.map((result, index) => {
                            const timeHour = Math.floor(result.seconds / 3600)
                            var timeMinutes = Math.floor((result.seconds % 3600) / 60)
                            if (timeMinutes < 10) {
                                timeMinutes = '0' + timeMinutes
                            }
                            const timeSeconds = result.seconds % 60
                            const timeMill = Math.floor(result.milliseconds / 100)
                            var timeString = '';
                            if (timeHour > 0) {
                                timeString = `${timeHour}:${timeMinutes}:${timeSeconds}.${timeMill}`
                            } else {
                                timeString = `${timeMinutes}:${timeSeconds}.${timeMill}`
                            }
                            const chipHour = Math.floor(result.chip_seconds / 3600)
                            var chipMinutes = Math.floor((result.chip_seconds % 3600) / 60 )
                            if (chipMinutes < 10) {
                                chipMinutes = '0' + chipMinutes
                            }
                            var chipSeconds = result.chip_seconds % 60
                            const chipMill = Math.floor(result.chip_milliseconds / 100)
                            var chipTimeString = '';
                            if (chipHour > 0) {
                                chipTimeString = `${chipHour}:${chipMinutes}:${chipSeconds}.${chipMill}`
                            } else {
                                chipTimeString = `${chipMinutes}:${chipSeconds}.${chipMill}`
                            }
                            return (
                                <tr key={result.bib}>
                                    <td>{result.bib}</td>
                                    <td>{result.ranking}</td>
                                    <td>{result.age_ranking}</td>
                                    <td>{result.gender_ranking}</td>
                                    <td>{result.first}</td>
                                    <td>{result.last}</td>
                                    <td>{result.age}</td>
                                    <td>{result.gender}</td>
                                    <td>{timeString}</td>
                                    <td>{chipTimeString}</td>
                                </tr>
                            );
                        })
                    }
                </tbody>
            </table>
        </div>
    )
}

export default ResultsTable