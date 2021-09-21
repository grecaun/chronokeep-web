import React from 'react';
import { Formik, Field, Form } from 'formik';
import { userService } from '../Auth/_services/user.service';
import save from '../../img/sd-card.svg';
import trash from '../../img/trash.svg';
import gear from '../../img/gear.svg';

const KeyInfo = (keys) => {
    return (
        <div className="key-info-container">
            <h2>Keys</h2>
            {
                keys.map((key, index) => {
                    const keyVal = key.value;
                    return (
                        <div className="key-info" key={key.value}>
                            <Formik
                                initialValues={{
                                    value: key.value,
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
                                {({ errors, status, touched, isSubmitting }) => (
                                    <div>
                                        <Form className="key-form">
                                            <div className="inline">
                                                <label className="chronokeep-label" htmlFor="value">Key</label>
                                                <Field name="value" type="text" disabled={true} className="chronokeep-input form-control" />
                                                <label className="chronokeep-label" htmlFor="name">Name</label>
                                                <Field name="name" type="text" disabled={true} id={`name${key.value}`} className="chronokeep-input form-control" />
                                                <label className="chronokeep-label" htmlFor="type">Type</label>
                                                <Field as="select" name="type" id={`type${key.value}`} disabled={true}>
                                                    <option value="read">Read</option>
                                                    <option value="write">Write</option>
                                                    <option value="delete">Delete</option>
                                                </Field>
                                                <label className="chronokeep-label" htmlFor="allowedHosts">Allowed Hosts</label>
                                                <Field name="allowedHosts" type="text" disabled={true} id={`hosts${key.value}`} className="chronokeep-input form-control" />
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
                                                <button type="button" key={`delete${key.value}`} id={`edit${key.value}`} disabled={true} onClick={()=>{
                                                    console.log(`deleting key value ${keyVal}`)
                                                }} className="btn btn-primary btn-chronokeep">
                                                    <img src={trash} alt={`delete key ${key.value}`} />
                                                </button>
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
                                        </Form>
                                    </div>
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