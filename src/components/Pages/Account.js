import React, { Component } from 'react';
import { userService } from '../Auth/_services/user.service';
import AccountInfo from '../Parts/AccountInfo';
import ErrorMsg from '../Parts/ErrorMsg';
import Footer from '../Parts/Footer';
import Header from '../Parts/Header';
import KeyInfo from '../Parts/KeyInfo';
import Loading from '../Parts/Loading';
import NewKey from '../Parts/NewKey';


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
                    const sortedKeys = data.data.keys.sort((a, b) => {
                        if (a.name !== b.name) {
                            return ('' + b.name).localeCompare(a.name)
                        }
                        return ('' + a.value).localeCompare(b.value)
                    })
                    this.setState({
                        status: data.status,
                        found: data.data,
                        account: data.data.account,
                        keys: sortedKeys,
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

    remove(value) {
        const keys = this.state.keys;
        const newKeys = []
        var i = 0;
        while (i < keys.length) {
            if (keys[i].value !== value) {
                newKeys.push(keys[i])
            }
            i++;
        }
        this.setState({
            keys: newKeys,
        })
    }

    add(key) {
        const newKeys = [...this.state.keys]
        newKeys.push(key);
        this.setState({
            keys: newKeys,
        })
    }

    render() {
        document.title = `Chronokeep - Account`
        const state = this.state;
        if (state.error === true) {
            document.title = `Chronokeep - Error`
            return (
                <div>
                    <Header page={"account"} />
                    <ErrorMsg status={state.status} data={state.found} />
                    <Footer />
                </div>
            )
        }
        if (state.loading === true) {
            return (
                <div>
                    <Header page={"account"} />
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
                <Header page={"account"} />
                <div className="account-container">
                    { account && 
                        <AccountInfo account={account} />
                    }
                    { keys && keys.length > 0 && 
                        <div className="key-info-container">
                            <h4 className="text-center">Keys</h4>
                            <NewKey parent={this} />
                            {
                                keys.map(key => {
                                    return (
                                        <KeyInfo keyItem={key} key={key.value} parent={this} />
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