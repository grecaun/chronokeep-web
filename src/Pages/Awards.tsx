import { Component } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import AwardsTable from '../Parts/AwardsTable';
import TimeAwardsTable from '../Parts/TimeAwardsTable';
import Header from '../Parts/Header';
import Footer from '../Parts/Footer';
import Loading from '../Parts/Loading';
import ErrorMsg from '../Parts/ErrorMsg';
import DateString from '../Parts/DateString';

import { SearchParamProps } from '../Interfaces/props';
import { AwardsState } from '../Interfaces/states';

class Awards extends Component<SearchParamProps, AwardsState> {
    constructor(props: any) {
        super(props);
        const params = this.props.search_params;
        this.setState({
            status: 0,
            loading: true,
            error: false,
            message: null,
            numAG: Number(params.get("ag")) < 0 ? 3 : Number(params.get("ag")),
            numOV: Number(params.get("ov")) < 0 ? 3 : Number(params.get("ov")),
            overallInc: params.get("inc") === "true",
            grandMasters: params.get("gmas") === "true",
            masters: params.get("mas") === "true",
            count: 0,
            event: null,
            years: [],
            year: null,
            results: {}
        });
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
                message: data.message ? data.message : "",
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

    pushHistory() {
        const [_, setSearchParams] = useSearchParams();
        setSearchParams(params => {
            params.set("ov", this.state.numOV.toString());
            params.set("ag", this.state.numAG.toString())
            params.set("inc", this.state.overallInc ? "true" : "false")
            params.set("gmas", this.state.grandMasters ? "true" : "false")
            params.set("mas", this.state.masters ? "true" : "false")
            return params;
        });
    }

    handleAGChange (event: any) {
        this.setState({
            numAG: Number(event.target.value)
        }, () => {
            this.pushHistory();
        })
    }

    handleOVChange(event: any) {
        this.setState({
            numOV: Number(event.target.value)
        }, () => {
            this.pushHistory();
        })
    }

    handleOverallChange(event: any) {
        this.setState({
            overallInc: event.target.checked
        }, () => {
            this.pushHistory();
        })
    }

    handleMastersChange(event: any) {
        this.setState({
            masters: event.target.checked
        }, () => {
            this.pushHistory();
        })
    }

    handleGrandMastersChange(event: any) {
        this.setState({
            grandMasters: event.target.checked
        }, () => {
            this.pushHistory();
        })
    }

    render() {
        const params = this.props.params;
        document.title = `Chronokeep - Awards`
        const state = this.state
        if (state.error === true) {
            document.title = `Chronokeep - Error`
            return (
                <div>
                    <Header page={"awards"} />
                    <ErrorMsg status={state.status} message={state.message} />
                    <Footer />
                </div>
            );
        }
        if (state.loading === true) {
            return (
                <div>
                    <Header page={"awards"} />
                    <div className="mx-auto sm-max-width text-center container-md border border-light p-5 pt-4">
                        <h1 className="text-important display-4">Loading Results</h1>
                        <Loading />
                    </div>
                    <Footer />
                </div>
            );
        }
        const distances = Object.keys(state.results)
        const years = state.years.sort((a, b) => {
            return Date.parse(a.date_time) - Date.parse(b.date_time)
        })
        const info = {
            slug: params.slug,
            year: state.year?.year
        }
        document.title = `Chronokeep - ${state.year?.year} ${state.event?.name} Awards`
        return (
            <div>
                <Header page={"awards"} />
                <div className="row container-lg lg-max-width mx-auto d-flex mt-4 mb-3 align-items-stretch">
                    <div className="col-md-10 flex-fill text-center mx-auto m-1">
                        <p className="text-important mb-2 mt-1 h1">{`${state.year?.year} ${state.event?.name} Awards`}</p>
                        <p className="text-important h4">{DateString(state.year!.date_time)}</p>
                    </div>
                    { years.length > 1 && 
                        <div className="col-md-2 nav flex-md-column justify-content-center p-0">
                            {
                                years.map((year, index) => {
                                    var className = "nav-link text-center text-important text-secondary"
                                    if (year.year === state.year?.year) {
                                        className = "nav-link disabled text-center text-important text-dark"
                                    }
                                    return <a href={`/results/${params.slug}/${year.year}`} key={`year${index}`} className={className}>{year.year}</a>
                                })
                            }
                        </div>
                    }
                </div>
                { distances.length > 0 &&
                <div className="row container-lg lg-max-width mx-auto d-flex align-items-stretch shadow-sm p-0 border border-light">
                    <div className='awards-options row align-items-center'>
                        <div className='col'>
                            <label htmlFor="numberOVWinners">Number of Overall Awards</label>
                            <select className="form-select" aria-label="Default select count" defaultValue={state.numOV} id="numberOVWinners" onChange={this.handleOVChange}>
                                <option value="0">Zero</option>
                                <option value="1">One</option>
                                <option value="2">Two</option>
                                <option value="3">Three</option>
                                <option value="4">Four</option>
                                <option value="5">Five</option>
                                <option value="6">Six</option>
                                <option value="7">Seven</option>
                                <option value="8">Eight</option>
                                <option value="9">Nine</option>
                                <option value="10">Ten</option>
                            </select>
                        </div>
                        <div className='col'>
                            <label htmlFor="numberAGWinners">Number of Age Group Awards</label>
                            <select className="form-select" aria-label="Default select count" defaultValue={state.numAG} id="numberAGWinners" onChange={this.handleAGChange}>
                                <option value="0">Zero</option>
                                <option value="1">One</option>
                                <option value="2">Two</option>
                                <option value="3">Three</option>
                                <option value="4">Four</option>
                                <option value="5">Five</option>
                                <option value="6">Six</option>
                                <option value="7">Seven</option>
                                <option value="8">Eight</option>
                                <option value="9">Nine</option>
                                <option value="10">Ten</option>
                            </select>
                        </div>
                    </div>
                    <div className='awards-options-bottom row align-items-center'>
                        <div className="col">
                            <div className="form-check form-check-inline">
                                <input className="form-check-input" type="checkbox" id="overallIncluded" checked={state.overallInc} onChange={this.handleOverallChange} />
                                <label className="form-check-label" htmlFor="overallIncluded">Include overall in age groups?</label>
                            </div>
                        </div>
                        <div className="col">
                            <div className="form-check form-check-inline">
                                <input className="form-check-input" type="checkbox" id="masters" checked={state.masters} onChange={this.handleMastersChange} />
                                <label className="form-check-label" htmlFor="masters">Display Masters Group?</label>
                            </div>
                        </div>
                        <div className="col">
                            <div className="form-check form-check-inline">
                                <input className="form-check-input" type="checkbox" id="grandMasters" checked={state.grandMasters} onChange={this.handleGrandMastersChange} />
                                <label className="form-check-label" htmlFor="grandMasters">Display Grand Masters Group?</label>
                            </div>
                        </div>
                    </div>
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
                                distances.map((distance: any, index) => {
                                    if (state.event?.type === "time") {
                                        return (
                                            <TimeAwardsTable
                                                distance={distance}
                                                results={state.results[distance]}
                                                info={info}
                                                key={index}
                                                showTitle={distances.length > 1}
                                                numberAG={state.numAG}
                                                numberOV={state.numOV}
                                                overallInc={state.overallInc}
                                                grandMasters={state.grandMasters}
                                                masters={state.masters}
                                                />
                                        )
                                    } else {
                                        return (
                                            <AwardsTable
                                                distance={distance}
                                                results={state.results[distance]}
                                                info={info}
                                                key={index}
                                                showTitle={distances.length > 1}
                                                numberAG={state.numAG}
                                                numberOV={state.numOV}
                                                overallInc={state.overallInc}
                                                grandMasters={state.grandMasters}
                                                masters={state.masters}
                                                />
                                        )
                                    }
                                })
                            }
                        </div>
                    </div>
                </div>
                }
                { distances.length === 0 &&
                <div className="container-lg lg-max-width shadow-sm p-5 border border-light">
                    <div className="text-center">
                        <h2>No awards to display.</h2>
                    </div>
                </div>
                }
            </div>
        )
    }
}

export default (props: any) => (
    <Awards
        {...props}
        params={useParams()}
        search_params={useSearchParams()}
    />);