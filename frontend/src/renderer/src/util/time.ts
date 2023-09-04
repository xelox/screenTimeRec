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
    if(!hours && !minutes && !seconds && elapsedTime > 0)
        return"<1sec";
    else if(!hours && !minutes && !seconds && elapsedTime === 0)
        return"0ms";
    return resultArr.join(" ");
}

export function getMonday(date: Date) {
    const d = new Date(date);
    d.setDate(d.getDate() - d.getDay() + (d.getDay() === 0 ? -6 : 1));
    return d;
}

export function getSunday(date: Date) {
    const d = new Date(date);
    if(d.getDay() === 0) return d;
    const delta = d.getDay() === 1 ? -6 : (8 - d.getDay());
    d.setDate(d.getDate() - delta);
    return d;
}

export function formatTimeHoursOnly(elapsedTime: number) {
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

export function formatTimeOnlyOneUnit(elapsedTime: number) {
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
    if(!hours && !minutes && !seconds)
        return"";
    return resultArr.join(" ");
}

export function isSameDate(date1: Date, date2: Date) {
    // Compare year, month, and day components
    return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
    );
}