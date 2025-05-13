import { TimeResult } from "../Interfaces/types"

const FormatTime = (seconds: number, milliseconds: number, result: TimeResult, not_blank: boolean = false, no_millis: boolean = false) => {
    // Calculate the string to display for Time (Chip to Chip time)
    const hour = Math.floor(seconds / 3600)
    let minutes = Math.floor((seconds % 3600) / 60).toString()
    // Change minutes into a string starting with 0 if its less than 10, i.e. 09
    minutes = Number(minutes) < 10 ? `0${minutes}`.toString() : minutes
    let sec = (Math.floor(seconds % 60)).toString()
    // Change seconds into a string starting with 0 if its less than 10, i.e. 09
    sec = Number(sec) < 10 ? `0${sec}`.toString() : sec
    // Only care about tenths of a second
    const mill = Math.floor(milliseconds / 100)
    // Check if not a finish time and we're outputting the chip time
    if (result.finish !== true && not_blank === true) {
        return result.segment
    }
    // Check for DNF
    if (result.type === 3 || result.type === 30) {
        if (not_blank === true) {
            return 'DNF'
        }
        return ''
    }
    // Check for DNS
    if (result.type === 31) {
        if (not_blank === true) {
            return 'DNS'
        }
        return ''
    }
    if (no_millis === true) {
        // Only show hour if it exists.
        if (hour > 0) {
            return (`${hour}:${minutes}:${sec}`)
        }
        return (`${minutes}:${sec}`)
    }
    // Only show hour if it exists.
    if (hour > 0) {
        return (`${hour}:${minutes}:${sec}.${mill}`)
    }
    return (`${minutes}:${sec}.${mill}`)
}

export const FormatPace = (seconds: number) => {
    let minutes = Math.floor(seconds / 60).toString();
    let sec = (seconds % 60).toString();
    // Change seconds into a string starting with 0 if its less than 10, i.e. 09
    sec = Number(sec) < 10 ? `0${sec}`.toString() : sec;
    return (`${minutes}:${sec}`);
}

export const FormatAltPace = (seconds: number, distance: string) => {
    if (distance === "km") {
        let translatedSeconds = Math.floor(seconds * 1.609344);
        let minutes = Math.floor(translatedSeconds / 60).toString();
        let sec = (translatedSeconds % 60).toString();
        sec = Number(sec) < 10 ? `0${sec}`.toString() : sec;
        return (`${minutes}:${sec} / mi`);
    } else if (distance === "mi") {
        let translatedSeconds = Math.floor(seconds * 0.6213712);
        let minutes = Math.floor(translatedSeconds / 60).toString();
        let sec = (translatedSeconds % 60).toString();
        sec = Number(sec) < 10 ? `0${sec}`.toString() : sec;
        return (`${minutes}:${sec} / km`);
    } else {
        return "";
    }
}

export default FormatTime