import { YTPTableProps } from '../Interfaces/props';
import { YTPTimeResult } from '../Interfaces/types';
import { CSVLoader } from '../loaders/csv';
import Loading from './Loading';

function YTPScoreTable(props: YTPTableProps) {
    let results = props.results;
    const distance = props.distance;
    const showTitle = props.showTitle;
    const info = props.info;
    const { state } = CSVLoader(`https://downloads.chronokeep.com/${info.slug}/${info.year}/${distance}/ytp-standings.csv`)
    if (state.csv_loaded === false) {
        return (
            <Loading />
        );
    }
    var overall_win = 0
    var overall_f_win = 0
    const prev_participants: { [index: string]: boolean } = {}
    results.map(result => {
        if (overall_win === 0 || overall_win > result.seconds) {
            overall_win = result.seconds
        }
        if (result.gender === "F" && (overall_f_win === 0 || overall_f_win > result.seconds)) {
            overall_f_win = result.seconds
        }
        if (state.prev_standings[`${result.first} ${result.last}`] !== undefined) {
            result.highest_score = state.prev_standings[`${result.first} ${result.last}`].highest_score
            result.tiger_score = state.prev_standings[`${result.first} ${result.last}`].tiger_score
            result.seward_score = state.prev_standings[`${result.first} ${result.last}`].seward_score
            prev_participants[`${result.first} ${result.last}`] = true
        }
    })
    results.map(result => {
        if (result.seconds > 0) {
            if (result.gender === "F") {
                result.cougar_score = overall_f_win / result.seconds
            } else {
                result.cougar_score = overall_win / result.seconds
            }
            result.cougar_score = result.cougar_score * 100
        } else {
            result.cougar_score = 0
        }
        if (result.cougar_score <= 0 || result.highest_score <= 0) {
            result.combined_score = 0
        } else {
            result.combined_score = result.cougar_score + result.highest_score
        }
    })
    Object.keys(state.prev_standings).map(name => {
        if (prev_participants[name] === undefined) {
            const nameSplit = name.split(' ')
            results.push({
                bib: '',
                first: nameSplit[0],
                last: nameSplit[1],
                seconds: 0,
                milliseconds: 0,
                chip_seconds: 0,
                chip_milliseconds: 0,
                gender: state.prev_standings[name].gender,
                occurence: 0,
                age_group: state.prev_standings[name].age_group,
                age: state.prev_standings[name].age,
                ranking: 0,
                age_ranking: 0,
                gender_ranking: 0,
                finish: true,
                segment: "Finish",
                type: 0,
                anonymous: false,
                distance: distance,
                location: 'Finish',
                local_time: '',
                division: '',
                division_ranking: 0,
                cougar_score: 0.00,
                combined_score: 0.00,
                highest_score: 0.00,
                tiger_score: 0.00,
                seward_score: 0.00
            })
        }
    })
    const sorted = results.sort((a: YTPTimeResult, b: YTPTimeResult) => {
        if (a.gender == b.gender){
            if (a.age == b.age) {
                return b.cougar_score - a.cougar_score
            }
            return a.age - b.age
        }
        return a.gender.localeCompare(b.gender)
    })
    const ageRanks: { [index: string]: number } = {}
    sorted.map(result => {
        if (ageRanks[result.age_group] === undefined || ageRanks[result.age_group] <= 0) {
            ageRanks[result.age_group] = 1
        }
        result.age_ranking = ageRanks[result.age_group]
        result.ranking = ageRanks[result.age_group]
        ageRanks[result.age_group] = ageRanks[result.age_group] + 1
    })
    return (
        <div className="table-responsive-sm m-3" key={distance} id={distance}>
            <table className="table table-sm">
                <thead>
                    { showTitle &&
                    <tr>
                        <th className="table-distance-header text-important text-center" colSpan={10}>{distance}</th>
                    </tr>
                    }
                    <tr>
                        <th className="col-lg">Name</th>
                        <th className="col-sm text-center">Place</th>
                        <th className="col-md text-center">Category</th>
                        <th className="overflow-hidden-lg col-md text-center">Tiger</th>
                        <th className="overflow-hidden-lg col-md text-center">Seward</th>
                        <th className="overflow-hidden-sm col-md text-center">Highest</th>
                        <th className="overflow-hidden-sm col-md text-center">Cougar</th>
                        <th className="col-md text-center">Total</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        sorted.map(result => {
                            if (result.anonymous === true) {
                                return (
                                    <tr key={result.bib}>
                                        <td>{`Bib ${result.bib}`}</td>
                                        <td className="text-center">{result.combined_score > 0 ? result.ranking : ""}</td>
                                        <td className="text-center">{result.age_group}</td>
                                        <td className="overflow-hidden-lg text-center">{result.tiger_score > 0 ? result.tiger_score.toFixed(2): "-"}</td>
                                        <td className="overflow-hidden-lg text-center">{result.seward_score > 0 ? result.seward_score.toFixed(2): "-"}</td>
                                        <td className="overflow-hidden-sm text-center">{result.highest_score > 0 ? result.highest_score.toFixed(2): "-"}</td>
                                        <td className="overflow-hidden-sm text-center">{result.cougar_score > 0 ? result.cougar_score.toFixed(2): "-"}</td>
                                        <td className="text-center">{result.combined_score > 0 ? result.combined_score.toFixed(2): "-"}</td>
                                    </tr>
                                );
                            }
                            return (
                                <tr key={result.bib}>
                                    <td>{`${result.first} ${result.last}`}</td>
                                    <td className="text-center">{result.combined_score > 0 ? result.ranking : ""}</td>
                                    <td className="text-center">{result.age_group}</td>
                                    <td className="overflow-hidden-lg text-center">{result.tiger_score > 0 ? result.tiger_score.toFixed(2): "-"}</td>
                                    <td className="overflow-hidden-lg text-center">{result.seward_score > 0 ? result.seward_score.toFixed(2): "-"}</td>
                                    <td className="overflow-hidden-sm text-center">{result.highest_score > 0 ? result.highest_score.toFixed(2): "-"}</td>
                                    <td className="overflow-hidden-sm text-center">{result.cougar_score > 0 ? result.cougar_score.toFixed(2): "-"}</td>
                                    <td className="text-center">{result.combined_score > 0 ? result.combined_score.toFixed(2): "-"}</td>
                                </tr>
                            );
                        })
                    }
                </tbody>
            </table>
        </div>
    )
}

export default YTPScoreTable