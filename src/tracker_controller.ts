import activeWindow from "active-win";
import {format} from 'date-fns';
import {GlobalKeyboardListener} from "node-global-key-listener";
import db_controller from "./db_controller";


export type tmpActivityMap = {
    [application: string]: {
        activeTime: number,
        inactiveTime: number,
        path?: string,
        icon?: boolean
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
    private v = new GlobalKeyboardListener();

    constructor(options: {
        checkInterval: number,
        saveInterval: number,
        activityTimeout: number
    }){
        this.checkInterval = options.checkInterval;
        this.saveInterval = options.saveInterval;
        this.activityTimeout = options.activityTimeout;

        const expire = ()=>{ this.isActive = false; };
        this.isActiveExpiredTimer = setInterval(expire, this.activityTimeout);
        this.v.addListener((key, event)=>{
            this.isActive = true;
            if(this.isActiveExpiredTimer) clearTimeout(this.isActiveExpiredTimer);
            this.isActiveExpiredTimer = setTimeout(expire, this.activityTimeout);
        });

        setTimeout(this.initialize, 1000);
    }

    private trackActiveWindowTime = () => {
        activeWindow().then(win=>{
            const dateNow = format(Date.now(), 'yyyy-MM-dd');
            if(dateNow !== this.lastCheckDate) {
                this.saveActivityMap(this.lastCheckDate);
                this.activityMap = {};
            }
            this.lastCheckDate = dateNow;

            const appName = win?.owner.name || 'unknown';
            const path = win?.owner.path;

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
        }).finally(()=>{
            setTimeout(this.trackActiveWindowTime, this.checkInterval);
        })
    }

    private saveActivityMap = (useDate?: string) => {
        const date = useDate || format(Date.now(), 'yyyy-MM-dd');
        db_controller.saveActivity(this.activityMap, date);
        if(!useDate) setTimeout(this.saveActivityMap, this.saveInterval);
    }

    private initialize = () => {
        db_controller.getInitialData(this.lastCheckDate, (rows)=>{
            console.log('rows', rows);
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
}