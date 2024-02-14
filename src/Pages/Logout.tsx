import { Component } from 'react';
import { Navigate } from 'react-router-dom';

import Header from '../Parts/Header';
import Footer from '../Parts/Footer';
import Loading from '../Parts/Loading';

import { authenticationService } from '../Auth/_services/authentication.service';
import { PageProps } from '../Interfaces/props';
import { BaseState } from '../Interfaces/states';
import { ErrorResponse } from '../Interfaces/responses';

class Logout extends Component<PageProps, BaseState> {
    state: BaseState = {
        status: 0,
        loading: true,
        error: false,
        message: null
    }

    componentDidMount() {
        authenticationService.logout(this.props.page === 'account' ? "API" : "REMOTE")
            .then(response => {
                if (response.status !== 200) {
                    this.setState({
                        status: response.status,
                        error: true
                    });
                    return response.json();
                }
                return null;
            })
            .then(data => {
                if (data !== null && Object.prototype.hasOwnProperty.call(data, 'message')) {
                    const err = data as ErrorResponse
                    this.setState({
                        loading: false,
                        message: err.message
                    });
                } else {
                    this.setState({
                        loading: false
                    });
                }
            })
            .catch(error => {
                this.setState({
                    error: true
                });
                console.error("There was an error!", error)
            })
    }

    render() {
        document.title = `Chronokeep - Logout`
        const state = this.state;
        if (state.error === true) {
            document.title = `Chronokeep - Error`
            return (
                <Navigate to={{ pathname: '/' }} />
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
            <Navigate to={{ pathname: '/' }} />
        )
    }
}

export default Logout;