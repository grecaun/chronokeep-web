import { Account, CertDistance, Event, EventYear, Key, Participant, Person, ResultsParticipant, Segment, TimeResult } from "./types";

export interface ModifyKeyResponse {
    key: Key
}

export interface GetKeysResponse {
    keys: Key[]
}

export interface GetAccountResponse {
    account: Account
    keys: Key[]
    events: Event[] | null
    linked: Account[] | null
}

export interface GetAllAccountsResponse {
    accounts: Account[]
}

export interface ModifyAccountResponse {
    account: Account
}

export interface ErrorResponse {
    message: string
}

export interface ErrorWithStatus {
    message: string
    status: number
}

export interface EventYearResponse {
    event: Event
    event_year: EventYear
}

export interface EventYearsResponse {
    event_years: EventYear[]
}

export interface GetEventsResponse {
    events: Event[]
}

export interface GetEventResponse {
    event: Event
    event_years: EventYear[]
    year: EventYear | null
    results: { [index: string]: TimeResult[] }
    participants: ResultsParticipant[]
    distances: CertDistance[] | null
}

export interface ModifyEventResponse {
    event: Event
}

export interface GetParticipantsResponse {
    participants: Person[]
}

export interface GetResultsResponse extends GetEventResponse {
    count: number
    years: EventYear[]
    event_year: EventYear
}

export interface AddResultsResponse {
    count: number
}

export interface GetBibResultsResponse {
    event: Event
    year: EventYear
    results: TimeResult[]
    person: Person
    single_distance: boolean
    segments: Segment[]
    distance: CertDistance | null
}

export interface GetCheckinParticipantsResponse {
    event: Event
    year: EventYear
    participants: Participant[]
}

export interface AddCheckinParticipantResponse {
    participant: Participant
}