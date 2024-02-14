import { Component } from 'react';
import { userService } from '../Auth/_services/user.service';
import AccountInfo from '../Parts/AccountInfo';
import ErrorMsg from '../Parts/ErrorMsg';
import Footer from '../Parts/Footer';
import Header from '../Parts/Header';
import KeyInfo from '../Parts/KeyInfo';
import Loading from '../Parts/Loading';
import NewKey from '../Parts/NewKey';
import Modal from '../Parts/Modal';
import { Link, Navigate } from 'react-router-dom';

import { Key } from '../Interfaces/types'
import { PageProps } from '../Interfaces/props';
import { AccountPageState } from '../Interfaces/states';
import { ErrorResponse, ErrorWithStatus, GetAccountResponse } from '../Interfaces/responses';

class Account extends Component<PageProps, AccountPageState> {
    state: AccountPageState = {
        keys: [],
        account: {
            email: '',
            name: '',
            type: ''
        },
        events: [],
        show: false,
        deleteKey: null,
        childKey: null,
        status: 0,
        loading: true,
        error: false,
        message: null,
    }

    hideModal = () => {
        this.setState({
            show: false,
            deleteKey: null,
            childKey: null
        });
    }

    componentDidMount() {
        userService.getAccountInfo(this.props.page === "account" ? "API" : "REMOTE")
            .then(
                data => {
                    if (Object.prototype.hasOwnProperty.call(data.data, 'keys')) {
                        const dta = data.data as GetAccountResponse
                        const sortedKeys = dta.keys.sort((a: Key, b: Key) => {
                            if (a.name !== b.name) {
                                return ('' + b.name).localeCompare(a.name)
                            }
                            return ('' + a.value).localeCompare(b.value)
                        })
                        this.setState({
                            status: data.status,
                            account: dta.account,
                            keys: sortedKeys,
                            events: dta.events ? dta.events : [],
                            loading: false,
                        })
                    } else {
                        const err = data.data as ErrorResponse
                        this.setState({
                            loading: false,
                            error: true,
                            message: err.message,
                            status: data.status
                        })
                    }
                },
                error => {
                    if (Object.prototype.hasOwnProperty.call(error, 'message')) {
                        const err = error as ErrorWithStatus
                        this.setState({
                            error: true,
                            message: err.message,
                            status: err.status
                        })
                    } else {
                        this.setState({
                            error: true
                        })
                    }
                }
            )
    }

    remove(key: Key, child: KeyInfo) {
        this.setState({
            show: true,
            deleteKey: key,
            childKey: child,
        })
    }

    deleteKey = () => {
        const key = this.state.deleteKey;
        userService.deleteAPIKey(key!.value, this.props.page === "account" ? "API" : "REMOTE")
           .then(
                // delete was successful
                () => {
                    const keys = this.state.keys;
                    const newKeys = []
                    let i = 0;
                    while (i < keys.length) {
                        if (keys[i].value !== key!.value) {
                            newKeys.push(keys[i])
                        }
                        i++;
                    }
                    this.setState({
                        keys: newKeys,
                        show: false,
                        deleteKey: null,
                    })
                },
                // failed
                error => {
                    this.setState({
                        show: false,
                        deleteKey: null,
                    })
                    if (Object.prototype.hasOwnProperty.call(error, 'message')) {
                        const err = error as ErrorWithStatus
                        console.log("error", err.message)
                    }
                });
    }

    add(key: Key) {
        const newKeys = [...this.state.keys]
        newKeys.push(key);
        this.setState({
            keys: newKeys,
        })
    }

    render() {
        const state = this.state;
        document.title = `Chronokeep - ${this.props.page === 'account' ? 'Account' : 'Remote'}`
        if (state.error === true && [401, 403].indexOf(state.status) !== -1) {
            return <Navigate to={'/login'} state={{ from: '/account' }} replace={true} />
        }
        if (state.error === true) {
            document.title = `Chronokeep - Error`
            return (
                <div>
                    <Header page={this.props.page} />
                    <ErrorMsg status={state.status} message={state.message} />
                    <Footer />
                </div>
            )
        }
        if (state.loading === true) {
            return (
                <div>
                    <Header page={this.props.page} />
                    <div className="mx-auto sm-max-width text-center container-md border border-light p-5 pt-4">
                        <h1 className="text-important display-5">Loading Account</h1>
                        <Loading />
                    </div>
                    <Footer />
                </div>
            )
        }
        const keys = state.keys;
        const account = state.account;
        return (
            <div>
                <Header page={this.props.page} />
                <div className="account-container">
                    {
                        this.props.page == 'remote' &&
                        <div className="mx-auto fit-width mt-3">
                            <Link to={'/remote/logout'} className="btn btn-danger btn-chronokeep">Logout</Link>
                        </div>
                    }
                    { account && 
                        <AccountInfo account={account} />
                    }
                    { keys && keys.length > 0 && 
                        <div className="key-info-container">
                            <h4 className="text-center">Keys</h4>
                            <Modal id="keys-modal" show={state.show} handleClose={this.hideModal} save={this.deleteKey} title="Warning" text="Deletion of this key is permanent." saveText="Delete" />
                            <NewKey parent={this} page={this.props.page} />
                            {
                                keys.map(key => {
                                    return (
                                        <KeyInfo keyItem={key} key={key.value} parent={this} page={this.props.page} />
                                    )
                                })
                            }
                        </div>
                    }
                </div>
                <Footer />
            </div>
        )
    }
}

export default Account;