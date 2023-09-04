import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
    interface Window {
        electron: ElectronAPI
        api: {
            readDir: (path: string) => Promise<string[]>
            readFile: (path: string) => Promise<string>
            readFileSync: (path: string) => string
            root: string
            path: typeof import('path')
            env: typeof process.env
            loadPeriod: (start: string, end: string, callback: (err, rows: any[])=>void) => void
            loadDay: (date: string, callback: (err, rows: any[])=>void) => void
            loadCategories: (callback: (err:any, rows: any[])=>void) => void
            setAppCategory: (application: string, category: string, callback: (err:any)=>void) => void
            saveNewCategoryProp: (category_id: string, category_name: string, color: string, emojy: string, callback: (err:any)=>void) => void
        }
    }
}
