import { Link } from 'react-router-dom';
import { YTPTableProps } from '../Interfaces/props';
import { YTPTimeResult } from '../Interfaces/types';
import FormatTime from './FormatTime';

function YTPAwardsTable(props: YTPTableProps) {
    let results = props.results;
    const distance = props.distance;
    const info = props.info;
    const showTitle = props.show_title;
    const sorted = results.sort((a: YTPTimeResult, b: YTPTimeResult) => {
        if (a.seconds === b.seconds) {
            return a.milliseconds - b.milliseconds
        }
        return a.seconds - b.seconds
    })
    var ranking: number = 1
    const ageRanks: { [index: string]: number } = {}
    const gendRanks: { [index: string]: number } = {}
    const ageResults: { [index: string]: YTPTimeResult[] } = {}
    const gendResults: { [index: string]: YTPTimeResult[] } = {}
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
        if (ageResults[result.age_group] === undefined) {
            ageResults[result.age_group] = []
        }
        if (gendResults[result.gender] === undefined) {
            gendResults[result.gender] = []
        }
        if (result.age_ranking <= 3) {
            ageResults[result.age_group].push(result)
        }
        if (result.gender_ranking <= 3) {
            gendResults[result.gender].push(result)
        }
    })
    const ageGroups: string[] = [
        "Female 8/under",
        "Female 9-10",
        "Female 11-12",
        "Female 13-14",
        "Female 15-16",
        "Female 17-18",
        "Male 8/under",
        "Male 9-10",
        "Male 11-12",
        "Male 13-14",
        "Male 15-16",
        "Male 17-18",
        "Non-Binary 8/under",
        "Non-Binary 9-10",
        "Non-Binary 11-12",
        "Non-Binary 13-14",
        "Non-Binary 15-16",
        "Non-Binary 17-18"
    ]
    const genders = Object.keys(gendResults)
    return (
        <div>
            { showTitle &&
                <div className="awards-header text-important text-center" key={distance} id={distance}>{distance}</div>
            }
            { genders.map(gender => {
                return(
                    <div key={gender}>
                        { gendResults.has(gender) && gendResults.get(gender)!.length > 0 &&
                        <div className="table-responsive-sm m-3" key={gender} id={gender}>
                            <table className="table table-sm">
                                <thead>
                                    <tr>
                                        <th className="table-distance-header text-important text-center" colSpan={6}>{gender === 'F' ? 'Female Overall' : gender === 'M' ? 'Male Overall' : 'Non-Binary Overall'}</th>
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
                                    gendResults[gender].map(result => {
                                        return (
                                            <tr key={result.bib}>
                                                <td className="overflow-hidden-sm text-center">{result.bib}</td>
                                                <td className="text-center">{result.gender_ranking}</td>
                                                <td><Link to={`/ytp-awards/${info.slug}/${info.year}/${result.bib}`} className="nav-link m-0 p-0">{result.anonymous === true ? `Bib ${result.bib}` : `${result.first} ${result.last}`}</Link></td>
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
            { ageGroups.map(group => {
                return (
                    <div key={group}>
                    { ageResults.has(group) && ageResults.get(group)!.length > 0 &&
                    <div className="table-responsive-sm m-3" key={group} id={group}>
                        <table className="table table-sm">
                            <thead>
                                <tr>
                                    <th className="table-distance-header text-important text-center" colSpan={6}>{group}</th>
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
                                ageResults.get(group)!.map(result => {
                                    return (
                                        <tr key={result.bib}>
                                            <td className="overflow-hidden-sm text-center">{result.bib}</td>
                                            <td className="text-center">{result.age_ranking}</td>
                                            <td><Link to={`/ytp-awards/${info.slug}/${info.year}/${result.bib}`} className="nav-link m-0 p-0">{result.anonymous === true ? `Bib ${result.bib}` : `${result.first} ${result.last}`}</Link></td>
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