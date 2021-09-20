import React, { Component } from 'react';
import { userService } from '../Auth/_services/user.service';
import ErrorMsg from '../Parts/ErrorMsg';
import Footer from '../Parts/Footer';
import Header from '../Parts/Header';
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
        userService.getAPIKeys(null)
            .then(
                data => {
                    this.setState({
                        status: data.status,
                        found: data.data,
                        keys: data.data.keys,
                        loading: false
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
        return (
            <div>
                { Header("account") }
                { keys.length > 0 && 
                    <div className="row container-lg lg-max-width mx-auto d-flex align-items-stretch shadow-sm p-0 border border-light">
                        {
                            keys.map((key, index) => {
                                return <p key={`key${index}`}>{key.value}</p>
                            })
                        }
                    </div>
                }
                {
                    keys.length === 0 && 
                    <div className="row container-lg lg-max-width mx-auto d-flex align-items-stretch shadow-sm p-0 border border-light">
                        <div className="text-center">
                            <h2>No keys to display.</h2>
                        </div>
                    </div>
                }
                { Footer() }
            </div>
        )
    }
}

export default Account;