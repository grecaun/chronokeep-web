import React, { Component } from 'react';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';

import { authenticationService } from '../Auth/_services/authentication.service';
import Header from '../Parts/Header';
import Footer from '../Parts/Footer';

class Login extends Component {
    constructor(props) {
        super(props);
        
        if (authenticationService.currentUserValue) {
            this.props.history.push('/');
        }
    }

    render() {
        document.title = `Chronokeep - Login`
        return (
            <div>
                { Header("login") }
                <div className="mx-auto sm-max-width text-center container-md border border-light p-5 pt-4">
                    <h2>Login</h2>
                    <Formik
                        initialValues={{
                            username: '',
                            password: ''
                        }}
                        validationSchema={Yup.object().shape({
                            username: Yup.string().required('Email is required'),
                            password: Yup.string().required('Password is required')
                        })}
                        onSubmit={({ username, password }, { setStatus, setSubmitting }) => {
                            setStatus();
                            authenticationService.login(username, password)
                                .then(
                                    user => {
                                        const { from } = this.props.location.state || { from: { pathname: "/" } };
                                        this.props.history.push(from);
                                        window.location.reload();
                                    },
                                    error => {
                                        setSubmitting(false);
                                        setStatus(error.message);
                                    }
                                );
                        }}
                        >
                            {({ errors, status, touched, isSubmitting }) => (
                            <Form>
                                <div className="form-group">
                                    <label htmlFor="username">Email</label>
                                    <Field name="username" type="text" className={'form-control' + (errors.username && touched.username ? ' is-invalid' : '')} />
                                    <ErrorMessage name="username" component="div" className="invalid-feedback" />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="password">Password</label>
                                    <Field name="password" type="password" className={'form-control' + (errors.password && touched.password ? ' is-invalid' : '')} />
                                    <ErrorMessage name="password" component="div" className="invalid-feedback" />
                                </div>
                                <div className="form-group">
                                    <button type="submit" className="btn btn-primary" disabled={isSubmitting}>Login</button>
                                    {isSubmitting &&
                                        <div className="d-flex justify-content-center align-items-center">
                                            <div className="spinner-border text-primary ck-spinner m-5" role="status">
                                                <span className="visually-hidden">Loading...</span>
                                            </div>
                                        </div>
                                    }
                                </div>
                                {status &&
                                    <div className={'alert alert-danger'}>{status}</div>
                                }
                            </Form>
                        )}
                        </Formik>
                </div>
                { Footer() }
            </div>
        )
    }
}

export default Login;