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
        }
    }
}
