const FormatTime = (seconds, milliseconds, result, chip) => {
    // Calculate the string to display for Time (Chip to Chip time)
    const hour = Math.floor(seconds / 3600)
    var minutes = Math.floor((seconds % 3600) / 60 )
    // Change minutes into a string starting with 0 if its less than 10, i.e. 09
    minutes = minutes < 10 ? `0${minutes}` : minutes
    var sec = seconds % 60
    // Change seconds into a string starting with 0 if its less than 10, i.e. 09
    sec = sec < 10 ? `0${sec}` : sec
    // Only care about tenths of a second
    const mill = Math.floor(milliseconds / 100)
    // Check if not a finish time and we're outputting the chip time
    if (result.finish !== true && chip === true) {
        return result.segment
    }
    // Check for DNF
    if (result.type === 3) {
        if (chip === true) {
            return 'DNF'
        }
        return ''
    }
    // Only show hour if it exists.
    if (hour > 0) {
        return (`${hour}:${minutes}:${sec}.${mill}`)
    }
    return (`${minutes}:${sec}.${mill}`)
}

export default FormatTime