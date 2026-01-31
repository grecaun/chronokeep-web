import Loading from '../Parts/Loading';
import ErrorMsg from '../Parts/ErrorMsg';
import { useParams } from 'react-router-dom';
import { ResultsLoader } from '../loaders/results';

function Status() {
    document.title = `Chronokeep - Status`
    const params = useParams();
    const { state } = ResultsLoader(params, 'status');
    if (state.error === true) {
        document.title = `Chronokeep - Error`
        return (
            <ErrorMsg status={state.status} message={state.message} />
        );
    }
    if (state.loading === true) {
        return (
            <Loading />
        );
    }
    const distances = Object.keys(state.results)
    document.title = `Chronokeep - ${state.year!.year} ${state.event!.name} Status`
    return (
        <div>
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
                                let min = -1;
                                let max = -1;
                                let nonIntegerBib = false;
                                for (const res of state.results[distance]) {
                                    const num = parseInt(res.bib)
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
                                const loops = Math.ceil(max - min)
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
                                        <div className={`row status-row`} key={`status${i}`}>
                                            { map.map((status, i) => {
                                                const bib = min + i;
                                                let last_row = ''
                                                if (loops - 1 === i) {
                                                    last_row = 'status-last'
                                                }
                                                return (
                                                    <div className={`col ${last_row} status-col status-${status}`}>{bib}</div>
                                                )
                                            }) }
                                        </div>
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

export default Status;