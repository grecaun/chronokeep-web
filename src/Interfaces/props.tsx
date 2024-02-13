import { Account, Key, TimeResult } from "./types";
import AccountPage from "../Pages/Account"

export interface PersonResultsProps {
    results: TimeResult[],
    gender: string
}

export interface AccountProps {
    account: Account
    location: any
}

export interface ParamProps {
    params: any 
}

export interface SearchParamProps extends ParamProps {
    search_params: any
}

export interface EmptyProps {}

export interface ModalProps {
    handleClose: () => void
    show: boolean
    save: () => void
    title: string
    saveText: string
    text: string
    id: string
}

export interface ErrorProps {
    status: number,
    message: string | null
}

export interface PageProps {
    page: string;
}

export interface LoginProps extends PageProps {
    location: any
}

export interface ResultsTableProps {
    distance: string
    results: TimeResult[]
    key: number
    info: { slug: string | undefined, year: string | undefined }
    showTitle: boolean
}

export interface AwardsProps extends ResultsTableProps {
    numberAG: number
    numberOV: number
    overallInc: boolean
    grandMasters: boolean
    masters: boolean
}

export interface NewKeyProps extends PageProps {
    parent: AccountPage
}

export interface KeyInfoProps extends NewKeyProps {
    keyItem: Key
}