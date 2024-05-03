import { Link, useParams } from 'react-router-dom';
import Loading from '../Parts/Loading';
import ErrorMsg from '../Parts/ErrorMsg';
import { UnsubscribeLoader } from '../loaders/unsubscribe';

function Unsubscribe() {
    const params = useParams();
    const state = UnsubscribeLoader(params);
    document.title = `Chronokeep - Unsubscribe`
    if (state.error === true) {
        document.title = `Chronokeep - Error`
        return (
            <ErrorMsg status={state.status} message={state.message} />
        )
    }
    if (state.loading === true) {
        return (
            <Loading />
        );
    }
    if (state.success) {
        return (
            <div className="mx-auto sm-max-width text-center container-md border border-light p-5 pt-4">
                <h1 className="text-important display-4">Success!</h1>
                <div className="list-group justify-content-center flex-column mt-4">
                    <p>We will no longer send emails to you at {state.email}.</p>
                    <p>If you change your mind <Link to={`/subscribe/${state.email}`}>click here</Link> to let us know we can send you emails again.</p>
                </div>
            </div>
        );
    } else {
        return (
            <div className="container-lg lg-max-width shadow">
                <h2 className="text-important text-primary">Something went wrong and we were unable to add you to our list of people not to email.</h2>
            </div>
        )
    }
}

export default Unsubscribe;