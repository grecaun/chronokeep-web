import React, { Component } from 'react';
import FormatTime from './FormatTime';

class PersonDistance extends Component {
    constructor(props) {
        super(props);

        this.state = {
            results: props.results,
            distance: props.distance,
        }
    }

    render() {
        const results = this.state.results;
        const distance = this.state.distance;
        if (results.length > 0) {
            return (
                <div className="container-lg lg-max-width m-4 mx-auto shadow p-5">
                    <table className="table table-sm text-center">
                        <thead>
                            <tr>
                                <th className="table-distance-header text-important text-center" colSpan="6">Partial Times</th>
                            </tr>
                            <tr>
                                <th>Segment</th>
                                <th className="overflow-hidden-sm">Place</th>
                                <th className="overflow-hidden-sm">Age Pl</th>
                                <th className="overflow-hidden-sm">Gender Pl</th>
                                { distance !== null &&
                                <th className="overflow-hidden-lg">Pace</th>
                                }
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
                                    <td className="overflow-hidden-sm">{res.age_ranking > 0 ? res.age_ranking : ''}</td>
                                    <td className="overflow-hidden-sm">{res.gender_ranking > 0 ? res.gender_ranking : ''}</td>
                                    { distance !== null &&
                                    <td className="overflow-hidden-lg">{FormatTime(res.chip_seconds / distance.dist, 0, res, true)}</td>
                                    }
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