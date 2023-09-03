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
            actualDateISO?: string,
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
            actualDateISO?: string,
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
            actualDateISO?: string,
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
            actualDateISO?: string,
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
            actualDateISO?: string,
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
            actualDateISO?: string,
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
            actualDateISO?: string,
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

export type relativeDayGraphSchema = {
    max: number,
    min: number,
    total: number,
    totalActive: number,
    totalInactive: number,
    appData: {
        [application: string]: {
            size: number,
            inactiveTime: number,
            activeTime: number,
            total: number
        }
    }
}

export type appListSchema = {
    [key: string]: {
        total: number,
        activeTime: number,
        inactiveTime: number,
    }
}

export type categorySchema = {
    id: string,
    name: string,
    color: string,
    icon: string,
}[]