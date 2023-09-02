import sqlite3 from "sqlite3";
import { tmpActivityMap } from "./tracker_controller";
import fs from "fs";
import path from "path";

class DBController {
    private db: sqlite3.Database;
    private ready = false;

    constructor() {
        const dbDirPath = path.join(process.env.APPDATA ?? '.', 'screenTimeRec');
        const dbPath = path.join(process.env.APPDATA ?? '.', 'screenTimeRec', 'db.sqlite');
        console.log(dbDirPath);
        if (fs.existsSync(dbDirPath)) {
            fs.mkdirSync(path.dirname(dbDirPath), { recursive: true });
        }
        if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, '', 'utf-8');


        this.db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
            if (err) {
                console.error(err.message);
            } else {
                console.log('Connected to the database');
            }
        });

        this.db.on('error', (err) => {
            console.error(err.message);
        });

        this.db.on('open', () => {
            console.log('open');
        });

        process.on('SIGINT', this.closeDB);
        process.on('SIGTERM', this.closeDB);
    }

    private closeDB = () => {
        this.db.close((err) => {
            if (err) {
                console.error(err.message);
            } else {
                console.log('Closed the database connection');
            }
        });
    }

    public saveActivity = (data: tmpActivityMap, date: string) => {
        if (!this.ready) return false;
        for (const [application, props] of Object.entries(data)) {
            const VALUES_ACTIVE = [application, date, true, props.activeTime];
            const VALUES_INACTIVE = [application, date, false, props.inactiveTime];

            this.db.run(`
            INSERT OR REPLACE INTO application_usage (application, date, active, time)
            VALUES (?, ?, ?, ?)
            `, VALUES_ACTIVE, (err) => { if (err) console.error(err.message); });
            this.db.run(`
            INSERT OR REPLACE INTO application_usage (application, date, active, time)
            VALUES (?, ?, ?, ?)
            `, VALUES_INACTIVE, (err) => { if (err) console.error(err.message); });
        }
    }

    public getInitialData = (date: string, callback: (rows: any[]) => void) => {
        this.db.run(`
            CREATE TABLE IF NOT EXISTS application_usage (
                application VARCHAR(256) NOT NULL,
                date TEXT VARCHAR(10) NULL,
                active BOOLEAN,
                time BIGINT,
                PRIMARY KEY (application, date, active)
              );
            `, [], (err) => {
            if (err) return console.error(err.message);
            else this.ready = true;
            console.log('ready');
            this.db.all(`
                SELECT * 
                FROM application_usage
                WHERE date = ?
                `, [date], (err, rows) => {
                if (err) {
                    console.error(err.message);
                }
                callback(rows);
            });
        });
    }
}

export default new DBController();