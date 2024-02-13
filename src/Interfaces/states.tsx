import { FormikErrors } from "formik"
import { Account, Distance, Event, EventYear, Key, Person, TimeResult } from "./types"
import KeyInfo from "../Parts/KeyInfo"

export interface AccountInfoState {
    nameDisabled: boolean
    emailDisabled: boolean
    passwordHidden: boolean
    show: boolean
    changePassword: boolean
    oldPassword: string | null
    password: string | null
    changeEmail: boolean
    email: string | null
    account: Account
    email_actions: { setValues: (values: React.SetStateAction<{
                        username: string;
                    }>, shouldValidate?: boolean | undefined) => Promise<void | FormikErrors<{
                        username: string;
                    }>>,
                setStatus: (status?: any) => void,
                setSubmitting: (isSubmitting: boolean) => void } | null
    password_actions: { setValues: (values: React.SetStateAction<{
                        oldPassword: string;
                        password: string;
                        repeatPassword: string;
                    }>, shouldValidate?: boolean | undefined) => Promise<void | FormikErrors<{
                        oldPassword: string;
                        password: string;
                        repeatPassword: string;
                    }>>,
        setStatus: (status?: any) => void,
        setSubmitting: (isSubmitting: boolean) => void } | null
    path: string
}

export interface BaseState {
    status: number
    loading: boolean
    error: boolean
    message: string | null
}

export interface AccountPageState extends BaseState {
    keys: Key[]
    account: Account
    events: Event[]
    show: boolean
    deleteKey: Key | null
    childKey: KeyInfo | null
}

export interface KeyState {
    isDisabled: boolean
    key: Key
}

export interface EventsState extends BaseState {
    events: Event[]
}

export interface LoginState {
    success: boolean
}

export interface PersonState extends BaseState {
    distance: Distance | null
    event: Event
    year: EventYear
    results: TimeResult[]
    person: Person
}

export interface QRState {
    status: number
    value: string
    loading: boolean
    error: boolean
    message: string | null
    event: Event
    year: string | undefined
    page_name: string
}

export interface ResultsState extends BaseState {
    count: number
    event: Event | null
    years: EventYear[]
    year: EventYear | null
    results: { [index: string]: TimeResult[] }
}

export interface AwardsState extends ResultsState {
    numAG: number
    numOV: number
    overallInc: boolean
    grandMasters: boolean
    masters: boolean
}