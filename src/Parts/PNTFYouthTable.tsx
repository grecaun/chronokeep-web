import { Link } from 'react-router-dom';
import { YTPTableProps } from '../Interfaces/props';
import { YTPTimeResult } from '../Interfaces/types';
import FormatTime from './FormatTime';

function YTPScoreTable(props: YTPTableProps) {
    const results = props.results;
    const distance = props.distance;
    const info = props.info;
    const showTitle = props.showTitle;
    const sorted = results.sort((a: YTPTimeResult, b: YTPTimeResult) => {
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
    var ranking: number = 1
    const ageRanks: { [index: string]: number } = {}
    const gendRanks: { [index:string]: number } = {}
    sorted.map(result => {
        if (ageRanks[result.age_group] === undefined || ageRanks[result.age_group] <= 0) {
            ageRanks[result.age_group] = 1
        }
        if (gendRanks[result.gender] === undefined || gendRanks[result.gender] <= 0) {
            gendRanks[result.gender] = 1
        }
        result.ranking = ranking
        result.age_ranking = ageRanks[result.age_group]
        result.gender_ranking = gendRanks[result.gender]
        ranking = ranking + 1
        ageRanks[result.age_group] = ageRanks[result.age_group] + 1
        gendRanks[result.gender] = gendRanks[result.gender] + 1
    })
    return (
        <div>
            { sorted.length > 0 && 
            <div className="table-responsive-sm m-3" key={distance} id={distance}>
                <table className="table table-sm">
                    <thead>
                        {showTitle &&
                            <tr>
                                <td className="table-distance-header text-important text-center" colSpan={10}>{distance}</td>
                            </tr>
                        }
                        <tr>
                            <th className="overflow-hidden-lg col-md text-center">Bib</th>
                            <th className="col-sm text-center">Place</th>
                            <th className="col-lg">Name</th>
                            <th className="overflow-hidden-sm col-md text-center">Age Group</th>
                            <th className="overflow-hidden-lg col-sm text-center">Gender</th>
                            <th className="overflow-hidden-lg col-sm text-center">Pl</th>
                            <th className="overflow-hidden-lg col-md text-center"><a href="#disclaimer" className="nav-link m-0 p-0">Chip Time*</a></th>
                            <th className="col-md text-center">Clock Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        { sorted.map(result => {
                            // Use variables for displaying rank strings so we can hide if not a finish time
                            let rankStr = result.ranking.toString()
                            let grankStr = result.gender_ranking.toString()
                            let arankStr = result.age_ranking.toString()
                            if (result.age_ranking < 1) {
                                arankStr = "";
                            } else {
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
                                arankStr = `${result.age_ranking}${suffix} ${result.age_group}`
                            }
                            if (result.gender_ranking < 1) {
                                grankStr = "";
                            }
                            // If ranking is set to -1, or it is a start time then ignore output
                            // otherwise display the current ranking for that value
                            if (result.ranking < 1 || result.occurence === 0) {
                                rankStr = grankStr = ""
                            }
                            // DNF - DNF - DNS
                            if (result.type === 3 || result.type === 30 || result.type === 31) {
                                rankStr = grankStr = ""
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
                            // We only want the first two characters for display here.
                            result.gender = result.gender.substring(0,2)
                            if (result.gender === "F" || result.gender === "WO" || result.gender === "W") {
                                result.gender = "F"
                            } else if (result.gender === "M" || result.gender === "MA") {
                                result.gender = "M"
                            } else {
                                result.gender = "X"
                            }
                            return (
                                <tr key={result.bib}>
                                    <td className="overflow-hidden-lg text-center">{result.bib}</td>
                                    <td className="text-center">{rankStr}</td>
                                    <td><Link to={`/results/${info.slug}/${info.year}/${result.bib}`} className="nav-link m-0 p-0">{result.anonymous === true ? `Bib ${result.bib}` : `${result.first} ${result.last}`}</Link></td>
                                    <td className="overflow-hidden-sm text-center">{arankStr}</td>
                                    <td className="overflow-hidden-lg text-center">{result.gender}</td>
                                    <td className="overflow-hidden-lg text-center">{grankStr}</td>
                                    <td className="overflow-hidden-lg text-center">{FormatTime(result.chip_seconds, result.chip_milliseconds, result)}</td>
                                    <td className="text-center">{FormatTime(result.seconds, result.milliseconds, result, true)}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                <div id='disclaimer' className='container-lg lg-max-width shadow-sm text-center p-3 mb-3 border border-light overflow-hidden-lg'>*Results are ranked based upon the Clock Time and not the Chip Time.</div>
            </div>
            }
            { sorted.length <= 0 && 
            <div className="container-lg lg-max-width shadow-sm p-5 mb-3 border border-light">
                <div className="text-center"><h2>No results to display.</h2></div>
            </div>
            }
        </div>
    )
}

export default YTPScoreTable