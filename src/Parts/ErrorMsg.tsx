import { Component } from 'react';
import { ErrorProps } from '../Interfaces/props';

class ErrorMsg extends Component<ErrorProps> {
    render() {
        const status = this.props.status;
        const message = this.props.message;
        if (status === 404) {
            document.title = `Chronokeep - 404 - Off Course`
            return (
                <div className="container-lg lg-max-width mx-auto text-center p-5">
                    <div className="display-1 text-important">{status}</div>
                    <div className="h3">You appear to be off course.</div>
                    { message !== null &&
                    <div className="h6">{message}</div>
                    }
                </div>
            );
        }
        document.title = `Chronokeep - ${ status }`
        return (
            <div className="container-lg lg-max-width mx-auto text-center p-5">
                <div className="display-1 text-important">{status}</div>
                <div className="h3">Something went wrong. Please contact the site administrator for assistance.</div>
                { message !== null &&
                    <div className="h6">{message}</div>
                    }
            </div>
        )
    }
}

export default ErrorMsg;