import ResultsTable from '../Parts/ResultsTable';
import TimeResultsTable from '../Parts/TimeResultsTable';
import Loading from '../Parts/Loading';
import ErrorMsg from '../Parts/ErrorMsg';
import DateString from '../Parts/DateString';
import { useParams } from 'react-router-dom';
import { EventYear, RankingType, ResultsParticipant, SmsSubscription } from '../Interfaces/types';
import { ResultsLoader } from '../loaders/results';
import Select from 'react-select';
import { ResultsState, SortByItem } from '../Interfaces/states';
import { Formik, Form, ErrorMessage } from 'formik';
import Autocomplete from "@mui/material/Autocomplete"
import { Checkbox, createFilterOptions, FormControlLabel, TextField } from '@mui/material';
import Modal from '../Parts/Modal';
import * as Yup from 'yup';
import { SendAddSmsSubscription, SendRemoveSmsSubscription } from '../loaders/sms_subscription';

function hideModal(state: ResultsState, setState: React.Dispatch<React.SetStateAction<ResultsState>>, show_success: boolean) {
    setState({
        ...state,
        show_sms_modal: false,
        subscription: null,
        subscription_success: show_success,
    })
}

function showModal(state: ResultsState, setState: React.Dispatch<React.SetStateAction<ResultsState>>, sub: SmsSubscription) {
    setState({
        ...state,
        show_sms_modal: true,
        subscription: sub,
        subscription_success: false,
    })
}

async function addSubscription(state: ResultsState, setState: React.Dispatch<React.SetStateAction<ResultsState>>, resetForm: any) {
    try {
        const success = await SendAddSmsSubscription(
            state.event?.slug!,
            state.year?.year!,
            state.subscription?.bib!,
            state.subscription?.first!,
            state.subscription?.last!,
            state.subscription?.phone!
        )
        if (success === true) {
            hideModal(state, setState, true)
            resetForm()
        } else {
            showErrorModal(state, setState)
        }
    } catch {
        showErrorModal(state, setState)
    }
}

