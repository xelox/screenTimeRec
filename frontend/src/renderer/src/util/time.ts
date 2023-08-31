//a function that takes elapsed time in miliseconds and returns a string in the format of 1h 1m 1s
export function formatTime(elapsedTime) {
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
    if (minutes > 0) {
        result += `${minutes}m `;
    }
    if (seconds > 0) {
        result += `${seconds}s`;
    }
    return result;
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