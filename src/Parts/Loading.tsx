import { Component } from 'react';

class Loading extends Component{
    render() {
        return (
            <div className="d-flex justify-content-center align-items-center">
                <div className="spinner-border text-primary ck-spinner m-5" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }
}

export default Loading;