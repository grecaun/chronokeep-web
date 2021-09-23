import React, { Component } from 'react';
import { Formik, Field, Form } from 'formik';
import { userService } from '../Auth/_services/user.service';
import save from '../../img/sd-card.svg';
import trash from '../../img/trash.svg';
import gear from '../../img/gear.svg';
import Submitting from './Submitting';

class KeyInfo extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isDisabled: true,
            key: props.keyItem,
            parent: props.parent,
        }
    }
    
    error(message) {
        const key = this.state.key;
        document.getElementById(`err${key.value}`).style.display = "block";
        document.getElementById(`err${key.value}`).innerHTML = message;
    }

    render() {
        const parent = this.state.parent;
        const isDisabled = this.state.isDisabled;
        const key = this.state.key;
        return (
            <div className="key-info text-center" key={key.value}>
                <Formik
                    initialValues={{
                        name: key.name,
                        type: key.type,
                        allowedHosts: key.allowed_hosts,
                        validUntil: key.valid_until === null ? '' : key.valid_until,
                    }}
                    onSubmit={({ name, type, allowedHosts, validUntil }, { setValues, setStatus, setSubmitting }) => {
                        setStatus();
                        userService.updateAPIKey(key.value, name, type, allowedHosts, validUntil)
                            .then(
                                data => {
                                    setValues({
                                        name: data.data.key.name,
                                        type: data.data.key.type,
                                        allowedHosts: data.data.key.allowed_hosts,
                                        validUntil: data.data.key.valid_until === null ? '' : data.data.key.valid_until,
                                    })
                                    key.name = data.data.key.name;
                                    key.type = data.data.key.type;
                                    key.allowed_hosts = data.data.key.allowed_hosts;
                                    key.validUntil = data.data.key.valid_until;
                                    setSubmitting(false);
                                    this.setState({
                                        isDisabled: true,
                                        key: key,
                                    })
                                },
                                error => {
                                    setSubmitting(false);
                                    setStatus(error.message);
                                    this.setState({
                                        isDisabled: true,
                                    })
                                }
                            )
                    }}
                >
                    {({ status, isSubmitting }) => (
                        <Form className="key-form" id={`key-form${key.value}`}>
                            <div className="card key-card key-card">
                                <p className="card-header chronokeep-card-header text-center">Key - {key.value}</p>
                                <div className="card-body">
                                    <div>
                                        <div className="row justify-content-center align-items-end g-2">
                                            <div className="col-md-auto">
                                                <label className="chronokeep-label form-label-sm" htmlFor="name">Name</label>
                                                <Field name="name" type="text" disabled={isDisabled} id={`name${key.value}`} className="chronokeep-input form-control form-control-sm" />
                                            </div>
                                            <div className="col-md-auto">
                                                <label className="chronokeep-label form-label-sm" htmlFor="type">Type</label>
                                                <Field as="select" name="type" id={`type${key.value}`} disabled={isDisabled} className="form-select form-select-sm">
                                                    <option value="read">Read</option>
                                                    <option value="write">Write</option>
                                                    <option value="delete">Delete</option>
                                                </Field>
                                            </div>
                                            <div className="col-md-auto">
                                                <label className="chronokeep-label form-label-sm" htmlFor="allowedHosts">Allowed Hosts</label>
                                                <Field name="allowedHosts" type="text" disabled={isDisabled} id={`hosts${key.value}`} className="chronokeep-input form-control form-control-sm" />
                                            </div>
                                            <div className="col-md-auto">
                                                <label className="chronokeep-label form-label-sm" htmlFor="validUntil">Valid Until</label>
                                                <Field name="validUntil" type="text" disabled={isDisabled} id={`valid${key.value}`} className="chronokeep-input form-control form-control-sm" />
                                            </div>
                                            <div className="col-lg-auto">
                                                <div className="row g-2 justify-content-center">
                                                    <div className="col-auto">
                                                        {!isSubmitting &&
                                                            <button type="submit" key={`submit${key.value}`} className="btn btn-primary btn-chronokeep" id={`submit${key.value}`} disabled={isDisabled}>
                                                                <img src={save} alt="save name" />
                                                            </button>
                                                        }
                                                        {isSubmitting &&
                                                            <Submitting />
                                                        }
                                                    </div>
                                                    <div className="col-auto">
                                                        <button type="button" key={`del${key.value}`} onClick={()=>{
                                                            document.getElementById(`err${key.value}`).style.display = "none";
                                                            parent.remove(key, this);
                                                        }} className="btn btn-primary btn-chronokeep">
                                                            <img src={trash} alt={`delete key ${key.value}`} />
                                                        </button>
                                                    </div>
                                                    <div className="col-auto">
                                                        <button type="button" key={`edit${key.value}`} id={`edit${key.value}`} onClick={()=>{
                                                            this.setState({
                                                                isDisabled: !isDisabled
                                                            })
                                                        }} className="btn btn-primary btn-chronokeep">
                                                            <img src={gear} alt={`edit key ${key.value}`} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {status &&
                                        <div className={'alert alert-danger chronokeep-alert'}>{status}</div>
                                    }
                                    <div className={'alert alert-danger chronokeep-alert hidden'} id={`err${key.value}`}></div>
                                </div>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
        )
    }
}

export default KeyInfo;