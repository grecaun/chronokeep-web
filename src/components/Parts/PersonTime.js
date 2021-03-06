import React, { Component } from 'react';
import FormatTime from './FormatTime';

class PersonTime extends Component {
    constructor(props) {
        super(props);

        this.state = {
            results: props.results,
        }
    }

    render() {
        const results = this.state.results;
        var last = null;
        if (results.length > 0) {
            return (
                <div className="container-lg lg-max-width m-4 mx-auto shadow p-5">
                    <table className="table table-sm text-center">
                        <thead>
                            <tr>
                                <th className="table-distance-header text-important text-center" colSpan="6">Lap Times</th>
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
                            var segName = res.segment;
                            if (segName === "Finish") {
                                segName = "Lap " + res.occurence;
                            }
                            var seconds = res.chip_seconds;
                            var milliseconds = res.chip_milliseconds;
                            if (last != null) {
                                milliseconds = res.chip_milliseconds - last.chip_milliseconds
                                seconds = res.chip_seconds - last.chip_seconds
                                if (milliseconds < 0) {
                                    milliseconds += 1000
                                    seconds -= 1
                                }
                            }
                            console.log(last)
                            console.log(seconds)
                            console.log(milliseconds)
                            console.log("break")
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