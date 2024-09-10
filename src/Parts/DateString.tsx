const DateString = (date: string) => {
    const months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
    ]
    const firstSplit = date.split('T')
    if (firstSplit.length < 1) {
        return ""
    }
    const secondSplit = firstSplit[0].split('-')
    if (secondSplit.length < 3) {
        return ""
    }
    const month = Number(secondSplit[1]) - 1;
    const day = Number(secondSplit[2]);
    return (`${months[month]} ${day}, ${secondSplit[0]}`)
}

export default DateString