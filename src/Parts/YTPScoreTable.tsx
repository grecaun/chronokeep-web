import { Checkbox, FormControlLabel } from '@mui/material';
import { YTPTableProps } from '../Interfaces/props';
import { YTPTimeResult } from '../Interfaces/types';
import { CSVLoader } from '../loaders/csv';
import Loading from './Loading';
import { Link } from 'react-router-dom';

function YTPScoreTable(props: YTPTableProps) {
    const results = props.results;
    const distance = props.distance;
    const showTitle = props.show_title;
    const info = props.info;
    const { state, setState } = CSVLoader(`https://downloads.chronokeep.com/${info.slug}/${info.year}/${distance}/ytp-standings.csv`)
    if (state.csv_loaded === false) {
        return (
            <Loading />
        );
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setState({
            ...state,
            limit_display: e.target.checked,
        })
    }

    const handleChangeGender = (e: React.ChangeEvent<HTMLInputElement>) => {
        setState({
            ...state,
            display_gender: e.target.checked,
        })
    }

    var overall_win: number
    var overall_f_win: number
    const prev_participants: { [index: string]: boolean } = {}
    results.map(result => {
        if (state.prev_standings[`${result.first} ${result.last}`] !== undefined) {
            result.highest_score = state.prev_standings[`${result.first} ${result.last}`].highest_score
            result.tiger_score = state.prev_standings[`${result.first} ${result.last}`].tiger_score
            result.seward_score = state.prev_standings[`${result.first} ${result.last}`].seward_score
            prev_participants[`${result.first} ${result.last}`] = true
            if (overall_win === undefined || overall_win === 0 || (overall_win > result.seconds && result.seconds > 0)) {
                overall_win = result.seconds
            }
            if (result.gender === "F" && (overall_f_win === undefined || overall_f_win === 0 || (overall_f_win > result.seconds && result.seconds > 0))) {
                overall_f_win = result.seconds
            }
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
            if (result.cougar_score > 100) {
                result.cougar_score = 100.0
            }
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
                highest_score: state.prev_standings[name].highest_score,
                tiger_score: state.prev_standings[name].tiger_score,
                seward_score: state.prev_standings[name].seward_score
            })
        }
    })
    const sorted = results.sort((a: YTPTimeResult, b: YTPTimeResult) => {
        // Combined scores at the top
        if (a.combined_score != 0 || b.combined_score != 0) {
            return b.combined_score - a.combined_score
        }
        // Runners who ran cougar are next
        if (a.cougar_score != 0 || b.cougar_score != 0) {
            return b.cougar_score - a.cougar_score
        }
        // Finally those who participated in a previous race
        return b.highest_score - a.highest_score
    })
    var ranking: number = 1
    const ageRanks: { [index: string]: number } = {}
    const gendRanks: { [index:string]: number } = {}
    const ageResults: { [index: string]: YTPTimeResult[] } = {}
    const gendResults: { [index: string]: YTPTimeResult[] } = {}
    sorted.map(result => {
        if (ageRanks[result.age_group] === undefined || ageRanks[result.age_group] <= 0) {
            ageRanks[result.age_group] = 1
        }
        if (gendRanks[result.gender] === undefined || gendRanks[result.gender] <= 0) {
            gendRanks[result.gender] = 1
        }
        if (result.highest_score > 0) {
            result.ranking = ranking
            result.age_ranking = ageRanks[result.age_group]
            result.gender_ranking = gendRanks[result.gender]
            ranking = ranking + 1
            ageRanks[result.age_group] = ageRanks[result.age_group] + 1
            gendRanks[result.gender] = gendRanks[result.gender] + 1
        } else {
            result.ranking = 0
            result.age_ranking = 0
            result.gender_ranking = 0
        }
        if (ageResults[result.age_group] === undefined) {
            ageResults[result.age_group] = []
        }
        if (gendResults[result.gender] === undefined) {
            gendResults[result.gender] = []
        }
        if (state.limit_display !== true || (ageResults[result.age_group].length < 3 && result.combined_score > 0)) {
            ageResults[result.age_group].push(result)
        }
        if ((result.gender_ranking <= 3 && result.gender_ranking > 0) || (state.limit_display === false && state.display_gender === true)) {
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
            <div className="row container-lg md-max-width mx-auto p-0 my-2 justify-content-center">
                <div className='col-md-6 d-flex justify-content-center'>
                    <FormControlLabel
                        label='Limit Display to Completions & Top 3'
                        control={
                            <Checkbox
                                checked={state.limit_display === true}
                                onChange={handleChange}
                                />
                        }
                    />
                </div>
                <div className='col-md-6 d-flex justify-content-center'>
                    <FormControlLabel
                        label='Display Gender Results'
                        control={
                            <Checkbox
                                checked={state.display_gender === true || state.limit_display===true}
                                onChange={handleChangeGender}
                                disabled={state.limit_display===true}
                                />
                        }
                    />
                </div>
            </div>
            { showTitle &&
                <div className="awards-header text-important text-center" key={distance} id={distance}>{distance}</div>
            }
            { (state.limit_display === true || state.display_gender === true) && genders.map(gender => {
                return(
                    <div key={gender}>
                    {
                        gendResults[gender] !== undefined && gendResults[gender].length > 0 &&
                        <div className="table-responsive-sm m-3" key={gender} id={gender}>
                            <table className="table table-sm">
                                <thead>
                                    <tr>
                                        <th className="table-distance-header text-important text-center" colSpan={10}>{gender === 'F' ? 'Female Overall' : gender === 'M' ? 'Male Overall' : 'Non-Binary Overall'}</th>
                                    </tr>
                                    <tr>
                                        <th className="col-lg">Name</th>
                                        <th className="col-sm text-center">Place</th>
                                        <th className="overflow-hidden-lg col-md text-center">Tiger</th>
                                        <th className="overflow-hidden-lg col-md text-center">Seward</th>
                                        <th className="overflow-hidden-sm col-md text-center">Highest</th>
                                        <th className="overflow-hidden-sm col-md text-center">Cougar</th>
                                        <th className="col-md text-center">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                {
                                    gendResults[gender].map(result => {
                                        return (
                                            <tr key={`${result.first}${result.last}-gend`}>
                                                <td><Link to={`/ytp-series/${info.slug}/${info.year}/${result.bib}`} className="nav-link m-0 p-0">{result.anonymous === true ? `Bib ${result.bib}` : `${result.first} ${result.last}`}</Link></td>
                                                <td className="text-center">{result.combined_score > 0 ? result.gender_ranking : ""}</td>
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
                    }
                    </div>
                )
            })}
            { (state.limit_display === true || state.display_gender === false) && ageGroups.map(group => {
                return(
                    <div key={group}>
                    {
                        ageResults[group] !== undefined && ageResults[group].length > 0 &&
                        <div className="table-responsive-sm m-3" key={group} id={group}>
                            <table className="table table-sm">
                                <thead>
                                    <tr>
                                        <th className="table-distance-header text-important text-center" colSpan={10}>{group}</th>
                                    </tr>
                                    <tr>
                                        <th className="col-lg">Name</th>
                                        <th className="col-sm text-center">Place</th>
                                        <th className="overflow-hidden-lg col-md text-center">Tiger</th>
                                        <th className="overflow-hidden-lg col-md text-center">Seward</th>
                                        <th className="overflow-hidden-sm col-md text-center">Highest</th>
                                        <th className="overflow-hidden-sm col-md text-center">Cougar</th>
                                        <th className="col-md text-center">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                {
                                    ageResults[group].map(result => {
                                        return (
                                            <tr key={`${result.first}${result.last}`}>
                                                <td><Link to={`/ytp-series/${info.slug}/${info.year}/${result.bib}`} className="nav-link m-0 p-0">{result.anonymous === true ? `Bib ${result.bib}` : `${result.first} ${result.last}`}</Link></td>
                                                <td className="text-center">{result.combined_score > 0 ? result.age_ranking : ""}</td>
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
                    }
                    </div>
                )
            })}
        </div>
    )
}

export default YTPScoreTable