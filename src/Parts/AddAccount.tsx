import { ErrorMessage, Field, Form, Formik } from "formik";
import * as Yup from 'yup';
import { Component } from "react";
import Submitting from "./Submitting";
import { userService } from "../Auth/_services/user.service";
import { ErrorResponse, ErrorWithStatus } from "../Interfaces/responses";
import { PageProps } from "../Interfaces/props";

class AddAccount extends Component<PageProps> {

    render () {
        const path = this.props.page === 'account' ? "API" : "REMOTE"
        return (
            <div className="event-list accordion chronokeep-card" id="add-account-accord">
                <div className="accordion-item">
                    <h2 className="accordion-header chronokeep-card-header text-center">
                        <button className="accordion-button chronokeep-card-header" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-add-account" aria-expanded="false" aria-controls="collapse-add-account">
                            Add Account
                        </button>
                    </h2>
                    <div id="collapse-add-account" className="accordion-collapse collapse" data-bs-parent="#add-account-accord">
                        <Formik
                            enableReinitialize={true}
                            initialValues={{
                                name: "",
                                email: "",
                                password: "",
                                type: "registration"
                            }}
                            validationSchema={Yup.object().shape({
                                name: Yup.string().required('Name is required'),
                                email: Yup.string().email('Invalid email format').required('Email is required'),
                                password: Yup.string().required('Password is required'),
                                type: Yup.string().required('Type is required')
                            })}
                            onSubmit={({ name, email, password, type }, { setStatus, setSubmitting, resetForm }) => {
                                setStatus();
                                userService.addAccount(name, email, type, password, path)
                                    .then(
                                        data => {
                                            if (Object.prototype.hasOwnProperty.call(data.data, 'account')){}
                                            else {
                                                const errResponse = data.data as ErrorResponse
                                                setStatus(errResponse.message)
                                            }
                                            setSubmitting(false);
                                            resetForm();
                                        },
                                        error => {
                                            if (Object.prototype.hasOwnProperty.call(error, 'message')) {
                                                const e = error as ErrorWithStatus
                                                setStatus(e.message);
                                            }
                                            setSubmitting(false);
                                        }
                                    )
                            }}
                            >
                            {({ errors, status, touched, isSubmitting }) => (
                                <Form className="add-account-form accordion-body">
                                    <div className="row justify-content-center">
                                        <div className="col">
                                            <div className="col chronokeep-middle">
                                                <label className="chronokeep-label form-label-sm" htmlFor="name">Name</label>
                                                <Field name="name" type="text" id="name-field" className={'chronokeep-input form-control form-control-sm' + (errors.name && touched.name ? ' is-invalid' : '')} />
                                                <ErrorMessage name="name" component="div" className="invalid-feedback" />
                                                <label className="chronokeep-label form-label-sm" htmlFor="email">Username/Email</label>
                                                <Field name="email" type="text" id="email-field" className={'chronokeep-input form-control form-control-sm' + (errors.email && touched.email ? ' is-invalid' : '')} />
                                                <ErrorMessage name="email" component="div" className="invalid-feedback" />
                                                <label className="chronokeep-label form-label-sm" htmlFor="password">Password</label>
                                                <Field name="password" type="password" id="password-field" className={'chronokeep-input form-control form-control-sm' + (errors.password && touched.password ? ' is-invalid' : '')} />
                                                <ErrorMessage name="password" component="div" className="invalid-feedback" />
                                                <label className="chronokeep-label form-label-sm" htmlFor="type">Type</label>
                                                <Field name="type" as="select" id="type-field" className={'chronokeep-input form-control form-control-sm' + (errors.type && touched.type ? ' is-invalid' : '')}>
                                                    { path === "API" && <option value="registration">Registration</option> }
                                                    <option value="free">Free</option>
                                                    <option value="paid">Paid</option>
                                                    <option value="admin">Admin</option>
                                                </Field>
                                                <ErrorMessage name="type" component="div" className="invalid-feedback" />
                                            </div>
                                            <div className="col-auto align-items-center text-center mt-3">
                                                {!isSubmitting &&
                                                    <button type="submit" key="submit-add-account" className="btn btn-danger btn-chronokeep" id="add-account-button">
                                                        Add
                                                    </button>
                                                }
                                                {isSubmitting &&
                                                    <Submitting />
                                                }
                                            </div>
                                            {status &&
                                                <div className={'alert alert-danger chronokeep-alert text-center'}>{status}</div>
                                            }
                                        </div>
                                    </div>
                                </Form>
                            )}
                        </Formik>
                    </div>
                </div>
            </div>
        );
    }
}

export default AddAccount;