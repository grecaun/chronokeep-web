import { useState } from "react"
import { CheckinRowProps } from "../Interfaces/props"
import { Field, Form, Formik } from "formik"
import { Participant } from "../Interfaces/types"
import { userService } from "../Auth/_services/user.service"
import { AddCheckinParticipantResponse, ErrorResponse, ErrorWithStatus } from "../Interfaces/responses"
import save from '/img/sd-card.svg';
import undo from '/img/undo.svg';
import Submitting from "./Submitting"

function CheckinRow(props: CheckinRowProps) {
    const [state, setState] = useState({ expanded: false })

    const handleClick = () => {
        setState({
            expanded: !state.expanded
        })
    }
    const part = props.participant
    const distances = Array.from(props.distances)
    const slug = props.event.slug
    const year = props.year.year
    if (state.expanded) {
        return (
            <div className="part-forms part-shared" key={`${part.id}`}>
                <Formik
                    enableReinitialize={true}
                    initialValues={{
                        bib: part.bib,
                        first: part.first,
                        last: part.last,
                        birthdate: part.birthdate,
                        gender: part.gender,
                        distance: part.distance,
                        anonymous: part.anonymous,
                        sms_enabled: part.sms_enabled,
                        mobile: part.mobile,
                        apparel: part.apparel
                    }}
                    onSubmit={({ bib, first, last, birthdate, gender, distance, anonymous, sms_enabled, mobile, apparel}, { setValues, setStatus, setSubmitting }) => {
                        setStatus();
                        const newPart: Participant = {
                            id: part.id,
                            age_group: part.age_group,
                            bib: bib,
                            first: first,
                            last: last,
                            birthdate: birthdate,
                            gender: gender,
                            distance: distance,
                            anonymous: anonymous,
                            sms_enabled: sms_enabled,
                            mobile: mobile,
                            apparel: apparel
                        }
                        userService.updateParticipant(slug, year, newPart)
                            .then(
                                data => {
                                    if (Object.prototype.hasOwnProperty.call(data.data, 'participant')) {
                                        const partResponse = data.data as AddCheckinParticipantResponse
                                        setValues({
                                            bib: partResponse.participant.bib,
                                            first: partResponse.participant.first,
                                            last: partResponse.participant.last,
                                            birthdate: partResponse.participant.birthdate,
                                            gender: partResponse.participant.gender,
                                            distance: partResponse.participant.distance,
                                            anonymous: partResponse.participant.anonymous,
                                            sms_enabled: partResponse.participant.sms_enabled,
                                            mobile: partResponse.participant.mobile,
                                            apparel: partResponse.participant.apparel,
                                        }).catch(() => {});
                                        part.bib = partResponse.participant.bib;
                                        part.first = partResponse.participant.first;
                                        part.last = partResponse.participant.last;
                                        part.birthdate = partResponse.participant.birthdate;
                                        part.gender = partResponse.participant.gender;
                                        part.distance = partResponse.participant.distance;
                                        part.anonymous = partResponse.participant.anonymous;
                                        part.sms_enabled = partResponse.participant.sms_enabled;
                                        part.mobile = partResponse.participant.mobile;
                                        part.apparel = partResponse.participant.apparel;
                                    } else {
                                        const errResponse = data.data as ErrorResponse
                                        setStatus(errResponse.message)
                                    }
                                    setSubmitting(false);
                                    setState({
                                        expanded: false
                                    })
                                },
                                error => {
                                    setSubmitting(false);
                                    if (Object.prototype.hasOwnProperty.call(error, 'message')) {
                                        const e = error as ErrorWithStatus
                                        setStatus(e.message);
                                    }
                                    setState({
                                        expanded: false
                                    })
                                },
                            )
                    }}
                >
                    {({ status, isSubmitting }) => (
                        <Form className="part-form" id={`part-form-${part.id}` }>
                            <div className="card key-card">
                                <div className="card-body">
                                    <div>
                                        <div className="row justify-content-center align-items-end g-2">
                                            <div className="col-lg chronokeep-part-col">
                                                <label className="chronokeep-label form-label-sm" htmlFor="distance">Distance</label>
                                                <Field as="select" name="distance" id={`distance${part.id}`} className="form-select form-select-sm">
                                                    { distances.map((dist) => {
                                                        return (
                                                            <option value={dist}>{dist}</option>
                                                        );
                                                    })}
                                                </Field>
                                            </div>
                                            <div className="col-lg chronokeep-part-col">
                                                <label className="chronokeep-label form-label-sm" htmlFor="bib">Bib</label>
                                                <Field name="bib" type="text" id={`bib${part.id}`} className="chronokeep-input form-control form-control-sm" />
                                            </div>
                                            <div className="col-lg chronokeep-part-col">
                                                <label className="chronokeep-label form-label-sm" htmlFor="first">First Name</label>
                                                <Field name="first" type="text" id={`first${part.id}`} className="chronokeep-input form-control form-control-sm" />
                                            </div>
                                            <div className="col-lg chronokeep-part-col">
                                                <label className="chronokeep-label form-label-sm" htmlFor="last">Last Name</label>
                                                <Field name="last" type="text" id={`last${part.id}`} className="chronokeep-input form-control form-control-sm" />
                                            </div>
                                            <div className="col-lg chronokeep-part-col">
                                                <label className="chronokeep-label form-label-sm" htmlFor="gender">Gender</label>
                                                <Field name="gender" type="text" id={`gender${part.id}`} className="chronokeep-input form-control form-control-sm" />
                                            </div>
                                            <div className="col-lg chronokeep-part-col">
                                                <label className="chronokeep-label form-label-sm" htmlFor="birthdate">Birthdate</label>
                                                <Field name="birthdate" type="text" id={`birthdate${part.id}`} className="chronokeep-input form-control form-control-sm" />
                                            </div>
                                            <div className="col-lg chronokeep-part-col">
                                                <label className="chronokeep-label form-label-sm" htmlFor="anonymous">Anonymous</label>
                                                <Field name="anonymous" type="checkbox" id={`anonymous${part.id}`} className="chronkokeep-checkbox" />
                                            </div>
                                            <div className="col-lg chronokeep-part-col">
                                                <label className="chronokeep-label form-label-sm" htmlFor="sms_enabled">Send finish text message?</label>
                                                <Field name="sms_enabled" type="checkbox" id={`sms_enabled${part.id}`} className="chronkokeep-checkbox" />
                                            </div>
                                            <div className="col-lg chronokeep-part-col">
                                                <label className="chronokeep-label form-label-sm" htmlFor="mobile">Mobile Number</label>
                                                <Field name="mobile" type="text" id={`mobile${part.id}`} className="chronokeep-input form-control form-control-sm" />
                                            </div>
                                            <div className="col-lg chronokeep-part-col">
                                                <label className="chronokeep-label form-label-sm" htmlFor="apparel">T-shirt</label>
                                                <Field name="apparel" type="text" id={`apparel${part.id}`} className="chronokeep-input form-control form-control-sm" disabled="true" />
                                            </div>
                                            <div className="col-lg chronokeep-part-col">
                                                <div className="row g-2 justify-content-center">
                                                    <div className="col-auto">
                                                        {!isSubmitting &&
                                                            <button type="submit" key={`submit${part.id}`} className="btn btn-primary btn-chronokeep" id={`submit${part.id}`}>
                                                                <img src={save} alt="save name" />
                                                            </button> 
                                                        }
                                                        {isSubmitting &&
                                                            <Submitting />
                                                        }
                                                    </div>
                                                    <div className="col-auto">
                                                        <button type="button" key={`undo${part.id}`} id={`undo${part.id}`} onClick={handleClick} className="btn btn-primary btn-chronokeep">
                                                            <img src={undo} alt={`undo changes to participant ${part.id}`} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {status &&
                                        <div className="alert alert-danger chronokeep-alert">{status}</div>
                                    }
                                </div>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
        );
    }
    
    return (
        <div className="part-label part-shared" key={`${part.id}`} onClick={handleClick}>
            <div className='part-name-holder shadow-sm border border-light' id={`part-label-${part.id}`}>{`${part.first} ${part.last}`}</div>
        </div>
    );
}

export default CheckinRow