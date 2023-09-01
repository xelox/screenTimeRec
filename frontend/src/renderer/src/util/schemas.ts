export type stackedWeedGraphSchema = {
    max: number
    min: number
    appMax: number,
    appMin: number,
    dayData: {
        Mon: { 
            isCurrentDate?: boolean,
            total: number,
            actualDate: string,
            appData: {[key: string]: number }
        },
        Tue: {
            isCurrentDate?: boolean,
            total: number,
            actualDate: string,
            appData: {[key: string]: number }
        },
        Wed: {
            isCurrentDate?: boolean,
            total: number,
            actualDate: string,
            appData: {[key: string]: number }
        },
        Thu: {
            isCurrentDate?: boolean,
            total: number,
            actualDate: string,
            appData: {[key: string]: number }
        },
        Fri: {
            isCurrentDate?: boolean,
            total: number,
            actualDate: string,
            appData: {[key: string]: number }
        },
        Sat: {
            isCurrentDate?: boolean,
            total: number,
            actualDate: string,
            appData: {[key: string]: number }
        },
        Sun: {
            isCurrentDate?: boolean,
            total: number,
            actualDate: string,
            appData: {[key: string]: number }
        },
    } 
}