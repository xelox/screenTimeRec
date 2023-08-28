"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const active_win_1 = __importDefault(require("active-win"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
let current = null;
let lastTs = Date.now();
const mem = new Map();
//the absolute path to the folder data
const dataPath = path_1.default.resolve(__dirname, '../data');
const startTime = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: false }).replace(/:/g, '-');
//a function that converts miliseconds to readable time elapsed as a string like 1h 4m and does not show 0h or 0m but it may show 56s
const getTimeElapsed = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const secondsStr = seconds % 60 ? `${seconds % 60}s` : '';
    const minutesStr = minutes % 60 ? `${minutes % 60}m` : '';
    const hoursStr = hours ? `${hours}h` : '';
    return `${hoursStr} ${minutesStr} ${secondsStr}`.trim();
};
const saveData = (endTime) => {
    const tmp = { startTime, endTime };
    for (const [name, time] of Array.from(mem.entries()).sort((a, b) => { return b[0] < a[0] ? -1 : 1; })) {
        tmp[name] = time.dur;
    }
    const data = JSON.stringify(tmp, null, 4);
    //save data to a file in the folder data with the name of the current date.
    const filename = `${new Date().toISOString().split('T')[0]} ${startTime}.json`;
    console.log('Saving to:', filename);
    fs_1.default.writeFile(path_1.default.join(dataPath, filename), data, (err) => {
        if (err)
            console.error(err);
    });
};
//a function that tracks the active window and saves the time spent on each window in a map
const trackActiveWindowTime = () => {
    (0, active_win_1.default)().then(win => {
        const now = Date.now();
        const diff = now - lastTs;
        lastTs = now;
        console.clear();
        console.log('startTime:', startTime);
        current = win ? win.owner.name : null;
        console.log('current:', current);
        if (!current)
            return;
        const memCurrent = mem.get(current);
        if (!memCurrent) {
            mem.set(current, { dur: diff });
            return;
        }
        else
            memCurrent.dur += diff;
    }).catch(err => console.error(err)).finally(() => {
        setTimeout(trackActiveWindowTime, 1000);
        saveData();
        console.log();
        console.log('Total time spent on each window:');
        let i = 0;
        for (const [name, time] of Array.from(mem.entries()).sort((a, b) => { return b[1].dur - a[1].dur; })) {
            i++;
            console.log(`[${i}]:`, name, getTimeElapsed(time.dur));
        }
    });
};
trackActiveWindowTime();
const cleanup = () => {
    const endTime = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: false }).replace(/:/g, '-');
    const tmp = { startTime, endTime };
    for (const [name, time] of Array.from(mem.entries()).sort((a, b) => { return b[0] < a[0] ? -1 : 1; })) {
        tmp[name] = time.dur;
    }
    const data = JSON.stringify(tmp, null, 4);
    //save data to a file in the folder data with the name of the current date.
    const filename = `${new Date().toISOString().split('T')[0]} ${startTime}.json`;
    console.log('Saving to:', filename);
    fs_1.default.writeFileSync(path_1.default.join(dataPath, filename), data);
    process.exit(0);
};
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);
