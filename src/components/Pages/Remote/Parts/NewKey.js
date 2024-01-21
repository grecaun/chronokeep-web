import React, { Component } from 'react';
import { Formik, Field, Form } from 'formik';
import { userService } from '../../../Auth/_services/user.service';
import save from '../../../../img/sd-card.svg';
import Submitting from '../../../Parts/Submitting';

class NewKey extends Component {
    constructor(props) {
        super(props);

        this.state = {
            parent: props.parent,
        }
    }

    render() {
        const parent = this.state.parent;
        return (
            <div className="key-info text-center">
                <Formik
                    initialValues={{
                        name: '',
                        type: 'read',
                        validUntil: '',
                    }}
                    onSubmit={({ name, type, validUntil }, { setValues, setStatus, setSubmitting }) => {
                        setStatus();
                        userService.addRemoteKey(name, type, validUntil)
                            .then(
                                data => {
                                    parent.add(data.data.key);
                                    setValues({
                                        name: '',
                                        type: 'read',
                                        validUntil: '',
                                    });
                                    setSubmitting(false);
                                },
                                error => {
                                    setSubmitting(false);
                                    setStatus(error.message);
                                }
                            )
                    }}
                >
                    {({ status, isSubmitting }) => (
                        <Form className="key-form" id={`key-form-new`}>
                            <div className="card key-card key-card">
                                <p className="card-header chronokeep-card-header text-center">Add Key</p>
                                <div className="card-body">
                                    <div>
                                        <div className="row justify-content-center align-items-end g-2">
                                            <div className="col-md-auto">
                                                <label className='chronokeep-label form-label-sm' htmlFor='name'>Name</label>
                                                <Field name="name" type="text" id={`name-new`} className="chronokeep-input form-control form-control-sm" />
                                            </div>
                                            <div className="col-md-auto">
                                                <label className="chronokeep-label form-label-sm" htmlFor="type">Type</label>
                                                <Field as="select" name="type" id={`type-new`} className="form-select form-select-sm">
                                                    <option value="read">Read Only</option>
                                                    <option value="write">Timing System</option>
                                                    <option value="delete">Admin</option>
                                                </Field>
                                            </div>
                                            <div className="col-md-auto">
                                                <label className="chronokeep-label form-label-sm" htmlFor="validUntil">Valid Until</label>
                                                <Field name="validUntil" type="text" id={`valid-new`} className="chronokeep-input form-control form-control-sm" />
                                            </div>
                                            <div className="col-auto">
                                                {!isSubmitting &&
                                                    <button type="submit" key={`submit-new`} className="btn btn-primary btn-chronokeep" id={`submit-new`}>
                                                        <img src={save} alt="save name" />
                                                    </button>
                                                }
                                                {isSubmitting &&
                                                    <Submitting />
                                                }
                                            </div>
                                        </div>
                                    </div>
                                    {status &&
                                        <div className={'alert alert-danger chronokeep-alert'}>{status}</div>
                                    }
                                </div>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
        )
    }
}

export default NewKey;