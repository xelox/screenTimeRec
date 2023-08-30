import activeWindow from 'active-win';
import fstat from 'fs';
import path from 'path';
import yaml from 'yaml';
import { format } from 'date-fns';

const optionsStr = fstat.readFileSync("options.yaml", "utf-8");
const options: {
    outputDir: string | null,
    filenameFormat: string | null,
    delay: number,
} = yaml.parse(optionsStr);

let current: string | null = null;
let lastTs = Date.now();
const mem = new Map<string, {[title: string]: number}>();

//the absolute path to the folder data being in the userdata folder of the app
const dataPath = options.outputDir ?? path.join(process.env.APPDATA || '', 'Simple Application Usage Time Tracker', 'data');
//create the folder data if it doesn't exist
fstat.mkdirSync(dataPath, {recursive: true});
//the start time of the program as a string like 28-12-2020 12:00:00
let startTime = Date.now();
let lastSaveFile: string | null = null;
const saveData = () => {
    //the start time of the program as 12-25-2020.json
    const filename = format(Date.now(), options.filenameFormat ?? "yyyy-dd-mm") + '.json';
    if(lastSaveFile !== filename) {
        lastSaveFile = filename;
        mem.clear();
        return
    } 
    const lastSave = Date.now();
    const tmp: {
        data: {
            [key:string]: any, 
        }
        startTime: number, 
        lastSave: number,
    } = { startTime, lastSave, data: {}};
    

    for(const [name, info] of Array.from(mem.entries()).sort((a, b)=>{ return b[0] < a[0] ? -1 : 1})){
        tmp.data[name] = info;
    }
    const data = JSON.stringify(tmp, null, 4);
    //save data to a file in the folder data with the name of the current date.
    fstat.writeFileSync(path.join(dataPath, filename), data, "utf-8");
    lastSaveFile = filename;
}

//a function that tracks the active window and saves the time spent on each window in a map
const trackActiveWindowTime = () => {
    activeWindow().then(win=>{
        const now = Date.now();
        const diff = now - lastTs;
        const title = win?.title || 'unknown'
        lastTs = now;
        current = win ? win.owner.name : null;
        if(!current) return;
        const memCurrent = mem.get(current);
        if(!memCurrent) {
            const tmp: {[title:string]: number} = {};
            tmp[title] = diff;
            mem.set(current, tmp);
            return;
        }
        else {
            if(memCurrent[title]) memCurrent[title] += diff;
            else memCurrent[title] = diff;
        }
    }).catch(err=>console.error(err)).finally(()=>{
        setTimeout(trackActiveWindowTime, options.delay);
        saveData();
    })
}

const initialize = () => {

    const filename = format(Date.now(), options.filenameFormat ?? "yyyy-MM-dd") + '.json';
    //check if the file exists
    if(!fstat.existsSync(path.join(dataPath, filename))) return;
    const existingDataStr = fstat.readFileSync(path.join(dataPath, filename), "utf-8");
    if(existingDataStr){
        const existingData = JSON.parse(existingDataStr);
        startTime = existingData.startTime;
        for(const [name, element] of Object.entries(existingData.data)){
            console.log(name, element);
            const elementAs = element as {[title:string]: number};
            mem.set(name, elementAs);
        }
    }
}

initialize();
trackActiveWindowTime();