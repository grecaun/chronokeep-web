import { useState } from 'react';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { authenticationService } from '../Auth/_services/authentication.service';
import { PageProps } from '../Interfaces/props';
import { LoginState } from '../Interfaces/states';
import { ErrorWithStatus } from '../Interfaces/responses';
import { Navigate } from 'react-router-dom';

function Login(props: PageProps) {
    const [state, setState] = useState<LoginState>({
        page: props.page,
        success: false,
    });
    if (state.success 
        || (authenticationService.currentUserValue && props.page === 'account') 
        || (authenticationService.currentRemoteUserValue && props.page === 'remote')) {
        return <Navigate to={`/${props.page}`} />
    }
    document.title = `Chronokeep - Login`
    return (
        <div className="mx-auto sm-max-width text-center container-md border border-light p-5 pt-4">
            <div className="text-center text-important display-5 m-0 mb-3 mt-2">Login</div>
            <Formik
                enableReinitialize={true}
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
                    authenticationService.login(username, password, props.page === 'account' ? 'API' : 'REMOTE')
                        .then(
                            () => {
                                setState({
                                    ...state,
                                    success: true,
                                })
                            },
                            error => {
                                setSubmitting(false);
                                if (Object.prototype.hasOwnProperty.call(error, 'message')) {
                                    const err = error as ErrorWithStatus
                                    setStatus(err.message);
                                }
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
    )
}

export default Login;