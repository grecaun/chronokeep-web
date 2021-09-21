import React from 'react';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { userService } from '../Auth/_services/user.service';
import save from '../../img/sd-card.svg';
import gear from '../../img/gear.svg';

const AccountInfo = (account) => {
    var oldEmail = account.email;
    return (
        <div className="account-info text-center">
            <h2>Account</h2>
            <Formik
                initialValues={{
                    name: account.name
                }}
                validationSchema={Yup.object().shape({
                    name: Yup.string().required('Name is required')
                })}
                onSubmit={({ name }, { setStatus, setSubmitting }) => {
                    setStatus();
                    userService.updateAccountInfo(name, account.email, account.type)
                        .then(
                            data => {
                                setSubmitting(false);
                                name = data.data.account.name;
                                document.getElementById("name-field").disabled = true;
                                document.getElementById("name-button").disabled = true;
                            },
                            error => {
                                setSubmitting(false);
                                setStatus(error.message);
                                document.getElementById("name-field").disabled = true;
                                document.getElementById("name-button").disabled = true;
                            }
                        )
                }}
                >
                    {({ errors, status, touched, isSubmitting }) => (
                        <div>
                            <Form className="name-form">
                                <div className="inline">
                                    <label className="chronokeep-account-name-label" htmlFor="name">Name</label>
                                    <div className="error-container">
                                        <Field name="name" type="text" disabled={true} id="name-field" className={'chronokeep-input form-control' + (errors.name && touched.name ? ' is-invalid' : '')} />
                                        <ErrorMessage name="name" component="div" className="invalid-feedback" />
                                    </div>
                                    {!isSubmitting &&
                                        <button type="submit" key="submit-name" className="btn btn-primary btn-chronokeep" id="name-button" disabled={true}>
                                            <img src={save} alt="save name" />
                                        </button>
                                    }
                                    {isSubmitting &&
                                        <div className="spinner-border text-chronokeep" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                    }
                                    <button type="button" key="edit-name" onClick={()=>{
                                        document.getElementById("name-field").disabled = !document.getElementById("name-field").disabled
                                        document.getElementById("name-button").disabled = !document.getElementById("name-button").disabled
                                    }} className="btn btn-primary btn-chronokeep">
                                        <img src={gear} alt="edit name" />
                                    </button>
                                </div>
                                {status &&
                                    <div className={'alert alert-danger chronokeep-alert'}>{status}</div>
                                }
                            </Form>
                        </div>
                    )}
            </Formik>
            <Formik
                initialValues={{
                    email: oldEmail
                }}
                validationSchema={Yup.object().shape({
                    email: Yup.string().email('Invalid email format').required('Email is required')
                })}
                onSubmit={({ email }, { setStatus, setSubmitting }) => {
                    setStatus();
                    userService.changeEmail(oldEmail, email)
                        .then(
                            () => {
                                window.location.reload();
                            },
                            error => {
                                setSubmitting(false);
                                setStatus(error.message);
                                document.getElementById("email-field").disabled = true;
                                document.getElementById("email-button").disabled = true;
                            }
                        )
                }}
                >
                    {({ errors, status, touched, isSubmitting }) => (
                        <div>
                            <Form className="name">
                                <div className="inline">
                                    <label className="chronokeep-account-email-label" htmlFor="email">Email</label>
                                    <div className="error-container">
                                        <Field name="email" type="text" disabled={true} id="email-field" className={'chronokeep-input form-control' + (errors.email && touched.email ? ' is-invalid' : '')} />
                                        <ErrorMessage name="email" component="div" className="invalid-feedback" />
                                    </div>
                                    {!isSubmitting &&
                                        <button type="submit" key="submit-email" className="btn btn-primary btn-chronokeep" id="email-button" disabled={true}>
                                            <img src={save} alt="save email" />
                                        </button>
                                    }
                                    {isSubmitting &&
                                        <div className="spinner-border text-chronokeep" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                    }
                                    <button type="button" key="edit-email" onClick={()=>{
                                        document.getElementById("email-field").disabled = !document.getElementById("email-field").disabled
                                        document.getElementById("email-button").disabled = !document.getElementById("email-button").disabled
                                    }} className="btn btn-primary btn-chronokeep">
                                        <img src={gear} alt="edit email" />
                                    </button>
                                </div>
                                {status &&
                                    <div className={'alert alert-danger chronokeep-alert'}>{status}</div>
                                }
                            </Form>
                        </div>
                    )}
            </Formik>
        </div>
    )
}

export default AccountInfo;