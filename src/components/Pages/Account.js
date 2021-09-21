import React, { Component } from 'react';
import { userService } from '../Auth/_services/user.service';
import AccountInfo from '../Parts/AccountInfo';
import ErrorMsg from '../Parts/ErrorMsg';
import Footer from '../Parts/Footer';
import Header from '../Parts/Header';
import KeyInfo from '../Parts/KeyInfo';
import Loading from '../Parts/Loading';


class Account extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: true,
            error: false,
            keys: [],
            found: null
        }
    }

    componentDidMount() {
        userService.getAccountInfo()
            .then(
                data => {
                    this.setState({
                        status: data.status,
                        found: data.data,
                        account: data.data.account,
                        keys: data.data.keys,
                        events: data.data.events,
                        loading: false,
                    })
                },
                error => {
                    this.setState({
                        error: true,
                        found: error,
                        status: error.status
                    })
                }
            )
    }

    render() {
        document.title = `Chronokeep - Account`
        const state = this.state;
        if (state.error === true) {
            document.title = `Chronokeep - Error`
            return (
                <div>
                    { Header("account") }
                    { ErrorMsg(state.status, state.found) }
                    { Footer() }
                </div>
            )
        }
        if (state.loading === true) {
            return (
                <div>
                    { Header("account") }
                    <div className="mx-auto sm-max-width text-center container-md border border-light p-5 pt-4">
                        <h1 className="text-important display-5">Loading Account</h1>
                        { Loading() }
                    </div>
                    { Footer() }
                </div>
            )
        }
        const keys = state.keys;
        const account = state.account;
        return (
            <div>
                { Header("account") }
                <div className="account-container">
                    { account && 
                        AccountInfo(account)
                    }
                    { keys && keys.length > 0 && 
                        KeyInfo(keys)
                    }
                </div>
                { Footer() }
            </div>
        )
    }
}

export default Account;