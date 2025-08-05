import { YTPTableProps } from '../Interfaces/props';
import { YTPTimeResult } from '../Interfaces/types';
import FormatTime from './FormatTime';

function YTPAwardsTable(props: YTPTableProps) {
    let results = props.results;
    const distance = props.distance;
    const showTitle = props.showTitle;
    const sorted = results.sort((a: YTPTimeResult, b: YTPTimeResult) => {
        if (a.gender == b.gender){
            if (a.age == b.age) {
                if (a.seconds === b.seconds) {
                    return a.milliseconds - b.milliseconds
                }
                return a.seconds - b.seconds
            }
            return a.age - b.age
        }
        return a.gender.localeCompare(b.gender)
    })
    const ageRanks: { [index: string]: number } = {}
    const ageResults: { [index: string]: YTPTimeResult[] } = {}
    sorted.map(result => {
        if (ageRanks[result.age_group] === undefined || ageRanks[result.age_group] <= 0) {
            ageRanks[result.age_group] = 1
        }
        result.age_ranking = ageRanks[result.age_group]
        result.ranking = ageRanks[result.age_group]
        ageRanks[result.age_group] = ageRanks[result.age_group] + 1
        if (ageResults[result.age_group] === undefined) {
            ageResults[result.age_group] = []
        }
        ageResults[result.age_group].push(result)
    })
    const ageGroups = Object.keys(ageResults)
    return (
        <div>
            { showTitle &&
                <div className="awards-header text-important text-center" key={distance} id={distance}>{distance}</div>
            }
            { ageGroups.map(group => {
                return (
                    <div key={group}>
                    {
                        ageResults[group].length > 0 &&
                        <div className="table-responsive-sm m-3" key={group} id={group}>
                            <table className="table table-sm">
                                <thead>
                                    <tr>
                                        <th className="table-distance-header text-important text-center" colSpan={10}>{group}</th>
                                    </tr>
                                    <tr>
                                        <th className="overflow-hidden-sm col-md text-center">Bib</th>
                                        <th className="col-sm text-center">Place</th>
                                        <th className="col-xl">Name</th>
                                        <th className="overflow-hidden-sm col-sm text-center">Age</th>
                                        <th className="overflow-hidden-lg col-lg text-center">Chip Time</th>
                                        <th className="col-lg text-center">Clock Time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                {
                                    ageResults[group].map((result, index) => {
                                        // Use variables for displaying rank strings so we can hide if not a finish time
                                        let rankStr = (index + 1).toString()
                                        // If ranking is set to -1, or it is a start time then ignore output
                                        // otherwise display the current ranking for that value
                                        if (result.ranking < 1 || result.occurence === 0) {
                                            rankStr = ''
                                        }
                                        // DNF - DNF - DNS
                                        if (result.type === 3 || result.type === 30 || result.type === 31) {
                                            rankStr = ''
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
                                        return (
                                            <tr key={result.bib}>
                                                <td className="overflow-hidden-sm text-center">{result.bib}</td>
                                                <td className="text-center">{rankStr}</td>
                                                <td>{`${result.first} ${result.last}`}</td>
                                                <td className="overflow-hidden-sm text-center">{result.age}</td>
                                                <td className="overflow-hidden-lg text-center">{FormatTime(result.chip_seconds, result.chip_milliseconds, result)}</td>
                                                <td className="text-center">{FormatTime(result.seconds, result.milliseconds, result, true)}</td>
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
}

export default YTPAwardsTable