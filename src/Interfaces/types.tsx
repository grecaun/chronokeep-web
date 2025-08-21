export interface Event {
    name: string
    cert_name: string
    slug: string
    website: string
    image: string
    contact_email: string
    access_restricted: boolean
    type: string
    recent_time: string
}

export interface EventYear {
    year: string
    date_time: string
    live: boolean
    days_allowed: number
    ranking_type: string
}

export interface TimeResult {
    bib: string
    first: string
    last: string
    seconds: number
    milliseconds: number
    chip_seconds: number
    chip_milliseconds: number
    gender: string
    occurence: number
    age_group: string
    age: number
    ranking: number
    age_ranking: number
    gender_ranking: number
    finish: boolean
    segment: string
    type: number
    anonymous: boolean
    distance: string
    location: string
    local_time: string
    division: string
    division_ranking: number
}

export interface YTPTimeResult extends TimeResult {
    cougar_score: number
    combined_score: number
    highest_score: number
    tiger_score: number
    seward_score: number
}

export interface Key {
    name: string
    value: string
    type: string
    allowed_hosts: string
    valid_until: string | null
}

export interface Account {
    email: string
    name: string
    type: string
}

export interface Person {
    bib: string
    first: string
    last: string
    gender: string
    anonymous: boolean
    distance: string
    age: number
}

export interface ResultsParticipant {
    bib: string
    first: string
    last: string
    gender: string
    distance: string
    age_group: string
}

export interface CertDistance {
    name: string
    certification: string
}

export interface SmsSubscription {
    bib: string
    first: string
    last: string
    phone: string
}

export interface Participant {
    id: string
    bib: string
    first: string
    last: string
    birthdate: string
    gender: string
    age_group: string
    distance: string
    anonymous: boolean
    sms_enabled: boolean
    mobile: string
    apparel: string
}

export interface Distance {
    name: string
    unit: string
    dist: number
}

export interface AuthTokens {
    access_token: string
    refresh_token: string
}

export interface Segment {
    location: string
    distance_name: string
    name: string
    distance_value: number
    distance_unit: string
    gps: string
    map_link: string
}

export enum RankingType {
    Gun = 1,
    Chip
}

export interface SeriesDistance {
    year: string
    name: string
    value: number
    type: string
}

export interface Series {
    name: string
    distances: SeriesDistance[]
    best: number
}

export interface SeriesYear {
    display_year: number
    series: Series[]
}