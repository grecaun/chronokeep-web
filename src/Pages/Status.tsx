import { Component } from 'react';
import Header from '../Parts/Header';
import Footer from '../Parts/Footer';
import Loading from '../Parts/Loading';
import ErrorMsg from '../Parts/ErrorMsg';
import { useParams } from 'react-router-dom';
import { ParamProps } from '../Interfaces/props';
import { ResultsState } from '../Interfaces/states';

class Status extends Component<ParamProps, ResultsState> {
    state: ResultsState = {
        status: 0,
        loading: true,
        error: false,
        message: null,
        count: 0,
        event: null,
        years: [],
        year: null,
        results: {}
    }

    componentDidMount() {
        const params = this.props.params;
        const BASE_URL = import.meta.env.VITE_CHRONOKEEP_API_URL;
        const requestOptions = {
            method: 'POST',
            body: JSON.stringify({ slug: params.slug, year: params.year }),
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + import.meta.env.VITE_CHRONOKEEP_ACCESS_TOKEN
            }
        }
        fetch(BASE_URL + 'results', requestOptions)
        .then(response => {
            if (response.status === 200) {
                this.setState({
                    status: response.status
                });
            } else {
                this.setState({
                    error: true,
                    status: response.status
                });
            }
            return response.json();
        })
        .then(data => {
            this.setState({
                loading: false,
                message: data.message ? data.message : null,
                count: data.count,
                event: data.event,
                years: data.years,
                year: data.event_year,
                results: data.results
            });
        })
        .catch(error => {
            this.setState({
                error: true,
                message: error.toString()
            });
            console.error("There was an error!", error)
        })
    }

    render() {
        document.title = `Chronokeep - Status`
        const state = this.state
        if (state.error === true) {
            document.title = `Chronokeep - Error`
            return (
                <div>
                    <Header page={"status"} />
                    <ErrorMsg status={state.status} message={state.message} />
                    <Footer />
                </div>
            );
        }
        if (state.loading === true) {
            return (
                <div>
                    <Header page={"status"} />
                    <div className="mx-auto sm-max-width text-center container-md border border-light p-5 pt-4">
                        <h1 className="text-important display-4">Loading Status</h1>
                        <Loading />
                    </div>
                    <Footer />
                </div>
            );
        }
        const distances = Object.keys(state.results)
        document.title = `Chronokeep - ${state.year!.year} ${state.event!.name} Status`
        return (
            <div>
                <Header page={"status"} />
                { distances.length > 0 &&
                <div className="row container-lg lg-max-width mx-auto d-flex align-items-stretch shadow-sm p-0 mb-3 border border-light">
                    <div className="p-0">
                        <div className='status-key row justify-content-md-center'>
                            <div className='col col-lg-1 status-col row-last status-0'>DNS</div>
                            <div className='col col-lg-1 status-col row-last status-3'>DNF</div>
                            <div className='col col-lg-1 status-col row-last status-1'>Started</div>
                            <div className='col col-lg-1 status-col status-last row-last status-2'>Finished</div>
                        </div>
                        <ul className="nav nav-tabs nav-fill">
                            { distances.length > 1 &&
                                distances.map((distance, index) => {
                                    return (
                                        <li className="nav-item" key={`distance${index}`}>
                                            <a className="nav-link text-important h5 text-secondary" href={`#${distance}`} role="button">{distance}</a>
                                        </li>
                                    );
                                })
                            }
                        </ul>
                        <div id="status-parent">
                            {
                                distances.map((distance, index) => {
                                    const map: { [index: number]: number } = {}
                                    var min = -1;
                                    var max = -1;
                                    var nonIntegerBib = false;
                                    for (let res of state.results[distance]) {
                                        let num = parseInt(res.bib)
                                        if (Number.isNaN(num)) {
                                            nonIntegerBib = true;
                                            break;
                                        }
                                        if (min === -1 || num <= min) {
                                            min = num
                                        }
                                        if (max === -1 || num >= max) {
                                            max = num
                                        }
                                        if (res.type === 3 || res.type === 30) {
                                            map[num] = 3
                                        } else if (res.finish === true) {
                                            map[num] = 2
                                        } else {
                                            map[num] = 1
                                        }
                                    }
                                    var loops = Math.ceil((max - min) / 10)
                                    if (nonIntegerBib === true) {
                                        return(
                                            <div key={`distance${index}`}>
                                                <div className="table-distance-header text-important text-center">Non-number bib found. Unable to process.</div>
                                            </div>
                                        )
                                    }
                                    return (
                                        <div className="table-responsive-sm m-3" key={distance} id={distance}>
                                                { distances.length > 1 &&
                                                    <div className="table-distance-header text-important text-center">{distance}</div>
                                                }
                                                { [...Array(loops)].map((_, i) => {
                                                    const start = min + (i*10)
                                                    let stat_map: { [index: number]: number } = {}
                                                    for (let x = 0; x < 10; x ++) {
                                                        if ((start+x) in map) {
                                                            stat_map[x] = map[start+x]
                                                        } else {
                                                            stat_map[x] = 0
                                                        }
                                                    }
                                                    var last_row = ''
                                                    if (loops - 1 === i) {
                                                        last_row = 'row-last'
                                                    }
                                                    return (
                                                        <div className={`row status-row`} key={`status${i}`}>
                                                            <div className={`col ${last_row} status-col status-${stat_map[0]}`}>{start}</div>
                                                            <div className={`col ${last_row} status-col status-${stat_map[1]}`}>{start+1}</div>
                                                            <div className={`col ${last_row} status-col status-${stat_map[2]}`}>{start+2}</div>
                                                            <div className={`col ${last_row} status-col status-${stat_map[3]}`}>{start+3}</div>
                                                            <div className={`col ${last_row} status-col status-${stat_map[4]}`}>{start+4}</div>
                                                            <div className={`col ${last_row} status-col status-${stat_map[5]}`}>{start+5}</div>
                                                            <div className={`col ${last_row} status-col status-${stat_map[6]}`}>{start+6}</div>
                                                            <div className={`col ${last_row} status-col status-${stat_map[7]}`}>{start+7}</div>
                                                            <div className={`col ${last_row} status-col status-${stat_map[8]}`}>{start+8}</div>
                                                            <div className={`col ${last_row} status-col status-last status-${stat_map[9]}`}>{start+9}</div>
                                                        </div>
                                                    )
                                                })}
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </div>
                </div>
                }
                { distances.length === 0 &&
                <div className="container-lg lg-max-width shadow-sm p-5 mb-3 border border-light">
                    <div className="text-center">
                        <h2>No status information to display.</h2>
                    </div>
                </div>
                }
            </div>
        )
    }
}

export default (props: any) => (
    <Status
        {...props}
        params={useParams()}
    />);