import React, { Component } from 'react';

class ErrorMsg extends Component {
    constructor(props) {
        super(props);

        this.state = {
            status: props.status,
            data: props.data,
        }
    }

    render() {
        const status = this.state.status;
        const data = this.state.data;
        if (status === 404) {
            document.title = `Chronokeep - 404 - Off Course`
            return (
                <div className="container-lg lg-max-width mx-auto text-center p-5">
                    <div className="display-1 text-important">{status}</div>
                    <div className="h3">You appear to be off course.</div>
                    { data !== null && data.message !== null &&
                    <div className="h6">{data.message}</div>
                    }
                </div>
            );
        }
        return (
            <div className="container-lg lg-max-width mx-auto text-center p-5">
                <div className="display-1 text-important">{status}</div>
                <div className="h3">Something went wrong. Please contact the site administrator for assistance.</div>
                { data !== null && data.message !== null &&
                    <div className="h6">{data.message}</div>
                    }
            </div>
        )
    }
}

export default ErrorMsg;