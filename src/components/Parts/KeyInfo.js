import React from 'react';
import { Formik, Field, Form } from 'formik';
import { userService } from '../Auth/_services/user.service';
import save from '../../img/sd-card.svg';
import trash from '../../img/trash.svg';
import gear from '../../img/gear.svg';

const KeyInfo = (keys) => {
    return (
        <div className="key-info-container">
            <h2 className="text-center">Keys</h2>
            {
                keys.map(key => {
                    const keyVal = key.value;
                    return (
                        <div className="key-info text-center" key={key.value}>
                            <Formik
                                initialValues={{
                                    name: key.name,
                                    type: key.type,
                                    allowedHosts: key.allowed_hosts
                                }}
                                onSubmit={({ name, type, allowedHosts }, { setStatus, setSubmitting }) => {
                                    setStatus();
                                    userService.updateAPIKey(key.value, name, type, allowedHosts, null)
                                        .then(
                                            data => {
                                                name = data.data.key.name;
                                                type = data.data.key.type;
                                                allowedHosts = data.data.key.allowedHosts;
                                                setSubmitting(false);
                                                document.getElementById(`name${key.value}`).disabled = true
                                                document.getElementById(`type${key.value}`).disabled = true
                                                document.getElementById(`hosts${key.value}`).disabled = true
                                                document.getElementById(`edit${key.value}`).disabled = true
                                                document.getElementById(`submit${key.value}`).disabled = true
                                            },
                                            error => {
                                                setSubmitting(false);
                                                setStatus(error.message);
                                                document.getElementById(`name${key.value}`).disabled = true
                                                document.getElementById(`type${key.value}`).disabled = true
                                                document.getElementById(`hosts${key.value}`).disabled = true
                                                document.getElementById(`edit${key.value}`).disabled = true
                                                document.getElementById(`submit${key.value}`).disabled = true
                                            }
                                        )
                                }}
                            >
                                {({ status, isSubmitting }) => (
                                    <Form className="key-form">
                                        <div className="card chronokeep-card key-card">
                                            <h2 className="card-header h5 chronokeep-card-header text-center">{key.value}</h2>
                                            <div className="card-body">
                                                <div className="container">
                                                    <div className="row justify-content-center align-items-end g-2">
                                                        <div className="col-md-auto">
                                                            <label className="chronokeep-label" htmlFor="name">Name</label>
                                                            <Field name="name" type="text" disabled={true} id={`name${key.value}`} className="chronokeep-input form-control" />
                                                        </div>
                                                        <div className="col-md-auto">
                                                            <label className="chronokeep-label" htmlFor="type">Type</label>
                                                            <Field as="select" name="type" id={`type${key.value}`} disabled={true} className="form-select">
                                                                <option value="read">Read</option>
                                                                <option value="write">Write</option>
                                                                <option value="delete">Delete</option>
                                                            </Field>
                                                        </div>
                                                        <div className="col-md-auto">
                                                            <label className="chronokeep-label" htmlFor="allowedHosts">Allowed Hosts</label>
                                                            <Field name="allowedHosts" type="text" disabled={true} id={`hosts${key.value}`} className="chronokeep-input form-control" />
                                                        </div>
                                                        <div className="col-lg-auto">
                                                            <div className="row g-2 justify-content-center">
                                                                <div className="col-auto">
                                                                    {!isSubmitting &&
                                                                        <button type="submit" key={`submit${key.value}`} className="btn btn-primary btn-chronokeep" id={`submit${key.value}`} disabled={true}>
                                                                            <img src={save} alt="save name" />
                                                                        </button>
                                                                    }
                                                                    {isSubmitting &&
                                                                        <div className="spinner-border text-chronokeep" role="status">
                                                                            <span className="visually-hidden">Loading...</span>
                                                                        </div>
                                                                    }
                                                                </div>
                                                                <div className="col-auto">
                                                                    <button type="button" key={`delete${key.value}`} id={`edit${key.value}`} disabled={true} onClick={()=>{
                                                                        console.log(`deleting key value ${keyVal}`)
                                                                    }} className="btn btn-primary btn-chronokeep">
                                                                        <img src={trash} alt={`delete key ${key.value}`} />
                                                                    </button>
                                                                </div>
                                                                <div className="col-auto">
                                                                    <button type="button" key={`edit${key.value}`} onClick={()=>{
                                                                        document.getElementById(`name${key.value}`).disabled = !document.getElementById(`name${key.value}`).disabled
                                                                        document.getElementById(`type${key.value}`).disabled = !document.getElementById(`type${key.value}`).disabled
                                                                        document.getElementById(`hosts${key.value}`).disabled = !document.getElementById(`hosts${key.value}`).disabled
                                                                        document.getElementById(`edit${key.value}`).disabled = !document.getElementById(`edit${key.value}`).disabled
                                                                        document.getElementById(`submit${key.value}`).disabled = !document.getElementById(`submit${key.value}`).disabled
                                                                    }} className="btn btn-primary btn-chronokeep">
                                                                        <img src={gear} alt={`edit key ${key.value}`} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                {status &&
                                                    <div className={'alert alert-danger chronokeep-alert'}>status</div>
                                                }
                                            </div>
                                        </div>
                                    </Form>
                                )}
                            </Formik>
                        </div>
                    )
                })
            }
        </div>
    )
}

export default KeyInfo;