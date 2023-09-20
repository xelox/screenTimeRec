import activeWindow from "active-win";
import {format} from 'date-fns';
import db_controller from "./db_controller";
import extractFileIcon from "extract-file-icon";
import path from "path";
import fs from "fs";
import { exec } from "child_process"

export type tmpActivityMap = {
    [application: string]: {
        activeTime: number,
        inactiveTime: number,
        path?: string,
        icon?: boolean
    }
}

type activeWinSchema = {
    app: string,
    title: string,
    path: string,
}

const getActiveWinFnFactory = async () => {
    const isHypr = await new Promise<boolean>((res, _rej) => {
        exec('hyprctl', (err, _stdout, _stderr)=>{
            res(Boolean(err))
        })
    })   
    if(isHypr) return (): Promise<activeWinSchema | null> => {
        return new Promise((res, _rej) => {
            exec('hyprctl activewindow -j', (err, stdout, _stderr) => {
                if(err) return res(null);
                const win = JSON.parse(stdout);
                exec(`readlink /proc/${win.pid}/exe`, (err, stdout, _stderr) => {
                    if(err) return res(null);
                    const path = stdout;
                    res({app: win.class, title: win.title, path});
                })
            })
        });
    } 
    return (): Promise<activeWinSchema | null> => {
        return new Promise((res, _rej) => {
            activeWindow().then(win => {
                if(!win) return res(null);
                const app = win.owner.name;
                const title = win.title;
                const path = win.owner.path;
                return res({app, title, path})
            })
        })
    }
}


export default class TrackerController{
    private activityMap: tmpActivityMap = {};

    private checkInterval: number;
    private saveInterval: number;
    private activityTimeout: number;

    private lastCheckDate = format(Date.now(), 'yyyy-MM-dd');
    private lastCheckTs: number = Date.now();

    private isActive: boolean = false;
    private isActiveExpiredTimer: NodeJS.Timeout | null = null;
    private getActiveWin: () => Promise<activeWinSchema | null> = () => { return new Promise((res, _r) => res(null)) }

    private iconOutputDir = path.join(process.env.APPDATA ?? '.', 'screenTimeRec', 'icons');
    constructor(options: {
        checkInterval: number,
        saveInterval: number,
        activityTimeout: number
    }){
        this.checkInterval = options.checkInterval;
        this.saveInterval = options.saveInterval;
        this.activityTimeout = options.activityTimeout;

        this.init()
    }

    private init = async () => {
        if(!fs.existsSync(this.iconOutputDir)) fs.mkdirSync(this.iconOutputDir, {recursive: true});
        
        this.getActiveWin = await getActiveWinFnFactory();

        const expire = ()=>{ 
            this.isActive = false; 
        };
        this.isActiveExpiredTimer = setInterval(expire, this.activityTimeout);        
        setTimeout(this.initialize, 1000);

    }

    private trackActiveWindowTime = () => {
        this.getActiveWin().then(win=>{
            const dateNow = format(Date.now(), 'yyyy-MM-dd');
            if(dateNow !== this.lastCheckDate) {
                this.saveActivityMap(this.lastCheckDate);
                this.activityMap = {};
            }
            this.lastCheckDate = dateNow;

            const appName = win?.app || 'unknown';
            const path = win?.path;

            const now = Date.now();
            const dt = now - this.lastCheckTs;
            this.lastCheckTs = now;

            const application = this.activityMap[appName];
            if(application){
                if(this.isActive) application.activeTime += dt;
                else application.inactiveTime += dt;
            }
            else{
                this.activityMap[appName] = {
                    activeTime: this.isActive ? dt : 0,
                    inactiveTime: this.isActive ? 0 : dt,
                    path,
                }
            }

            console.clear()
            console.log(appName, path)

        }).finally(()=>{
            setTimeout(this.trackActiveWindowTime, this.checkInterval);
        })
    }

    private saveActivityMap = (useDate?: string) => {
        const date = useDate || format(Date.now(), 'yyyy-MM-dd');
        this.saveIcons();
        db_controller.saveActivity(this.activityMap, date);
        if(!useDate) setTimeout(this.saveActivityMap, this.saveInterval);
    }

    private initialize = () => {
        db_controller.getInitialData(this.lastCheckDate, (rows)=>{
            for(const row of rows){
                const application = this.activityMap[row.application];
                if(application){
                    if(row.active) application.activeTime += row.time;
                    else application.inactiveTime += row.time;
                }
                else{
                    this.activityMap[row.application] = {
                        activeTime: row.active ? row.time : 0,
                        inactiveTime: row.active ? 0 : row.time,
                        icon: true,
                    }
                }
            }
            this.trackActiveWindowTime();
            this.saveActivityMap();
        });
    }

    private saveIcons = () => {
        for(const [application, props] of Object.entries(this.activityMap)){
            if(props.icon || !props.path) continue;
            if(fs.existsSync(path.join(this.iconOutputDir, application + '.png'))) continue;
            
            const iconBuffer = extractFileIcon(props.path, 32)
            fs.writeFileSync(path.join(this.iconOutputDir, application + '.png'), iconBuffer);
            props.icon = true;
        }
    }
}
