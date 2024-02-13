import { Component } from 'react';
import ResultsTable from '../Parts/ResultsTable';
import TimeResultsTable from '../Parts/TimeResultsTable';
import Header from '../Parts/Header';
import Footer from '../Parts/Footer';
import Loading from '../Parts/Loading';
import ErrorMsg from '../Parts/ErrorMsg';
import DateString from '../Parts/DateString';
import { useParams } from 'react-router-dom';
import { ParamProps } from '../Interfaces/props';
import { ResultsState } from '../Interfaces/states';
import { EventYear } from '../Interfaces/types';

class Results extends Component<ParamProps, ResultsState> {
    state: ResultsState = {
        count: 0,
        event: null,
        years: [],
        year: null,
        results: {},
        status: 0,
        loading: true,
        error: false,
        message: null
    }

    componentDidMount() {
        const params = this.props.params
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
        document.title = `Chronokeep - Results`
        const params = this.props.params
        const state = this.state
        if (state.error === true) {
            document.title = `Chronokeep - Error`
            return (
                <div>
                    <Header page={"results"} />
                    <ErrorMsg status={state.status} message={state.message} />
                    <Footer />
                </div>
            );
        }
        if (state.loading === true) {
            return (
                <div>
                    <Header page={"results"} />
                    <div className="mx-auto sm-max-width text-center container-md border border-light p-5 pt-4">
                        <h1 className="text-important display-4">Loading Results</h1>
                        <Loading />
                    </div>
                    <Footer />
                </div>
            );
        }
        const distances = Object.keys(state.results)
        const years = state.years.sort((a: EventYear, b: EventYear) => {
            return Date.parse(a.date_time) - Date.parse(b.date_time)
        })
        const info = {
            slug: params.slug,
            year: state.year?.year
        }
        document.title = `Chronokeep - ${state.year!.year} ${state.event!.name} Results`
        return (
            <div>
                <Header page={"results"} />
                <div className="row container-lg lg-max-width mx-auto d-flex mt-4 mb-3 align-items-stretch">
                    <div className="col-md-10 flex-fill text-center mx-auto m-1">
                        <p className="text-important mb-2 mt-1 h1">{`${state.year!.year} ${state.event!.name} Results`}</p>
                        <p className="text-important h4">{DateString(state.year!.date_time)}</p>
                    </div>
                    { years.length > 1 && 
                        <div className="col-md-2 nav flex-md-column justify-content-center p-0">
                            {
                                years.map((year, index) => {
                                    var className = "nav-link text-center text-important text-secondary"
                                    if (year.year === state.year!.year) {
                                        className = "nav-link disabled text-center text-important text-dark"
                                    }
                                    return <a href={`/results/${params.slug}/${year.year}`} key={`year${index}`} className={className}>{year.year}</a>
                                })
                            }
                        </div>
                    }
                </div>
                { distances.length > 0 &&
                <div>
                    <div className="row container-lg lg-max-width mx-auto d-flex align-items-stretch shadow-sm p-0 mb-3 border border-light">
                        <div className="p-0">
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
                            <div id="results-parent">
                                {
                                    distances.map((distance, index) => {
                                        if (state.event!.type === "time") {
                                            return (
                                                <TimeResultsTable distance={distance} results={state.results[distance]} info={info} key={index} showTitle={distances.length > 1}/>
                                            )
                                        } else {
                                            return (
                                                <ResultsTable distance={distance} results={state.results[distance]} info={info} key={index} showTitle={distances.length > 1}/>
                                            )
                                        }
                                    })
                                }
                            </div>
                        </div>
                    </div>
                    <div id='disclaimer' className='container-lg lg-max-width shadow-sm text-center p-3 mb-3 border border-light overflow-hidden-lg'>*Results are ranked based upon the Time and not the Chip Time.</div>
                </div>
                }
                { distances.length === 0 &&
                <div className="container-lg lg-max-width shadow-sm p-5 mb-3 border border-light">
                    <div className="text-center">
                        <h2>No results to display.</h2>
                    </div>
                </div>
                }
            </div>
        )
    }
}

export default (props: any) => (
    <Results
        {...props}
        params={useParams()}
    />);