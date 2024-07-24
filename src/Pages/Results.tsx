import ResultsTable from '../Parts/ResultsTable';
import TimeResultsTable from '../Parts/TimeResultsTable';
import Loading from '../Parts/Loading';
import ErrorMsg from '../Parts/ErrorMsg';
import DateString from '../Parts/DateString';
import { useParams } from 'react-router-dom';
import { EventYear, SmsSubscription } from '../Interfaces/types';
import { ResultsLoader } from '../loaders/results';
import Select from 'react-select';
import { ResultsState, SortByItem } from '../Interfaces/states';
import { Formik, Form } from 'formik';
import Autocomplete from "@mui/material/Autocomplete"
import { TextField } from '@mui/material';
import Modal from '../Parts/Modal';
import * as Yup from 'yup';
import { SendAddSmsSubscription } from '../loaders/sms_subscription';

function hideModal(state: ResultsState, setState: React.Dispatch<React.SetStateAction<ResultsState>>) {
    setState({
        ...state,
        show_sms_modal: false,
        subscription: null,
    })
}

function showModal(state: ResultsState, setState: React.Dispatch<React.SetStateAction<ResultsState>>, sub: SmsSubscription) {
    setState({
        ...state,
        show_sms_modal: true,
        subscription: sub,
    })
}

async function addSubscription(state: ResultsState, setState: React.Dispatch<React.SetStateAction<ResultsState>>) {
    try {
        const success = await SendAddSmsSubscription(
            state.event?.slug!,
            state.year?.year!,
            state.subscription?.bib!,
            state.subscription?.first!,
            state.subscription?.last!,
            state.subscription?.phone!)
        if (success === true) {
            hideModal(state, setState)
        } else {
            showErrorModal(state, setState)
        }
    }
    catch {
        showErrorModal(state, setState)
    }
}

function showErrorModal(state: ResultsState, setState: React.Dispatch<React.SetStateAction<ResultsState>>) {
    setState({
        ...state,
        show_sms_modal: false,
        subscription: null,
        show_sms_error_modal: true,
    })
}

function hideErrorModal(state: ResultsState, setState: React.Dispatch<React.SetStateAction<ResultsState>>) {
    setState({
        ...state,
        show_sms_modal: false,
        subscription: null,
        show_sms_error_modal: false,
    })
}

const initialValues = {
    part_id: { bib: "", first: "", last: "", age_group: "", gender: "", distance: "" },
    phone: ''
}

