import { Component } from 'react';
import FormatTime from './FormatTime';
import { PersonResultsProps } from '../Interfaces/props';

class PersonDistance extends Component<PersonResultsProps> {
    render() {
        const results = this.props.results;
        const gender = this.props.gender;
        if (results.length > 0) {
            return (
                <div className="container-lg lg-max-width m-4 mx-auto shadow p-5">
                    <table className="table table-sm text-center">
                        <thead>
                            <tr>
                                <th className="table-distance-header text-important text-center" colSpan={6}>Partial Times</th>
                            </tr>
                            <tr>
                                <th>Segment</th>
                                <th className="overflow-hidden-sm">Place</th>
                                <th className="overflow-hidden-sm">Age Pl</th>
                                <th className="overflow-hidden-sm">Gender Pl</th>
                                <th>Time</th>
                            </tr>
                        </thead>
                        <tbody>
                        {
                        results.map((res, index) => {
                            return(
                                <tr key={`segment${index}`}>
                                    <td>{res.segment}</td>
                                    <td className="overflow-hidden-sm">{res.ranking > 0 ? res.ranking : ''}</td>
                                    <td className="overflow-hidden-sm">{(gender === "U" || gender === "u" || gender === "O" || gender === "o") ? "" : res.age_ranking > 0 ? res.age_ranking : ''}</td>
                                    <td className="overflow-hidden-sm">{(gender === "U" || gender === "u" || gender === "O" || gender === "o") ? "" : res.gender_ranking > 0 ? res.gender_ranking : ''}</td>
                                    <td>{FormatTime(res.chip_seconds, res.chip_milliseconds, res)}</td>
                                </tr>
                            );
                        })
                        }
                        </tbody>
                    </table>
                </div>
            );
        } else {
            return (null);
        }
    }
}

export default PersonDistance;