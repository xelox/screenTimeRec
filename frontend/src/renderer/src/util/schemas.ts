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
            appData: {
                [key: string]: {
                    total: number
                    inactiveTime: number
                    activeTime: number
                }
            }
        },
        Tue: {
            isCurrentDate?: boolean,
            total: number,
            actualDate: string,
            appData: {
                [key: string]: {
                    total: number
                    inactiveTime: number
                    activeTime: number
                }
            }
        },
        Wed: {
            isCurrentDate?: boolean,
            total: number,
            actualDate: string,
            appData: {
                [key: string]: {
                    total: number
                    inactiveTime: number
                    activeTime: number
                }
            }
        },
        Thu: {
            isCurrentDate?: boolean,
            total: number,
            actualDate: string,
            appData: {
                [key: string]: {
                    total: number
                    inactiveTime: number
                    activeTime: number
                }
            }
        },
        Fri: {
            isCurrentDate?: boolean,
            total: number,
            actualDate: string,
            appData: {
                [key: string]: {
                    total: number
                    inactiveTime: number
                    activeTime: number
                }
            }
        },
        Sat: {
            isCurrentDate?: boolean,
            total: number,
            actualDate: string,
            appData: {
                [key: string]: {
                    total: number
                    inactiveTime: number
                    activeTime: number
                }
            }
        },
        Sun: {
            isCurrentDate?: boolean,
            total: number,
            actualDate: string,
            appData: {
                [key: string]: {
                    total: number
                    inactiveTime: number
                    activeTime: number
                }
            },
        }
    }
}