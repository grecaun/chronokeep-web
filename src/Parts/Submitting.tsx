import { Component } from 'react';

class Submitting extends Component {
    render() {
        return (
            <div className="spinner-border text-chronokeep" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        )
    }
}

export default Submitting;