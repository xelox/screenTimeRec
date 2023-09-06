import { contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { readdir } from 'fs/promises'
import { readFile } from 'fs/promises';
import path from 'path';
import { readFileSync } from 'fs';
import { dbController } from './db_controller';
// Custom APIs for renderer
const api = {
    readDir: async (path: string) => {
        return readdir(path);
    },
    readFile: async (path: string) => {
        return readFile(path, { encoding: 'utf-8' });
    },
    readFileSync: (path: string) => {
        return readFileSync(path, { encoding: 'utf-8' });
    },
    path: path,
    root: path.resolve(__dirname, '..', '..','..'),
    env: {...process.env},
    loadPeriod: dbController.loadPeriod,
    loadDay: dbController.loadDay,
    loadCategories: dbController.loadCategories,
    setAppCategory: dbController.setAppCategory,
    saveNewCategoryProp: dbController.saveNewCategoryProp,
    argv: process.argv,
    getCurrentAppTime: dbController.getCurrentAppTime,
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
    try {
        contextBridge.exposeInMainWorld('electron', electronAPI)
        contextBridge.exposeInMainWorld('api', api)
    } catch (error) {
        console.error(error)
    }
} else {
    // @ts-ignore (define in dts)
    window.electron = electronAPI
    // @ts-ignore (define in dts)
    window.api = api
}
