import React, { Component } from 'react';
import { userService } from '../Auth/_services/user.service';
import AccountInfo from '../Parts/AccountInfo';
import ErrorMsg from '../Parts/ErrorMsg';
import Footer from '../Parts/Footer';
import Header from '../Parts/Header';
import KeyInfo from '../Parts/KeyInfo';
import Loading from '../Parts/Loading';
import NewKey from '../Parts/NewKey';
import Modal from '../Parts/Modal';


class Account extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: true,
            error: false,
            keys: [],
            found: null,
            show: false,
        }

        this.hideModal = this.hideModal.bind(this);
        this.deleteKey = this.deleteKey.bind(this);
    }

    hideModal = () => {
        this.setState({
            show: false,
            deleteKey: null,
            childKey: null,
        });
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

    remove(key, child) {
        console.log("removing key?")
        this.setState({
            show: true,
            deleteKey: key,
            childKey: child,
        })
    }

    deleteKey = () => {
        const key = this.state.deleteKey;
        const child = this.state.childKey;
        userService.deleteAPIKey(key.value)
           .then(
                // delete was successful
                () => {
                    const keys = this.state.keys;
                    const newKeys = []
                    var i = 0;
                    while (i < keys.length) {
                        if (keys[i].value !== key.value) {
                            newKeys.push(keys[i])
                        }
                        i++;
                    }
                    this.setState({
                        keys: newKeys,
                        show: false,
                        deleteKey: null,
                        childKey: null,
                    })
                },
                // failed
                error => {
                    child.error(error.message);
                    this.setState({
                        show: false,
                        deleteKey: null,
                        childKey: null,
                    })
                });
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
                            <Modal show={state.show} handleClose={this.hideModal} save={this.deleteKey} title="Warning" text="Deletion of this key is permanent."></Modal>
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