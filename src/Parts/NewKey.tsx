import { Component } from 'react';
import { Formik, Field, Form } from 'formik';
import { userService } from '../Auth/_services/user.service';
import save from '/img/sd-card.svg';
import Submitting from './Submitting';
import { NewKeyProps } from '../Interfaces/props';
import { Key } from '../Interfaces/types';

class NewKey extends Component<NewKeyProps> {
    render() {
        const parent = this.props.parent;
        return (
            <div className="key-info text-center">
                <Formik
                    initialValues={{
                        name: '',
                        type: 'read',
                        allowedHosts: '',
                        validUntil: '',
                    }}
                    onSubmit={({ name, type, allowedHosts, validUntil }, { setValues, setStatus, setSubmitting }) => {
                        setStatus();
                        const newKey: Key = {
                            value: '',
                            name: name,
                            type: type,
                            allowed_hosts: allowedHosts,
                            valid_until: validUntil
                        }
                        userService.addAPIKey(newKey, this.props.page === 'remote' ? "REMOTE" : "API")
                            .then(
                                data => {
                                    parent.add(data.data.key);
                                    setValues({
                                        name: '',
                                        type: 'read',
                                        allowedHosts: '',
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
                                                <label className="chronokeep-label form-label-sm" htmlFor="name">Name</label>
                                                <Field name="name" type="text" id={`name-new`} className="chronokeep-input form-control form-control-sm" />
                                            </div>
                                            <div className="col-md-auto">
                                                <label className="chronokeep-label form-label-sm" htmlFor="type">Type</label>
                                                <Field as="select" name="type" id={`type-new`} className="form-select form-select-sm">
                                                    <option value="read">Read</option>
                                                    <option value="write">Write</option>
                                                    <option value="delete">Delete</option>
                                                </Field>
                                            </div>
                                            <div className="col-md-auto">
                                                <label className="chronokeep-label form-label-sm" htmlFor="allowedHosts">Allowed Hosts</label>
                                                <Field name="allowedHosts" type="text" id={`hosts-new`} className="chronokeep-input form-control form-control-sm" />
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