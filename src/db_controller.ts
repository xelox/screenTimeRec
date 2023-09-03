import sqlite3 from "sqlite3";
import { tmpActivityMap } from "./tracker_controller";
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";

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
            this.runDefaultCategorization();
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

    runDefaultCategorization = () => {
        // this.db.run(`DROP TABLE IF EXISTS category_map;`, [], (err) => {});
        // return;
        this.db.run(`
            CREATE TABLE IF NOT EXISTS category_props (
                category_name VARCHAR(256) NOT NULL,
                color VARCHAR(7) NOT NULL,
                emojy VARCHAR(3) NOT NULL,
                id varchar(36) NOT NULL,
                PRIMARY KEY (id)
              );
            `, [], (err) => {
            if (err) return console.error(err.message);
            console.log('category_props ready');
            const defaultCategories = [
                {name: 'Study', color: '#79ceea', emojy: '🔎'},
                {name: 'Uncategorized', color: '#000000', emojy: '👽'},
                {name: 'Lifestyle', color: '#52ea68', emojy: '🏃‍♂️'},
                {name: 'Work', color: '#dcef4f', emojy: '👨‍💻'},
                {name: 'Social', color: '#4f77ef', emojy: '👨‍👩‍👧‍👦'},
                {name: 'Entertainment', color: '#ba7aef', emojy: '🎮'},
                {name: 'Other', color: '#8c8b81', emojy: '📁'},
            ]

            for(const dc of defaultCategories){
                this.db.all(`
                SELECT id FROM category_props WHERE category_name = ?
                `, [dc.name], (err: any, rows: any) => { 
                    if (err) return console.error(1, err.message); 
                    if(!rows.length) this.db.run(`
                    INSERT INTO category_props (category_name, color, emojy, id)
                    VALUES (?, ?, ?, ?)`, 
                    [dc.name, dc.color, dc.emojy, dc.name], (err) => { 
                        if (err) return console.error(2, err.message); 
                        console.log('category', dc.name, 'created');
                    });
                    else console.log('category', dc.name, 'already exists');
                });
            }
            
        });

        this.db.run(`
            CREATE TABLE IF NOT EXISTS category_map (
                application VARCHAR(256) NOT NULL,
                category_id varchar(36) NOT NULL,
                PRIMARY KEY (application)
                FOREIGN KEY (category_id) REFERENCES category_props(id)
        )`, (err)=>{
            if (err) return console.error(6, err.message);
            console.log('category_map ready');
        });
    }
}

export default new DBController();