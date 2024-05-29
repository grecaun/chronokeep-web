import { userService } from '../Auth/_services/user.service';
import AccountInfo from '../Parts/AccountInfo';
import ErrorMsg from '../Parts/ErrorMsg';
import KeyInfo from '../Parts/KeyInfo';
import Loading from '../Parts/Loading';
import NewKey from '../Parts/NewKey';
import Modal from '../Parts/Modal';
import { Link, Navigate } from 'react-router-dom';
import { Key } from '../Interfaces/types'
import { PageProps } from '../Interfaces/props';
import { AccountPageState } from '../Interfaces/states';
import { ErrorWithStatus } from '../Interfaces/responses';
import { AccountLoader } from '../loaders/account';
import AddAccount from '../Parts/AddAccount';
import EventList from '../Parts/EventList';
import LinkedAccounts from '../Parts/LinkedAccounts';

function hideModal(state: AccountPageState, setState: React.Dispatch<React.SetStateAction<AccountPageState>>) {
    setState({
        ...state,
        show: false,
        deleteKey: null,
        childKey: null
    })
}

function remove(key: Key, child: KeyInfo, state: AccountPageState, setState: React.Dispatch<React.SetStateAction<AccountPageState>>) {
    setState({
        ...state,
        show: true,
        deleteKey: key,
        childKey: child,
    })
}

function deleteKey(props: PageProps, state: AccountPageState, setState: React.Dispatch<React.SetStateAction<AccountPageState>>) {
    const key = state.deleteKey;
    userService.deleteAPIKey(key!.value, props.page === "account" ? "API" : "REMOTE")
       .then(
            // delete was successful
            () => {
                const keys = state.keys;
                const newKeys = []
                let i = 0;
                while (i < keys.length) {
                    if (keys[i].value !== key!.value) {
                        newKeys.push(keys[i])
                    }
                    i++;
                }
                setState({
                    ...state,
                    keys: newKeys,
                    show: false,
                    deleteKey: null,
                    childKey: null,
                })
            },
            // failed
            error => {
                let msg: string | null = null
                if (Object.prototype.hasOwnProperty.call(error, 'message')) {
                    const err = error as ErrorWithStatus;
                    msg = err.message;
                }
                const keys = state.keys;
                const newKeys = []
                let i = 0;
                while (i < keys.length) {
                    if (keys[i].value !== key!.value) {
                        newKeys.push(keys[i])
                    }
                    i++;
                }
                setState({
                    ...state,
                    show: false,
                    keys: newKeys,
                    deleteKey: null,
                    childKey: null,
                    error: true,
                    message: msg
                })
            });
}

function add(key: Key, state: AccountPageState, setState: React.Dispatch<React.SetStateAction<AccountPageState>>) {
    const newKeys = [...state.keys]
    newKeys.push(key);
    setState({
        ...state,
        keys: newKeys
    })
}

function setLoading(state: AccountPageState, setState: React.Dispatch<React.SetStateAction<AccountPageState>>) {
    setState({
        ...state,
        loading: true,
    })
}

function Account(props: PageProps) {
    const {state, setState} = AccountLoader(props.page);
    
    document.title = `Chronokeep - ${props.page === 'account' ? 'Account' : 'Remote'}`
    if (state.error === true && [401, 403].indexOf(state.status) !== -1) {
        let path = '/login';
        if (props.page === 'remote') {
            path = '/remote/login';
        }
        return <Navigate to={path} />
    }
    if (state.error === true) {
        document.title = `Chronokeep - Error`
        return (
            <ErrorMsg status={state.status} message={state.message} />
        )
    }
    if (state.loading === true) {
        return (
            <Loading />
        )
    }
    const keys = state.keys;
    const account = state.account;
    const notRegistration = state.account.type !== "registration";
    const linkingAllowed = state.account.type === "admin" || state.account.type === "paid"
    const events = state.events
    const linked = state.linked
    return (
        <div className="account-container">
            {
                props.page == 'remote' &&
                <div className="mx-auto fit-width mt-3">
                    <Link to={'/remote/logout'} className="btn btn-danger btn-chronokeep">Logout</Link>
                </div>
            }
            { account && 
                <AccountInfo account={account} page={props.page} setLoading={() => { setLoading(state, setState); }} />
            }
            { account.type === "admin" &&
                <AddAccount page={props.page} />
            }
            { linkingAllowed && linked &&
                <LinkedAccounts accounts={linked} />
            }
            { props.page === "account" && events && events.length > 0 &&
                <EventList events={events} />
            }
            { notRegistration && keys && keys.length > 0 && 
                <div className="key-info-container">
                    <h4 className="text-center">Keys</h4>
                    <Modal id="keys-modal" show={state.show} handleClose={() => { hideModal(state, setState) }} save={() => {deleteKey(props, state, setState)}} title="Warning" text="Deletion of this key is permanent." saveText="Delete" />
                    <NewKey addKey={(key: Key) => add(key, state, setState)} page={props.page} />
                    {
                        keys.map(key => {
                            return (
                                <KeyInfo keyItem={key} key={key.value} addKey={(key) => add(key, state, setState)} remove={(key, childKey) => remove(key, childKey, state, setState)} page={props.page} />
                            )
                        })
                    }
                </div>
            }
        </div>
    );
}

export default Account;