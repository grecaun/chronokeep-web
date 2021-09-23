import React, { Component } from 'react';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { userService } from '../Auth/_services/user.service';
import Submitting from './Submitting';
import save from '../../img/sd-card.svg';
import gear from '../../img/gear.svg';

class AccountInfo extends Component {
    constructor(props) {
        super(props);

        this.state = {
            nameDisabled: true,
            emailDisabled: true,
            account: props.account,
        }
    }

    render () {
        const account = this.state.account;
        const nameDisabled = this.state.nameDisabled;
        const emailDisabled = this.state.emailDisabled;
        return (
            <div className="account-info card chronokeep-card">
                <h4 className="card-header chronokeep-card-header text-center">Account Info</h4>
                <div className="card-body">
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
                                        account.name = name;
                                        this.setState({
                                            account: account,
                                            nameDisabled: true
                                        });
                                    },
                                    error => {
                                        setSubmitting(false);
                                        setStatus(error.message);
                                        this.setState({
                                            account: account,
                                            nameDisabled: true
                                        });
                                    }
                                )
                        }}
                        >
                            {({ errors, status, touched, isSubmitting }) => (
                                <Form className="name-form">
                                    <div className="row justify-content-center">
                                        <div className="col">
                                            <label className="chronokeep-label form-label-sm" htmlFor="name">Name</label>
                                            <div className="row justify-content-center align-items-top gx-1">
                                                <div className="col chronokeep-middle">
                                                    <Field name="name" type="text" disabled={nameDisabled} id="name-field" className={'chronokeep-input form-control form-control-sm' + (errors.name && touched.name ? ' is-invalid' : '')} />
                                                    <ErrorMessage name="name" component="div" className="invalid-feedback" />
                                                </div>
                                                <div className="col-auto">
                                                    {!isSubmitting &&
                                                        <button type="submit" key="submit-name" className="btn btn-danger btn-chronokeep" id="name-button" disabled={nameDisabled}>
                                                            <img src={save} alt="save name" />
                                                        </button>
                                                    }
                                                    {isSubmitting &&
                                                        <Submitting />
                                                    }
                                                </div>
                                                <div className="col-auto">
                                                    <button type="button" key="edit-name" onClick={()=>{
                                                        this.setState({
                                                            account: account,
                                                            nameDisabled: !nameDisabled
                                                        });
                                                    }} className="btn btn-danger btn-chronokeep">
                                                        <img src={gear} alt="edit name" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        {status &&
                                            <div className={'alert alert-danger chronokeep-alert text-center'}>{status}</div>
                                        }
                                    </div>
                                </Form>
                            )}
                    </Formik>
                    <Formik
                        initialValues={{
                            username: account.email
                        }}
                        validationSchema={Yup.object().shape({
                            username: Yup.string().email('Invalid email format').required('Email is required')
                        })}
                        onSubmit={({ username }, { setStatus, setSubmitting }) => {
                            setStatus();
                            userService.changeEmail(account.email, username)
                                .then(
                                    () => {
                                        // changing email should log the user out
                                        window.location.reload();
                                    },
                                    error => {
                                        setSubmitting(false);
                                        setStatus(error.message);
                                        this.setState({
                                            account: account,
                                            emailDisabled: true
                                        });
                                    }
                                )
                        }}
                        >
                            {({ errors, status, touched, isSubmitting }) => (
                                <Form className="email-form">
                                    <div className="row justify-content-center">
                                        <div className="col">
                                            <label className="chronokeep-label form-label-sm" htmlFor="username">Email</label>
                                            <div className="row justify-content-center align-items-top gx-1">
                                                <div className="col chronokeep-middle">
                                                    <Field name="username" type="text" disabled={emailDisabled} id="email-field" className={'chronokeep-input form-control form-control-sm' + (errors.username && touched.username ? ' is-invalid' : '')} />
                                                    <ErrorMessage name="username" component="div" className="invalid-feedback" />
                                                </div>
                                                <div className="col-auto">
                                                    {!isSubmitting &&
                                                        <button type="submit" key="submit-email" className="btn btn-danger btn-chronokeep" id="email-button" disabled={emailDisabled}>
                                                            <img src={save} alt="save email" />
                                                        </button>
                                                    }
                                                    {isSubmitting &&
                                                        <Submitting />
                                                    }
                                                </div>
                                                <div className="col-auto">
                                                    <button type="button" key="edit-email" onClick={()=>{
                                                        this.setState({
                                                            account: account,
                                                            emailDisabled: !emailDisabled
                                                        });
                                                    }} className="btn btn-danger btn-chronokeep">
                                                        <img src={gear} alt="edit email" />
                                                    </button>
                                                </div>
                                            </div>
                                            {status &&
                                                <div className={'alert alert-danger chronokeep-alert text-center'}>{status}</div>
                                            }
                                        </div>
                                    </div>
                                </Form>
                            )}
                    </Formik>
                    <Formik
                        initialValues={{
                            oldPassword: '',
                            password: '',
                            repeatPassword: ''
                        }}
                        validationSchema={Yup.object().shape({
                            oldPassword: Yup.string().required("You must verify your current password"),
                            password: Yup.string().required("Password is required").min(8, 'Minimum password length is 8.'),
                            repeatPassword: Yup.string().required("You must verify the new password.").oneOf([Yup.ref('password'), null], 'Passwords must match')
                        })}
                        onSubmit={({ oldPassword, password }, { setStatus, setSubmitting } ) => {
                            setStatus();
                            userService.changePassword(oldPassword, password, account.email)
                                .then(
                                    () => {
                                        // changing password should log the user out
                                        window.location.reload();
                                    },
                                    error => {
                                        setSubmitting(false);
                                        setStatus(error.message);
                                    }
                                )
                        }}
                    >
                        {({ errors, status, touched, isSubmitting }) => ( 
                            <Form className="password-form">
                                <div className="hidden" id="change-password-form">
                                    <label className="chronokeep-label form-label-sm" htmlFor="oldPassword">Old Password</label>
                                    <Field name="oldPassword" type="password" className={'chronokeep-input form-control form-control-sm' + (errors.oldPassword && touched.oldPassword ? ' is-invalid' : '')} />
                                    <ErrorMessage name="oldPassword" component="div" className="invalid-feedback" />
                                    <label className="chronokeep-label form-label-sm chronokeep-margin-top" htmlFor="password">New Password</label>
                                    <Field name="password" type="password" className={'chronokeep-input form-control form-control-sm' + (errors.password && touched.password ? ' is-invalid' : '')} />
                                    <ErrorMessage name="password" component="div" className="invalid-feedback" />
                                    <label className="chronokeep-label form-label-sm chronokeep-margin-top" htmlFor="repeatPassword">Repeat New Password</label>
                                    <Field name="repeatPassword" type="password" className={'chronokeep-input form-control form-control-sm' + (errors.repeatPassword && touched.repeatPassword ? ' is-invalid' : '')} />
                                    <ErrorMessage name="repeatPassword" component="div" className="invalid-feedback" />
                                    <div className="text-center chronokeep-margin-top chronokeep-margin-bottom">
                                        {!isSubmitting &&
                                            <button type="submit" key="submitPassword" className="btn btn-danger btn-chronokeep" id="submitPassword" disabled={isSubmitting}>
                                                <img src={save} alt="change password" />
                                            </button>
                                        }
                                        {isSubmitting &&
                                            <Submitting />
                                        }
                                    </div>
                                </div>
                                <div className="text-center">
                                    <button type="button" key="changePassword" id="changePassword" onClick={() => {
                                        var passwordForm = document.getElementById("change-password-form");
                                        console.log(`password form display: ${passwordForm.style.display}`)
                                        if (passwordForm.style.display === "" || passwordForm.style.display === "none") {
                                            passwordForm.style.display = "block";
                                            document.getElementById("changePassword").innerHTML = "Cancel";
                                        } else {
                                            passwordForm.style.display = "none";
                                            document.getElementById("changePassword").innerHTML = "Change Password";
                                        }
                                    }} className="btn btn-danger btn-chronokeep">Change Password</button>
                                </div>
                                {status &&
                                    <div className={'alert alert-danger chronokeep-alert text-center'}>{status}</div>
                                }
                            </Form>
                        )}
                    </Formik>
                </div>
            </div>
        )
    }
}

export default AccountInfo;