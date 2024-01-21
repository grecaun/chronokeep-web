import React, { Component } from 'react';
import { Formik, Field, Form } from 'formik';
import { userService } from '../../../Auth/_services/user.service';
import save from '../../../../img/sd-card.svg';
import trash from '../../../../img/trash.svg';
import gear from '../../../../img/gear.svg';
import Submitting from '../../../Parts/Submitting';

class KeyInfo extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isDisabled: true,
            key: props.keyItem,
            parent: props.parent,
        }
        this.delete = this.delete.bind(this);
    }
    
    error(message) {
        const key = this.state.key;
        document.getElementById(`err${key.value}`).style.display = "block";
        document.getElementById(`err${key.value}`).innerHTML = message;
    }

    delete = () => {
        const key = this.state.key;
        const parent = this.state.parent;
        document.getElementById(`err${key.value}`).style.display = "none";
        parent.remove(key, this);
    }

    render() {
        const isDisabled = this.state.isDisabled;
        const key = this.state.key;
        return (
            <div className="key-info text-center" key={key.value}>
                <Formik
                    initialValues={{
                        name: key.name,
                        type: key.type,
                        validUntil: key.valid_until === null ? '' : key.valid_until,
                    }}
                    onSubmit={({ name, type, validUntil }, { setValues, setStatus, setSubmitting }) => {
                        setStatus();
                        userService.updateRemoteKey(key.value, name, type, validUntil)
                            .then(
                                data => {
                                    setValues({
                                        name: data.data.key.name,
                                        type: data.data.key.type,
                                        validUntil: data.data.key.valid_until === null ? '' : data.data.key.valid_until,
                                    })
                                    key.name = data.data.key.name;
                                    key.type = data.data.key.type;
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
                                                <label className='chronokeep-label form-label-sm' htmlFor='name'>Name</label>
                                                <Field name="name" type="text" disabled={isDisabled} id={`name${key.value}`} className="chronokeep-input form-control form-control-sm" />
                                            </div>
                                            <div className="col-md-auto">
                                                <label className="chronokeep-label form-label-sm" htmlFor="type">Type</label>
                                                <Field as="select" name="type" id={`type${key.value}`} disabled={isDisabled} className="form-select form-select-sm">
                                                    <option value="read">Read Only</option>
                                                    <option value="write">Timing System</option>
                                                    <option value="delete">Admin</option>
                                                </Field>
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
                                                        <button type="button" key={`del${key.value}`} id={`del${key.value}`} disabled={isDisabled} onClick={this.delete} className="btn btn-primary btn-chronokeep">
                                                            <img src={trash} alt={`delete key ${key.value}`} />
                                                        </button>
                                                    </div>
                                                    <div className="col-auto">
                                                        <button type="button" key={`edit${key.value}`} id={`edit${key.value}`} onClick={()=>{
                                                            this.setState({
                                                                isDisabled: !isDisabled
                                                            })
                                                            document.getElementById(`del${key.value}`).addEventListener("click", this.delete)
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