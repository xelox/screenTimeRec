//a function that takes elapsed time in miliseconds and returns a string in the format of 1h 1m 1s
export function formatTime(elapsedTime) {
    let seconds = Math.floor(elapsedTime / 1000);
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);
    seconds %= 60;
    minutes %= 60;
    hours %= 60;
    let resultArr = [];
    if (hours > 0) {
        resultArr.push(`${hours}h`);
    }
    if (minutes > 0) {
        resultArr.push(`${minutes}min`);
    }
    if (seconds > 0 && (!hours && !minutes)) {
        resultArr.push(`${seconds}sec`);
    }
    return resultArr.join(" ");
}

export function getMonday(date: Date) {
    var day = date.getDay() || 7; // Get current day of the week (0 is Sunday)
    if (day !== 1) {
        date.setHours(-24 * (day - 1)); // Set the date to the previous Monday
    }
    return date;
}

export function getSunday(date) {
    var day = date.getDay() || 7; // Get current day of the week (0 is Sunday)
    if (day !== 0) {
        date.setHours(24 * (7 - day)); // Set the date to the next Sunday
    }
    return date;
}

export function formatTimeHoursOnly(elapsedTime) {
    let seconds = Math.floor(elapsedTime / 1000);
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);
    seconds %= 60;
    minutes %= 60;
    hours %= 60;
    let result = "";
    if (hours > 0) {
        result += `${hours}h `;
    }
    return result;
}

export function isSameDate(date1: Date, date2: Date) {
    // Compare year, month, and day components
    return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
    );
}