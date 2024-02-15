import { Account, Key, TimeResult } from "./types";
import AccountPage from "../Pages/Account"
import { Location, SetURLSearchParams } from "react-router-dom";

export interface PersonResultsProps {
    results: TimeResult[],
    gender: string
}

export interface AccountProps {
    account: Account
    location: Location
}

export interface ParamProps {
    params: SlugParams
}

export interface SlugParams  {
    slug?: string,
    year?: string,
    bib?: string
}

export interface SearchParamProps extends ParamProps {
    search_params: [URLSearchParams, SetURLSearchParams]
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
    location: { state?: { from?: string } }
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