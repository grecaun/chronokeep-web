import { Component } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';

import { authenticationService } from '../Auth/_services/authentication.service';
import Header from '../Parts/Header';
import Footer from '../Parts/Footer';
import { LoginProps } from '../Interfaces/props';
import { LoginState } from '../Interfaces/states';

class Login extends Component<LoginProps, LoginState> {
    state: LoginState = {
        success: false,
    }

    render() {
        const state = this.state;
        if (state.success 
            || (authenticationService.currentUserValue && this.props.page === 'account') 
            || (authenticationService.currentRemoteUserValue && this.props.page === 'remote')) {
            var location = this.props.location;
            var destination: string = '/';
            if (location.state !== null && location.state.from != null) {
                destination =  location.state.from;
            }
            return <Navigate to={destination} replace={true} />
        }
        document.title = `Chronokeep - Login`
        return (
            <div>
                <Header page={this.props.page} />
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
                            authenticationService.login(username, password, this.props.page === 'account' ? 'API' : 'REMOTE')
                                .then(
                                    () => {
                                        this.setState({
                                            success: true,
                                        })
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
                                    <label className="chronokeep-form-label" htmlFor="username">Email</label>
                                    <Field name="username" type="text" autoComplete="username" className={'chronokeep-input form-control' + (errors.username && touched.username ? ' is-invalid' : '')} />
                                    <ErrorMessage name="username" component="div" className="invalid-feedback" />
                                </div>
                                <div className="form-group">
                                    <label className="chronokeep-form-label" htmlFor="password">Password</label>
                                    <Field name="password" type="password" autoComplete="current-password" className={'chronokeep-input form-control' + (errors.password && touched.password ? ' is-invalid' : '')} />
                                    <ErrorMessage name="password" component="div" className="invalid-feedback" />
                                </div>
                                <div className="form-group">
                                    {!isSubmitting &&
                                    <button type="submit" className="btn btn-primary btn-chronokeep btn-margin-top" disabled={isSubmitting}>Login</button>
                                    }
                                    {isSubmitting &&
                                        <div className="d-flex justify-content-center align-items-center login-spinner-container">
                                            <div className="spinner-border text-chronokeep" role="status">
                                                <span className="visually-hidden">Loading...</span>
                                            </div>
                                        </div>
                                    }
                                </div>
                                {status &&
                                    <div className={'alert alert-danger chronokeep-alert'}>{status}</div>
                                }
                            </Form>
                        )}
                        </Formik>
                </div>
                <Footer />
            </div>
        )
    }
}

export default (props: any) => (
    <Login
        {...props}
        location={useLocation()}
    />);