import sqlite3 from "sqlite3";
import fs from "fs";
import path from "path";

class DBController {
    private db: sqlite3.Database;

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

    public loadPeriod = (start: string, end: string, callback: (err, rows: any[])=>void) => {
        this.db.all(`
        SELECT application, date, active, time
        FROM application_usage
        WHERE date BETWEEN ? AND ?
        `, [start, end], callback);
    }

    public loadDay = (date: string, callback: (err, rows: any[])=>void) => {
        this.db.all(`
        SELECT application, date, active, time
        FROM application_usage
        WHERE date = ?
        `, [date], callback);
    }
}
export const dbController = new DBController();
