import { Component } from 'react';
import FormatTime from './FormatTime';
import { TimeResult } from '../Interfaces/types';
import { PNTFTableProps } from '../Interfaces/props';

class PNTFAwardsTable extends Component<PNTFTableProps> {
    render() {
        const results = this.props.results;
        const distance = this.props.distance;
        const showTitle = this.props.showTitle;
        const divisionResults: { [index: string]: TimeResult[] } = {}
        results.map(result => {
            var gender = ''
            if (result.gender === 'Woman' || result.gender === 'F' || result.gender === 'W' || result.gender === 'Female') {
                gender = "Women's"
            } else if (result.gender === 'Man' || result.gender === 'M' || result.gender === 'Male') {
                gender = "Men's"
            } else {
                gender = "Non-Binary"
            }
            const division = result.age >= 40 ? 'Masters' : 'Open'
            result.division = `${gender} ${division}`
            if (divisionResults[result.division] === undefined) {
                divisionResults[result.division] = []
            }
            if (result.division_ranking <= 5){
                divisionResults[result.division].push(result)
            }
        })
        const divisions = [
            "Women's Open",
            "Women's Masters",
            "Men's Open",
            "Men's Masters",
            "Non-Binary Open",
            "Non-Binary Masters",
        ]
        console.log(divisionResults)
        return (
            <div>
                { showTitle &&
                    <div className="awards-header text-important text-center" key={distance} id={distance}>{distance}</div>
                }
                { divisions.map(division => {
                    return(
                        <div key={division}>
                            {
                            divisionResults[division] !== undefined && divisionResults[division].length > 0 &&
                            <div className="table-responsive-sm m-3" key={division} id={division}>
                                <table className="table table-sm">
                                    <thead>
                                        <tr>
                                            <th className="table-distance-header text-important text-center" colSpan={10}>{division}</th>
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
                                        divisionResults[division].map(result => {
                                            return (
                                                <tr key={result.bib}>
                                                    <td className="overflow-hidden-sm text-center">{result.bib}</td>
                                                    <td className="text-center">{result.division_ranking}</td>
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
}

export default PNTFAwardsTable