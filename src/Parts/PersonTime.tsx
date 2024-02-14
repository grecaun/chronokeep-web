import { Component } from 'react';
import FormatTime from './FormatTime';
import { PersonResultsProps } from '../Interfaces/props';
import { TimeResult } from '../Interfaces/types';

class PersonTime extends Component<PersonResultsProps> {
    render() {
        const results = this.props.results;
        let last: TimeResult | null = null;
        if (results.length > 0) {
            return (
                <div className="container-lg lg-max-width m-4 mx-auto shadow p-5">
                    <table className="table table-sm text-center">
                        <thead>
                            <tr>
                                <th className="table-distance-header text-important text-center" colSpan={6}>Lap Times</th>
                            </tr>
                            <tr>
                                <th></th>
                                <th>Lap Time</th>
                                <th>Total Time</th>
                            </tr>
                        </thead>
                        <tbody>
                        {
                        results.map((res, index) => {
                            let segName = res.segment;
                            if (segName === "Finish") {
                                segName = "Lap " + res.occurence;
                            }
                            let seconds = res.chip_seconds;
                            let milliseconds = res.chip_milliseconds;
                            if (last != null) {
                                milliseconds = res.chip_milliseconds - last.chip_milliseconds
                                seconds = res.chip_seconds - last.chip_seconds
                                if (milliseconds < 0) {
                                    milliseconds += 1000
                                    seconds -= 1
                                }
                            }
                            last = res
                            return(
                                <tr key={`segment${index}`}>
                                    <td>{segName}</td>
                                    <td>{FormatTime(seconds, milliseconds, res)}</td>
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

export default PersonTime;