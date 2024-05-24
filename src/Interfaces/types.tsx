export interface Event {
    name: string
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