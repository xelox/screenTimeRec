"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const active_win_1 = __importDefault(require("active-win"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const yaml_1 = __importDefault(require("yaml"));
const date_fns_1 = require("date-fns");
const optionsStr = fs_1.default.readFileSync("options.yaml", "utf-8");
const options = yaml_1.default.parse(optionsStr);
let current = null;
let lastTs = Date.now();
const mem = new Map();
//the absolute path to the folder data being in the userdata folder of the app
const dataPath = (_a = options.outputDir) !== null && _a !== void 0 ? _a : path_1.default.join(process.env.APPDATA || '', 'Simple Application Usage Time Tracker', 'data');
//create the folder data if it doesn't exist
fs_1.default.mkdirSync(dataPath, { recursive: true });
//the start time of the program as a string like 28-12-2020 12:00:00
let startTime = Date.now();
const saveData = () => {
    var _a;
    //the start time of the program as 12-25-2020.json
    const filename = (0, date_fns_1.format)(Date.now(), (_a = options.filenameFormat) !== null && _a !== void 0 ? _a : "yyyy-dd-mm") + '.json';
    const lastSave = Date.now();
    const tmp = { startTime, lastSave, data: {} };
    for (const [name, info] of Array.from(mem.entries()).sort((a, b) => { return b[0] < a[0] ? -1 : 1; })) {
        tmp.data[name] = info;
    }
    const data = JSON.stringify(tmp, null, 4);
    //save data to a file in the folder data with the name of the current date.
    fs_1.default.writeFileSync(path_1.default.join(dataPath, filename), data, "utf-8");
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
        setTimeout(trackActiveWindowTime, options.delay);
        saveData();
    });
};
const initialize = () => {
    var _a;
    const filename = (0, date_fns_1.format)(Date.now(), (_a = options.filenameFormat) !== null && _a !== void 0 ? _a : "yyyy-MM-dd") + '.json';
    //check if the file exists
    if (!fs_1.default.existsSync(path_1.default.join(dataPath, filename)))
        return;
    const existingDataStr = fs_1.default.readFileSync(path_1.default.join(dataPath, filename), "utf-8");
    if (existingDataStr) {
        const existingData = JSON.parse(existingDataStr);
        startTime = existingData.startTime;
        for (const [name, element] of Object.entries(existingData.data)) {
            console.log(name, element);
            const elementAs = element;
            mem.set(name, elementAs);
        }
    }
};
initialize();
trackActiveWindowTime();
