import React from 'react';

const DateString = (date) => {
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
    const d = new Date(date)
    return (`${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`)
}

export default DateString