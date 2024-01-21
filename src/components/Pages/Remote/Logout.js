import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';

import Header from '../../Parts/Header';
import Footer from '../../Parts/Footer';
import Loading from '../../Parts/Loading';

import { authenticationService } from '../../Auth/_services/authentication.service';

class Logout extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            error: false,
            found: null
        }
    }

    componentDidMount() {
        authenticationService.logout("REMOTE")
            .then(response => {
                if (response.status !== 200) {
                    this.setState({
                        state: response.state,
                        error: true
                    });
                    return response.json();
                }
                return null;
            })
            .then(data => {
                if (data !== null) {
                    this.setState({
                        loading: false,
                        found: data
                    });
                } else {
                    this.setState({
                        loading: false,
                        found: null
                    });
                }
            })
            .catch(error => {
                this.setState({
                    error: true,
                    errorMessage: error.toString(),
                    found: null
                });
                console.error("There was an error!", error)
            })
    }

    render() {
        document.title = `Chronokeep - Logout`
        const state = this.state;
        if (state.error === true) {
            return (
                <Redirect to={{ pathname: '/' }} />
            )
        }
        if (state.loading === true) {
            return (
                <div>
                    <Header page={"logout"} />
                    <div className="mx-auto sm-max-width text-center container-md border border-light p-5 pt-4">
                        <h1 className="text-important display-5">Attempting to logout.</h1>
                        <Loading />
                    </div>
                    <Footer />
                </div>
            );
        }
        return (
            <Redirect to={{ pathname: '/' }} />
        )
    }
}

export default Logout;