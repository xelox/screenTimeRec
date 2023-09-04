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
        SELECT 
            application_usage.*, category_map.category_id
        FROM 
            application_usage
        LEFT JOIN 
            category_map ON application_usage.application = category_map.application
        WHERE date BETWEEN ? AND ?
        `, [start, end], callback);
    }

    public loadDay = (date: string, callback: (err, rows: any[])=>void) => {
        this.db.all(`
        SELECT 
            application_usage.*, category_map.category_id
        FROM 
            application_usage
        LEFT JOIN 
            category_map ON application_usage.application = category_map.application
        WHERE application_usage.date = ?
        `, [date], callback);
    }

    public loadCategories = (callback: (err:any, rows: any[])=>void) => {
        this.db.all(`
        SELECT *
        FROM category_props
        `, callback);
    }

    public setAppCategory = (application: string, category: string, callback: (err:any)=>void) => {
        this.db.all(`SELECT * FROM category_map WHERE application = ?`, [application], (err, rows)=>{
            if(err) return callback(err);
            if(rows.length === 0) return this.db.run(`INSERT INTO category_map(application, category_id) VALUES(?, ?)`, [application, category], callback);
            this.db.run(`UPDATE category_map SET category_id = ? WHERE application = ?`, [category, application], callback);
        });
    }

    public saveNewCategoryProp = (category_id: string, category_name: string, color: string, emojy: string, callback: (err:any)=>void) => {
        const props = [category_id, category_name, color, emojy];
        this.db.all(`SELECT * FROM category_props WHERE id = ?`, [category_id], (err, rows)=>{
            if(err) return callback(err);
            if(rows.length === 0) return this.db.run(`INSERT INTO category_props(id, category_name, color, emojy) VALUES(?, ?, ?, ?)`, props, callback);
            this.db.run(`UPDATE category_props SET id = ?, category_name = ?, color = ?, emojy = ? WHERE id = ?`, [...props, category_id], callback);
        })
    }
}
export const dbController = new DBController();
