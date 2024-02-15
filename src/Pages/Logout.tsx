import { Navigate } from 'react-router-dom';
import { LogoutLoader } from '../loaders/logout';
import { PageProps } from '../Interfaces/props';
import { BaseState } from '../Interfaces/states';
import Loading from '../Parts/Loading';

function Logout(props: PageProps) {
    const state: BaseState = LogoutLoader(props.page);
    if (state.loading === true) {
        return (
            <Loading message='Logging out...' />
        );
    }
    return (
        <Navigate to={'/'} />
    );
}

export default Logout;