import React, { Component } from 'react';
import FormatTime from './FormatTime';

class PersonTime extends Component {
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
        if (results.length > 0){
            return (
                <div className="container-lg lg-max-width m-4 mx-auto shadow p-5">
                    <table className="table table-sm text-center">
                        <thead>
                            <tr>
                                <th className="table-distance-header text-important text-center" colSpan="6">Lap Times</th>
                            </tr>
                            <tr>
                                <th></th>
                                { distance !== null &&
                                <th className="overflow-hidden-lg">Pace</th>
                                }
                                <th>Chip Time</th>
                                <th>Gun Time</th>
                            </tr>
                        </thead>
                        <tbody>
                        {
                        results.map((res, index) => {
                            return(
                                <tr key={`segment${index}`}>
                                    <td>{res.segment}</td>
                                    { distance !== null &&
                                    <td className="overflow-hidden-lg">{FormatTime(res.chip_seconds / distance.dist, 0, res, true)}</td>
                                    }
                                    <td>{FormatTime(res.chip_seconds, res.chip_milliseconds, res)}</td>
                                    <td>{FormatTime(res.seconds, res.milliseconds, res)}</td>
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

export default PersonTime;