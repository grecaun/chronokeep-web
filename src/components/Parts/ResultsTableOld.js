import React from 'react';
import { Link } from 'react-router-dom';
import FormatTime from './FormatTime';

const ResultsTable = (distance, results, index, show, info) => {
    const sorted = results.sort((a, b) => {
        if (a.occurence !== b.occurence) {
            return b.occurence - a.occurence
        }
        return a.ranking - b.ranking
    })
    var collapseClass = "collapse table-responsive-sm"
    if (show === true) {
        collapseClass = "collapse table-responsive-sm show"
    }
    return (
        <div class={collapseClass} key={distance} id={`distance${index}`} data-bs-parent="#results-parent">
            <table class="table table-sm">
                <thead>
                    <tr>
                        <th class="table-distance-header text-important text-center" colSpan="10">{distance}</th>
                    </tr>
                    <tr>
                        <th class="overflow-hidden-sm col-md text-center">Bib</th>
                        <th class="col-sm text-center">Place</th>
                        <th class="col-xl">Name</th>
                        <th class="overflow-hidden-lg col-sm text-center">Age</th>
                        <th class="overflow-hidden-lg col-sm text-center">Pl</th>
                        <th class="overflow-hidden-lg col-sm text-center">Gender</th>
                        <th class="overflow-hidden-lg col-sm text-center">Pl</th>
                        <th class="overflow-hidden-sm col-lg text-center">Gun Time</th>
                        <th class="col-lg text-center">Time</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        sorted.map(result => {
                            // Use variables for displaying rank strings so we can hide if not a finish time
                            var rankStr = result.ranking
                            var arankStr = result.age_ranking
                            var grankStr = result.gender_ranking
                            // If not a finish time
                            if (result.finish !== true) {
                                rankStr = arankStr = grankStr = ''
                            }
                            // DNF
                            if (result.type === 3) {
                                rankStr = arankStr = grankStr = ''
                            }
                            // Early start time
                            if (result.type === 1) {
                                rankStr = `${rankStr}e`
                            }
                            // Unofficial time
                            if (result.Type === 2) {
                                rankStr = `${rankStr}u`
                            }
                            return (
                                <tr key={result.bib}>
                                    <td class="overflow-hidden-sm text-center">{result.bib}</td>
                                    <td class="text-center">{rankStr}</td>
                                    <td><Link to={`/results/${info.slug}/${info.year}/${result.bib}`} className="nav-link m-0 p-0">{`${result.first} ${result.last}`}</Link></td>
                                    <td class="overflow-hidden-lg text-center">{result.age}</td>
                                    <td class="overflow-hidden-lg text-center">{arankStr}</td>
                                    <td class="overflow-hidden-lg text-center">{result.gender}</td>
                                    <td class="overflow-hidden-lg text-center">{grankStr}</td>
                                    <td class="overflow-hidden-sm text-center">{FormatTime(result.seconds, result.milliseconds, result)}</td>
                                    <td class="text-center">{FormatTime(result.chip_seconds, result.chip_milliseconds, result, true)}</td>
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