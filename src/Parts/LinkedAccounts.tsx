import { ErrorMessage, Field, Form, Formik } from "formik";
import { Component } from "react";
import * as Yup from 'yup';
import { LinkedAccountsProps } from "../Interfaces/props";
import { userService } from "../Auth/_services/user.service";
import { ErrorWithStatus, ModifyAccountResponse } from "../Interfaces/responses";
import Submitting from "./Submitting";
import { LinkedAccountsState } from "../Interfaces/states";
import trash from '/img/trash.svg';
import { Account } from "../Interfaces/types";

class LinkedAccounts extends Component<LinkedAccountsProps, LinkedAccountsState> {
    state: LinkedAccountsState = {
        accounts: [],
    }

    componentDidMount() {
        this.setState({
            accounts: this.props.accounts,
        })
    }

    render () {
        const accounts = this.state.accounts;
        return (
            <div className="event-list accordion chronokeep-card" id="link-accordion">
                <div className="accordion-item">
                    <h2 className="accordion-header chronokeep-card-header text-center text-important">
                        <button className="accordion-button chronokeep-card-header" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-link" aria-expanded="false" aria-controls="collapse-link">
                            Linked Accounts
                        </button>
                    </h2>
                    <div id="collapse-link" className="accordion-collapse collapse" data-bs-parent="#link-accordion">
                        <div className="accordion-body">
                            <Formik
                                enableReinitialize={true}
                                initialValues={{
                                    email: "",
                                }}
                                validationSchema={Yup.object().shape({
                                    email: Yup.string().email('Invalid email format').required('Email is required'),
                                })}
                                onSubmit={({ email }, { setStatus, setSubmitting, resetForm }) => {
                                    setStatus();
                                    userService.addLinkedAccount(email)
                                        .then(
                                            data => {
                                                if (Object.prototype.hasOwnProperty.call(data.data, 'account')) {
                                                    const dta = data.data as ModifyAccountResponse
                                                    accounts.push(dta.account)
                                                    this.setState({
                                                        accounts: accounts,
                                                    })
                                                }
                                                setSubmitting(false);
                                                resetForm();
                                            },
                                            error => {
                                                if (Object.prototype.hasOwnProperty.call(error, 'message')) {
                                                    const e = error as ErrorWithStatus
                                                    setStatus(e.message)
                                                }
                                                setSubmitting(false);
                                            }
                                        )  
                                }}
                                >
                                {({ errors, status, touched, isSubmitting }) => (
                                    <Form className="link-accounts-form">
                                        <div className="row justify-content-center pt-0 p-3">
                                            <div className="col">
                                                <label className="chronokeep-label form-label-sm" htmlFor="email">Email</label>
                                                <div className="row justify-content-center align-items-top gx-1">
                                                    <div className="col chronokeep-middle">
                                                        <Field name="email" type="text" id="email-field" className={'chronokeep-input form-control form-control-sm' + (errors.email && touched.email ? ' is-invalid' : '')} />
                                                        <ErrorMessage name="email" component="div" className="invalid-feedback" />
                                                    </div>
                                                    <div className="col-auto align-items-center text-center">
                                                        {!isSubmitting &&
                                                            <button type="submit" key="submit-add-account" className="btn btn-danger btn-chronokeep" id="add-account-button">
                                                                Add
                                                            </button>
                                                        }
                                                        {isSubmitting &&
                                                            <Submitting />
                                                        }
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
                            { accounts.map(account => {
                                return (
                                    <div key={account.email} className="row justify-content-center align-items-top gx-1 m-1">
                                        <div className="chronokeep-linked-account-name chronokeep-label align-items-center col-auto m-2">{account.name}</div>
                                        <div className="col-auto align-items-center text-center m-0">
                                            <button className="btn btn-danger btn-chronokeep" onClick={() => {
                                                userService.removeLinkedAccount(account.email);
                                                const newAccounts: Account[] = []
                                                accounts.map(a => {
                                                    if (a.email != account.email) {
                                                        newAccounts.push(a)
                                                    }
                                                })
                                                this.setState({
                                                    accounts: newAccounts
                                                })
                                            }}>
                                                <img src={trash} alt="remove linked account" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default LinkedAccounts