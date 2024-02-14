import { Component } from 'react';
import { Formik, Field, Form } from 'formik';
import { userService } from '../Auth/_services/user.service';
import save from '/img/sd-card.svg';
import trash from '/img/trash.svg';
import gear from '/img/gear.svg';
import Submitting from './Submitting';
import { KeyState } from '../Interfaces/states';
import { KeyInfoProps } from '../Interfaces/props';
import { Key } from '../Interfaces/types';
import { ErrorResponse, ModifyKeyResponse, ErrorWithStatus } from '../Interfaces/responses';

class KeyInfo extends Component<KeyInfoProps, KeyState> {
    state: KeyState = {
        isDisabled: true,
        key: {
            name: '',
            value: '',
            type: '',
            allowed_hosts: '',
            valid_until: null
        }
    }

    componentDidMount() {
        this.setState({
            key: this.props.keyItem
        })
    }
    
    error(message: string) {
        const key = this.state.key;
        document.getElementById(`err${key.value}`)!.style.display = "block";
        document.getElementById(`err${key.value}`)!.innerHTML = message;
    }

    delete = () => {
        const key = this.state.key;
        const parent = this.props.parent;
        document.getElementById(`err${key.value}`)!.style.display = "none";
        parent.remove(key, this);
    }

    render() {
        const isDisabled = this.state.isDisabled;
        const key = this.state.key;
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
            <div className="key-info text-center" key={key.value}>
                <Formik
                    enableReinitialize={true}
                    initialValues={{
                        name: key.name,
                        type: key.type,
                        allowedHosts: key.allowed_hosts,
                        validUntil: key.valid_until === null ? '' : key.valid_until,
                    }}
                    onSubmit={({ name, type, allowedHosts, validUntil }, { setValues, setStatus, setSubmitting }) => {
                        setStatus();
                        const newKey: Key = {
                            value: key.value,
                            name: name,
                            type: type,
                            allowed_hosts: allowedHosts,
                            valid_until: validUntil
                        }
                        console.log("newKey is ", newKey);
                        userService.updateAPIKey(newKey, this.props.page === 'account' ? "API" : "REMOTE")
                            .then(
                                data => {
                                    if (Object.prototype.hasOwnProperty.call(data.data, 'key')) {
                                        const keyResponse = data.data as ModifyKeyResponse
                                        setValues({
                                            name: keyResponse.key.name,
                                            type: keyResponse.key.type,
                                            allowedHosts: keyResponse.key.allowed_hosts,
                                            validUntil: keyResponse.key.valid_until === null ? '' : keyResponse.key.valid_until,
                                        }).catch(() => {});
                                        key.name = keyResponse.key.name;
                                        key.type = keyResponse.key.type;
                                        key.allowed_hosts = keyResponse.key.allowed_hosts;
                                        key.valid_until = keyResponse.key.valid_until;
                                        this.setState({
                                            key: key,
                                        })
                                    } else {
                                        const errResponse = data.data as ErrorResponse
                                        setStatus(errResponse.message)
                                    }
                                    setSubmitting(false);
                                    this.setState({
                                        isDisabled: true,
                                    })
                                },
                                error => {
                                    setSubmitting(false);
                                    if (Object.prototype.hasOwnProperty.call(error, 'message')) {
                                        const e = error as ErrorWithStatus
                                        setStatus(e.message);
                                    }
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
                                                    <option value={types.read.value}>{types.read.text}</option>
                                                    <option value={types.write.value}>{types.write.text}</option>
                                                    <option value={types.delete.value}>{types.delete.text}</option>
                                                </Field>
                                            </div>
                                        { isAccountPage &&
                                            <div className="col-md-auto">
                                                <label className="chronokeep-label form-label-sm" htmlFor="allowedHosts">Allowed Hosts</label>
                                                <Field name="allowedHosts" type="text" disabled={isDisabled} id={`hosts${key.value}`} className="chronokeep-input form-control form-control-sm" />
                                            </div>
                                        }
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
                                                            document.getElementById(`del${key.value}`)!.addEventListener("click", this.delete)
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