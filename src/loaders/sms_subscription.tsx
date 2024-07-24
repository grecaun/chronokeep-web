export async function SendAddSmsSubscription(slug: string, year: string, bib: string, first: string, last: string, phone: string): Promise<boolean> {
    const BASE_URL = import.meta.env.VITE_CHRONOKEEP_API_URL;
    const requestOptions = {
        method: 'POST',
        body: JSON.stringify({
            slug: slug,
            year: year,
            bib: bib,
            first: first,
            last: last,
            phone: phone,
        }),
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + import.meta.env.VITE_CHRONOKEEP_ACCESS_TOKEN
        }
    }
    return await fetch(BASE_URL + 'sms/add', requestOptions)
    .then(response => {
        return response.status === 200
    })
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .catch(_ => {
        return false
    });
}