function Results() {
    const params = useParams();
    const { state, setState } = ResultsLoader(params, 'results');
    document.title = `Chronokeep - Results`
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
    const years = state.years.sort((a: EventYear, b: EventYear) => {
        return Date.parse(a.date_time) - Date.parse(b.date_time)
    })
    const info = {
        slug: params.slug,
        year: state.year?.year
    }

    const phoneRegex = new RegExp("^(\\+?1)?\\s?\\(?\\d{3}[\\s\\-]?\\d{3}[\\s\\-]?\\d{4}$");

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        setState({
            ...state,
            search: e.target.value.trim().toLocaleLowerCase()
        })
    }

    const options = [
        { value: 0, label: "Sort by Ranking" },
        { value: 1, label: "Sort by Gender" },
        { value: 2, label: "Sort by Age Group" },
    ]

    const defaultSort = { value: 0, label: "Sort by Ranking" }
    const textAllowedTime = new Date(Date.parse(state.year!.date_time) + (1000 * 60 * 60 * 24 * state.year!.days_allowed))
    const nowDate = new Date(Date.now())
    const days_allowed = state.year?.days_allowed ?? 0;

    document.title = `Chronokeep - ${state.year!.year} ${state.event!.name} Results`
    return (
        <div>
            <div className="row container-lg lg-max-width mx-auto d-flex mt-4 mb-3 align-items-stretch">
                <div className="col-md-10 flex-fill text-center mx-auto m-1">
                    <p className="text-important mb-2 mt-1 h1">{`${state.year!.year} ${state.event!.name} Results`}</p>
                    <p className="text-important h4">{DateString(state.year!.date_time)}</p>
                </div>
                { years.length > 1 && 
                    <div className="col-md-2 nav flex-md-column justify-content-center p-0">
                        {
                            years.map((year, index) => {
                                let className = "nav-link text-center text-important text-secondary"
                                if (year.year === state.year!.year) {
                                    className = "nav-link disabled text-center text-important text-dark"
                                }
                                return <a href={`/results/${params.slug}/${year.year}`} key={`year${index}`} className={className}>{year.year}</a>
                            })
                        }
                    </div>
                }
            </div>
            { textAllowedTime > nowDate && state.participants.length > 0 && days_allowed > 0 &&
                <div className='row container-lg lg-max-width mx-auto d-flex mt-4 mb-3 align-items-stretch'>
                    <Formik
                        enableReinitialize={true}
                        initialValues={initialValues}
                        onSubmit={({ part_id, phone }, { resetForm }) => {
                            showModal(state, setState, {bib: part_id.bib, first: part_id.first, last: part_id.last, phone: phone})
                            console.log("boop")
                            resetForm()
                        }}
                        validationSchema={Yup.object().shape({
                            phone: Yup.string().matches(phoneRegex, 'Phone number is not valid.').required('Phone number is required.')
                        })}
                        >
                        {({ errors, touched, setFieldValue, handleChange, handleBlur, values }) => (
                            <Form>
                                <Modal
                                    id="sms-modal"
                                    show={state.show_sms_modal}
                                    handleClose={() => { hideModal(state, setState) }}
                                    save={() => { addSubscription(state, setState)} }
                                    title="Warning"
                                    text="By subscribing to text alerts for this participant you acknowledge that you are the owner of this phone number or authorized on their behalf to consent to receive sms messages. Standard messaging rates apply."
                                    saveText="Subscribe"
                                    />
                                <Modal
                                    id="sms-error-modal"
                                    show={state.show_sms_error_modal}
                                    handleClose={() => { hideErrorModal(state, setState) }}
                                    save={() => { hideErrorModal(state, setState)} }
                                    title="Error"
                                    text="There was an error subscribing to text alerts. Please try again."
                                    saveText=""
                                    />
                                <div className='row container-lg md-max-width mx-auto justify-content-center align-items-center'>
                                    <div className='col-md-3 px-2 mt-2 text-center'>
                                        Sign up for text alerts
                                    </div>
                                    <Autocomplete
                                        className='col-md-4 px-2'
                                        id="part_id"
                                        options={[...state.participants]}
                                        getOptionLabel={option => `${option.first} ${option.last} - ${option.gender} ${option.age_group}`}
                                        onChange={(_e, value) => {
                                            setFieldValue(
                                                "part_id",
                                                value !== null ? value : initialValues.part_id
                                            );
                                        }}
                                        renderInput={params => (
                                            <TextField
                                                margin="normal"
                                                label="Name"
                                                name="part_id"
                                                {...params}
                                                />
                                        )}
                                    />
                                    <TextField
                                        className='col-md-3'
                                        margin='normal'
                                        label='Phone'
                                        name='phone'
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        value={values.phone}
                                        error={Boolean(errors.phone) && touched.phone}
                                        helperText={errors.phone && touched.phone}
                                        />
                                    <div className='mt-2 col-md-2 px-2 align-items-center d-flex justify-content-center'>
                                        <button className='btn btn-primary btn-chronokeep' type="submit">Submit</button>
                                    </div>
                                </div>
                            </Form>
                        )}
                    </Formik>
                </div>
            }
            { distances.length > 0 &&
            <div>
                <div className="row container-lg lg-max-width mx-auto d-flex align-items-stretch shadow-sm p-0 mb-3 border border-light">
                    <div className="p-0">
                        <div className="row container-lg md-max-width mx-auto p-0 my-2">
                            <div className="col-md-6">
                                <Select
                                    defaultValue={defaultSort}
                                    value={state.selected}
                                    onChange={(option: SortByItem | null) => {
                                        setState({
                                            ...state,
                                            sort_by: option ? option.value : 0,
                                            selected: option ? option : { value: 0, label: "Sort by Ranking" },
                                        });
                                    } }
                                    options={options}
                                    getOptionLabel={(option: SortByItem) => option.label}
                                    getOptionValue={(option: SortByItem) => option.value.toString()}
                                    className="p-0 mb-1"
                                    />
                            </div>
                            <div className="col-md-6">
                                <input type="text" className="form-control mb-1" id="searchBox" placeholder="Search" onChange={handleChange} />
                            </div>
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
                        <div id="results-parent">
                            {
                                distances.map((distance, index) => {
                                    if (state.event!.type === "time") {
                                        return (
                                            <TimeResultsTable
                                                distance={distance}
                                                results={state.results[distance]}
                                                info={info}
                                                key={index}
                                                showTitle={distances.length > 1}
                                                search={state.search}
                                                sort_by={state.sort_by}
                                                />
                                        )
                                    } else {
                                        return (
                                            <ResultsTable
                                                distance={distance}
                                                results={state.results[distance]}
                                                info={info}
                                                key={index}
                                                showTitle={distances.length > 1}
                                                search={state.search}
                                                sort_by={state.sort_by}
                                                />
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

export default Results;