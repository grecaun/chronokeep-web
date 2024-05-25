import { useState } from "react";
import { AddCheckinProps } from "../Interfaces/props";
import { Field, Form, Formik } from "formik";
import { Participant } from "../Interfaces/types";
import { userService } from "../Auth/_services/user.service";
import { AddCheckinParticipantResponse, ErrorResponse, ErrorWithStatus } from "../Interfaces/responses";
import save from '/img/sd-card.svg';
import undo from '/img/undo.svg';
import add from '/img/add.svg';
import Submitting from "./Submitting";

function AddCheckin(props: AddCheckinProps) {
    const [state, setState] = useState({ expanded: false })
    
    const handleClick = () => {
        setState({
            expanded: !state.expanded
        })
    }

    const distances = Array.from(props.distances)
    const slug = props.event.slug
    const year = props.year.year
    if (state.expanded) {
        return (
            <div className="part-forms part-shared shadow-sm" key={`-add`}>
                <Formik
                    enableReinitialize={true}
                    initialValues={{
                        bib: "",
                        first: "",
                        last: "",
                        birthdate: "",
                        gender: "",
                        distance: "",
                        anonymous: false,
                        sms_enabled: false,
                        mobile: "",
                        apparel: ""
                    }}
                    onSubmit={({ bib, first, last, birthdate, gender, distance, anonymous, sms_enabled, mobile, apparel}, { setValues, setStatus, setSubmitting }) => {
                        setStatus();
                        const newPart: Participant = {
                            id: "",
                            age_group: "",
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
                        userService.addParticipant(slug, year, newPart)
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
                                        props.addParticipant({
                                            id: partResponse.participant.id,
                                            age_group: partResponse.participant.age_group,
                                            bib: partResponse.participant.bib,
                                            first: partResponse.participant.first,
                                            last: partResponse.participant.last,
                                            birthdate: partResponse.participant.birthdate,
                                            gender: partResponse.participant.gender,
                                            distance: partResponse.participant.distance,
                                            anonymous: partResponse.participant.anonymous,
                                            sms_enabled: partResponse.participant.sms_enabled,
                                            mobile: partResponse.participant.mobile,
                                            apparel: partResponse.participant.apparel
                                        });
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
                        <Form className="part-form" id={`add-part-form` }>
                            <div className="card key-card">
                                <div className="card-body">
                                    <div>
                                        <div className="row justify-content-center align-items-end g-2">
                                            <div className="col-lg chronokeep-part-col-sm">
                                                <label className="chronokeep-label form-label-sm" htmlFor="distance">Distance</label>
                                                <Field as="select" name="distance" id={`distance-add`} className="form-select form-select-sm">
                                                    <option value=''></option>
                                                    { distances.map((dist) => {
                                                        return (
                                                            <option value={dist}>{dist}</option>
                                                        );
                                                    })}
                                                </Field>
                                            </div>
                                            <div className="col-lg chronokeep-part-col-sm">
                                                <label className="chronokeep-label form-label-sm" htmlFor="bib">Bib</label>
                                                <Field name="bib" type="text" id={`bib-add`} className="chronokeep-input form-control form-control-sm" />
                                            </div>
                                            <div className="col-lg chronokeep-part-col-sm">
                                                <label className="chronokeep-label form-label-sm" htmlFor="first">First Name</label>
                                                <Field name="first" type="text" id={`first-add`} className="chronokeep-input form-control form-control-sm" />
                                            </div>
                                            <div className="col-lg chronokeep-part-col-sm">
                                                <label className="chronokeep-label form-label-sm" htmlFor="last">Last Name</label>
                                                <Field name="last" type="text" id={`last-add`} className="chronokeep-input form-control form-control-sm" />
                                            </div>
                                            <div className="col-lg chronokeep-part-col-sm">
                                                <label className="chronokeep-label form-label-sm" htmlFor="gender">Gender</label>
                                                <Field name="gender" type="text" id={`gender-add`} className="chronokeep-input form-control form-control-sm" />
                                            </div>
                                            <div className="col-lg chronokeep-part-col-sm">
                                                <label className="chronokeep-label form-label-sm" htmlFor="birthdate">Birthdate</label>
                                                <Field name="birthdate" type="text" id={`birthdate-add`} className="chronokeep-input form-control form-control-sm" />
                                            </div>
                                            <div className="col-lg chronokeep-part-col-sm">
                                                <label className="chronokeep-label form-label-sm" htmlFor="anonymous">Anonymous</label>
                                                <Field name="anonymous" type="checkbox" id={`anonymous-add`} className="chronkokeep-checkbox" />
                                            </div>
                                            <div className="col-lg chronokeep-part-col-sm">
                                                <label className="chronokeep-label form-label-sm" htmlFor="sms_enabled">Send finish text message?</label>
                                                <Field name="sms_enabled" type="checkbox" id={`sms_enabled-add`} className="chronkokeep-checkbox" />
                                            </div>
                                            <div className="col-lg chronokeep-part-col-sm">
                                                <label className="chronokeep-label form-label-sm" htmlFor="mobile">Mobile Number</label>
                                                <Field name="mobile" type="text" id={`mobile-add`} className="chronokeep-input form-control form-control-sm" />
                                            </div>
                                            <div className="col-lg chronokeep-part-col-sm">
                                                <label className="chronokeep-label form-label-sm" htmlFor="apparel">T-shirt</label>
                                                <Field name="apparel" type="text" id={`apparel-add`} className="chronokeep-input form-control form-control-sm" />
                                            </div>
                                            <div className="col-lg chronokeep-part-col-sm">
                                                <div className="row g-2 justify-content-center">
                                                    <div className="col-auto">
                                                        {!isSubmitting &&
                                                            <button type="submit" key={`submit-add`} className="btn btn-primary btn-chronokeep" id={`submit-add`}>
                                                                <img src={save} alt="save name" />
                                                            </button> 
                                                        }
                                                        {isSubmitting &&
                                                            <Submitting />
                                                        }
                                                    </div>
                                                    <div className="col-auto">
                                                        <button type="button" key={`undo-add`} id={`undo-add`} onClick={handleClick} className="btn btn-primary btn-chronokeep">
                                                            <img src={undo} alt={`undo changes to participant -add`} />
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
        <div className="g-2 justify-content-center chronokeep-add-part-holder">
            <div className="col-auto">
                <button className="btn btn-primary btn-chronokeep" onClick={handleClick}>
                    <img src={add} alt="add participant" />
                </button>
            </div>
        </div>
    );
}

export default AddCheckin