async function removeSubscriptions(state: ResultsState, setState: React.Dispatch<React.SetStateAction<ResultsState>>, phone: string, resetForm: any) {
    try {
        const success = await SendRemoveSmsSubscription(
            state.event?.slug!,
            state.year?.year!,
            phone,
        )
        if (success === true) {
            setState({
                ...state,
                unsubscribe_error: false,
                unsubscribe_success: true
            })
            resetForm()
        } else {
            setState({
                ...state,
                unsubscribe_error: true,
                unsubscribe_success: false
            })
        }
    } catch {
        setState({
            ...state,
            unsubscribe_error: true,
            unsubscribe_success: false
        })
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

const filterOptions = createFilterOptions({
    stringify: (option: ResultsParticipant) => `${option.first} ${option.last}`
})

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

    const handleChangeRanking = (e: React.ChangeEvent<HTMLInputElement>) => {
        var rank_by_chip = e.target.checked
        if (state.default_ranking_type == RankingType.Chip) {
            rank_by_chip = !rank_by_chip
        }
        setState({
            ...state,
            rank_by_chip: rank_by_chip,
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
    var current_results = state.results;
    const age_groups: Set<string> = new Set<string>()
    distances.map(distance => {
        state.results[distance].map(result => {
            age_groups.add(result.age_group)
        })
    })
    const sorted_age_groups = Array.from(age_groups)
    sorted_age_groups.sort((g1, g2) => {
        if (g1.includes("Under") || g2.includes("Over")) {
            return -1
        }
        if (g2.includes("Under") || g1.includes("Over")) {
            return 1
        }
        const oneStart: number = +g1.split('-')[0]
        const twoStart: number = +g2.split('-')[0]
        return oneStart - twoStart
    })
    var cur_value = 3;
    const age_group_map: Map<number, string> = new Map<number, string>()
    sorted_age_groups.map(age_group => {
        const new_option = { value: cur_value, label: `Show Only: ${age_group}` }
        age_group_map.set(cur_value, age_group)
        cur_value++
        options.push(new_option)
    })
    var ranking_checkbox_text = "Rank by Chip Time"
    if (state.default_ranking_type == RankingType.Chip) {
        ranking_checkbox_text = "Rank by Gun Time"
    }
    if (state.rank_by_chip === true) {
        current_results = {};
        distances.map(distance => {
            current_results[distance] = [];
            state.results[distance].map(result => {
                current_results[distance].push({
                    bib: result.bib,
                    first: result.first,
                    last: result.last,
                    seconds: result.seconds,
                    milliseconds: result.milliseconds,
                    chip_seconds: result.chip_seconds,
                    chip_milliseconds: result.chip_milliseconds,
                    gender: result.gender,
                    occurence: result.occurence,
                    age_group: result.age_group,
                    age: result.age,
                    ranking: result.ranking,
                    age_ranking: result.age_ranking,
                    gender_ranking: result.gender_ranking,
                    finish: result.finish,
                    segment: result.segment,
                    type: result.type,
                    anonymous: result.anonymous,
                    distance: result.distance,
                    location: result.location,
                    local_time: result.local_time
                });
            })
            current_results[distance].sort((a,b) => {
                if (a.chip_seconds == b.chip_seconds) {
                    return a.chip_milliseconds - b.chip_milliseconds;
                }
                return a.chip_seconds - b.chip_seconds;
            });
            var place = 1;
            var genderPlace: { [gend: string]: number } = {}
            var ageGroupPlace: { [age_group: string]: { [gend: string]: number } } = {}
            current_results[distance].map(result => {
                // verify it's a finish result and it isn't DNF/DNF/DNS
                if (result.finish == true && result.type !== 3 && result.type !== 30 && result.type !== 31) {
                    result.ranking = place;
                    place = place + 1;
                    if (genderPlace[result.gender] === undefined) {
                        result.gender_ranking = 1;
                        genderPlace[result.gender] = 2;
                    } else {
                        result.gender_ranking = genderPlace[result.gender];
                        genderPlace[result.gender] = genderPlace[result.gender] + 1;
                    }
                    if (ageGroupPlace[result.age_group] === undefined) {
                        result.age_ranking = 1;
                        ageGroupPlace[result.age_group] = { };
                        ageGroupPlace[result.age_group][result.gender] = 2;
                    } else if (ageGroupPlace[result.age_group][result.gender] === undefined) {
                        result.age_ranking = 1;
                        ageGroupPlace[result.age_group][result.gender] = 2;
                    } else {
                        result.age_ranking = ageGroupPlace[result.age_group][result.gender];
                        ageGroupPlace[result.age_group][result.gender] = ageGroupPlace[result.age_group][result.gender] + 1;
                    }
                } else {
                    result.ranking = -1;
                    result.gender_ranking = -1;
                    result.age_ranking = -1;
                }
            })
        })
    }
    const certifications = new Map<string, string>()
    if (state.distances != null) {
        state.distances.map(dist => {
            if (dist.certification.length > 0) {
                certifications.set(dist.name, dist.certification)
            }
        })
    }
    const disclaimer = state.rank_by_chip ? "*Results are ranked based upon the Chip Time and not the Clock Time." : "*Results are ranked based upon the Clock Time and not the Chip Time.";
    document.title = `Chronokeep - ${state.event!.name} Results`
    return (
        <div>
            <div className="row container-lg lg-max-width mx-auto d-flex mt-4 mb-3 align-items-stretch">
                <div className="col-md-10 flex-fill text-center mx-auto m-1">
                    <p className="text-important mb-2 mt-1 h1">{`${state.event!.name} Results`}</p>
                    <p className="text-important h4">{DateString(state.year!.date_time)}</p>
                    { distances.length == 1 && certifications.has(distances[0]) &&
                        <div className='chronokeep-certification'>Course Certification: {certifications.get(distances[0])}</div>
                    }
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
                <Formik
                    enableReinitialize={true}
                    initialValues={initialValues}
                    onSubmit={({ part_id, phone }) => {
                        showModal(state, setState, {bib: part_id.bib, first: part_id.first, last: part_id.last, phone: phone})
                    }}
                    validationSchema={Yup.object().shape({
                        phone: Yup.string().matches(phoneRegex, 'Phone number not valid. 10 digits expected. Ex: 123-555-1234 1235551234 etc.').required('Phone number is required.')
                    })}
                    >
                    {({ errors, touched, setFieldValue, handleChange, handleBlur, values, resetForm }) => (
                        <Form>
                            <div className='row container-lg lg-max-width mx-auto d-flex shadow-sm p-2 mb-3 border border-light align-items-stretch justify-content-center'>
                                <div className='text-important h5 px-2 mt-2 text-center'>
                                    Sign up for text alerts
                                </div>
                                <Modal
                                    id="sms-modal"
                                    show={state.show_sms_modal}
                                    handleClose={() => { hideModal(state, setState, false) }}
                                    save={() => { addSubscription(state, setState, resetForm)} }
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
                                    <Autocomplete
                                        className='col-md-5 px-2'
                                        id="part_id"
                                        options={[...state.participants]}
                                        filterOptions={filterOptions}
                                        getOptionLabel={option => `${option.first} ${option.last}`}
                                        onChange={(_e, value) => {
                                            setFieldValue(
                                                "part_id",
                                                value !== null ? value : initialValues.part_id
                                            );
                                        }}
                                        renderOption={(props, option: ResultsParticipant) => {
                                            return (
                                                <li {...props}>
                                                    {`${option.first} ${option.last} - ${option.gender} ${option.age_group}`}
                                                </li>
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
                                        className='col-md-5'
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
                                <div className='mt-2 mx-3 text-center'>
                                    <ErrorMessage name='phone' />
                                </div>
                                { state.subscription_success &&
                                    <div className='col-md-4 text-important h5 p-2 m-2 text-center bg-success text-white rounded'>
                                        You've successfully subscribed.
                                    </div>
                                }
                            </div>
                        </Form>
                    )}
                </Formik>
            }
            { distances.length > 0 &&
            <div>
                <div className="row container-lg lg-max-width mx-auto d-flex align-items-stretch shadow-sm p-0 mb-3 border border-light">
                    <div className="p-0">
                        <div className="row container-lg md-max-width mx-auto p-0 my-2">
                            <div className="col-md-4 d-flex justify-content-center">
                                <FormControlLabel
                                    label={ranking_checkbox_text}
                                    control={
                                        <Checkbox
                                            size="small"
                                            checked={state.rank_by_chip}
                                            onChange={handleChangeRanking}
                                            />
                                    }
                                />
                            </div>
                            <div className="col-md-4">
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
                            <div className="col-md-4">
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
                                                results={current_results[distance]}
                                                info={info}
                                                key={index}
                                                showTitle={distances.length > 1}
                                                search={state.search}
                                                sort_by={state.sort_by}
                                                rank_by_chip={state.rank_by_chip}
                                                age_group_map={age_group_map}
                                                certification={certifications.get(distance)}
                                                />
                                        )
                                    } else {
                                        return (
                                            <ResultsTable
                                                distance={distance}
                                                results={current_results[distance]}
                                                info={info}
                                                key={index}
                                                showTitle={distances.length > 1}
                                                search={state.search}
                                                sort_by={state.sort_by}
                                                rank_by_chip={state.rank_by_chip}
                                                age_group_map={age_group_map}
                                                certification={certifications.get(distance)}
                                                />
                                        )
                                    }
                                })
                            }
                        </div>
                    </div>
                </div>
                <div id='disclaimer' className='container-lg lg-max-width shadow-sm text-center p-3 mb-3 border border-light overflow-hidden-lg'>{disclaimer}</div>
            </div>
            }
            { distances.length === 0 &&
            <div className="container-lg lg-max-width shadow-sm p-5 mb-3 border border-light">
                <div className="text-center">
                    <h2>No results to display.</h2>
                </div>
            </div>
            }
            { textAllowedTime > nowDate && state.participants.length > 0 && days_allowed > 0 &&
            <div className="row container-lg lg-max-width mx-auto d-flex shadow-sm p-2 mb-3 border border-light align-items-stretch justify-content-center">
                <div className='col text-important h5 px-2 mt-2 text-center'>
                    Unsubscribe to text alerts
                </div>
                <Formik
                    enableReinitialize={true}
                    initialValues={initialValues}
                    onSubmit={({ phone }, { resetForm }) => {
                        setState({
                            ...state,
                            unsubscribe_success: false,
                            unsubscribe_error: false,
                        })
                        removeSubscriptions(state, setState, phone, resetForm)
                    }}
                    validationSchema={Yup.object().shape({
                        phone: Yup.string().matches(phoneRegex, 'Phone number not valid. 10 digits expected. Ex: 123-555-1234 1235551234 etc.').required('Phone number is required.')
                    })}
                    >
                    {({ errors, touched, handleChange, handleBlur, values }) => (
                        <Form>
                            <div className='row container-lg md-max-width mx-auto justify-content-center align-items-center'>
                                <TextField
                                    className='col-md-5'
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
                            <div className='mt-2 mx-3 text-center'>
                                <ErrorMessage name='phone' />
                            </div>
                        </Form>
                    )}
                </Formik>
                { state.unsubscribe_success &&
                    <div className='col-md-4 text-important h5 p-2 m-2 text-center bg-success text-white rounded'>
                        You've successfully unsubscribed.
                    </div>
                }
                { state.unsubscribe_error &&
                    <div className='col-md-4 text-important h5 p-2 m-2 text-center bg-danger text-white rounded'>
                        Error unsubscribing.
                    </div>
                }
            </div>
            }
        </div>
    )
}

export default Results;