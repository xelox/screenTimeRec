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
//the absolute path to the folder data being in the userdata folder of the app
const dataPath = path_1.default.join(process.env.APPDATA || '', 'Simple Application Usage Time Tracker', 'data');
//create the folder data if it doesn't exist
fs_1.default.mkdirSync(dataPath, { recursive: true });
//the start time of the program as 12-25-2020 12-00-00
const filename = new Date().toLocaleString().replace(/\//g, '-').replace(/,/g, '').replace(/:/g, '-').replace(/ /g, '-') + '.json';
//the start time of the program as a string like 28-12-2020 12:00:00
const startTime = new Date().toLocaleString().replace(/\//g, '-').replace(/,/g, '');
const saveData = () => {
    const lastSave = new Date().toLocaleString().replace(/\//g, '-').replace(/,/g, '');
    const tmp = { startTime, lastSave };
    //current time as HH:MM:SS;
    // const time = new Date().toLocaleTimeString();
    for (const [name, info] of Array.from(mem.entries()).sort((a, b) => { return b[0] < a[0] ? -1 : 1; })) {
        // console.log(name, time);
        tmp[name] = info;
    }
    const data = JSON.stringify(tmp, null, 4);
    //save data to a file in the folder data with the name of the current date.
    fs_1.default.writeFile(path_1.default.join(dataPath, filename), data, (err) => {
        if (err)
            console.error(err);
    });
    // console.log();
};
//a function that tracks the active window and saves the time spent on each window in a map
const trackActiveWindowTime = () => {
    (0, active_win_1.default)().then(win => {
        const now = Date.now();
        const diff = now - lastTs;
        const title = (win === null || win === void 0 ? void 0 : win.title) || 'unknown';
        lastTs = now;
        current = win ? win.owner.name : null;
        if (!current)
            return;
        const memCurrent = mem.get(current);
        if (!memCurrent) {
            const tmp = {};
            tmp[title] = diff;
            mem.set(current, tmp);
            return;
        }
        else {
            if (memCurrent[title])
                memCurrent[title] += diff;
            else
                memCurrent[title] = diff;
        }
    }).catch(err => console.error(err)).finally(() => {
        setTimeout(trackActiveWindowTime, 100);
        saveData();
    });
};
trackActiveWindowTime();
