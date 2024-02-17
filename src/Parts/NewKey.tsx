import { Component } from 'react';
import { Formik, Field, Form } from 'formik';
import { userService } from '../Auth/_services/user.service';
import save from '/img/sd-card.svg';
import Submitting from './Submitting';
import { NewKeyProps } from '../Interfaces/props';
import { Key } from '../Interfaces/types';
import { ErrorWithStatus, ErrorResponse, ModifyKeyResponse } from '../Interfaces/responses';

class NewKey extends Component<NewKeyProps> {
    render() {
        const addKey = this.props.addKey;
        const isAccountPage = this.props.page === 'account';
        let types = {
            read: { value: "read", text: "Read" },
            write: { value: "write", text: "Write" },
            delete: { value: "delete", text: "Delete" },
        };
        if (!isAccountPage) {
            types = {
                read: { value: "read", text: "Read Only" },
                write: { value: "write", text: "Timing System" },
                delete: { value: "delete", text: "Admin" },
            };
        }
        return (
            <div className="key-info text-center">
                <Formik
                    enableReinitialize={true}
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
                                    if (Object.prototype.hasOwnProperty.call(data.data, 'key')) {
                                        const keyResponse = data.data as ModifyKeyResponse
                                        addKey(keyResponse.key);
                                        setValues({
                                            name: '',
                                            type: 'read',
                                            allowedHosts: '',
                                            validUntil: '',
                                        }).catch(e => {
                                            console.error("error setting values ", e)
                                        });
                                    } else {
                                        const errResponse = data.data as ErrorResponse
                                        setStatus(errResponse.message)
                                    }
                                    setSubmitting(false);
                                },
                                error => {
                                    setSubmitting(false);
                                    if (Object.prototype.hasOwnProperty.call(error, 'message')) {
                                        const e = error as ErrorWithStatus
                                        setStatus(e.message);
                                    }
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
                                                    <option value={types.read.value}>{types.read.text}</option>
                                                    <option value={types.write.value}>{types.write.text}</option>
                                                    <option value={types.delete.value}>{types.delete.text}</option>
                                                </Field>
                                            </div>
                                        { isAccountPage &&
                                            <div className="col-md-auto">
                                                <label className="chronokeep-label form-label-sm" htmlFor="allowedHosts">Allowed Hosts</label>
                                                <Field name="allowedHosts" type="text" id={`hosts-new`} className="chronokeep-input form-control form-control-sm" />
                                            </div>
                                        }
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