import KeyInfo from "../Parts/KeyInfo";
import { Account, Event, EventYear, Key, Participant, TimeResult } from "./types";
import { SetURLSearchParams } from "react-router-dom";

export interface PersonResultsProps {
    results: TimeResult[],
    gender: string
}

export interface AccountInfoProps extends PageProps {
    account: Account
    setLoading: () => void
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

export interface ResultsTableProps {
    distance: string
    results: TimeResult[]
    key: number
    info: { slug: string | undefined, year: string | undefined }
    showTitle: boolean
}

export interface CheckinRowProps {
    participant: Participant
    distances: Set<string>
    event: Event
    year: EventYear
}

export interface AddCheckinProps {
    distances: Set<string>
    event: Event
    year: EventYear
    addParticipant: (p: Participant) => void
}

export interface AwardsProps extends ResultsTableProps {
    numberAG: number
    numberOV: number
    overallInc: boolean
    grandMasters: boolean
    masters: boolean
}

export interface NewKeyProps extends PageProps {
    addKey: (key: Key) => void
}

export interface KeyInfoProps extends NewKeyProps {
    remove: (key: Key, childKey: KeyInfo) => void
    keyItem: Key
}

export interface EventListProps {
    events: Event[]
}

export interface LinkedAccountsProps {
    accounts: Account[]
}