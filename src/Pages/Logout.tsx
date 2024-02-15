import { Navigate } from 'react-router-dom';
import { LogoutLoader } from '../loaders/logout';
import { PageProps } from '../Interfaces/props';
import { BaseState } from '../Interfaces/states';
import Loading from '../Parts/Loading';

function Logout(props: PageProps) {
    const state: BaseState = LogoutLoader(props.page);
    if (state.loading === true) {
        return (
            <div className="mx-auto sm-max-width text-center container-md border border-light p-5 pt-4">
                <h1 className="text-important display-5">Logging out...</h1>
                <Loading />
            </div>
        );
    }
    return (
        <Navigate to={'/'} />
    );
}

export default Logout;