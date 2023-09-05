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
                    category: string
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
                    category: string
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
                    category: string
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
                    category: string
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
                    category: string
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
                    category: string
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
                    category: string
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
    [id: string]: {
        category_id: string,
        category_name: string,
        color: string,
        emojy: string,
    }
}

export type categoryMapSchema = {
    [application: string]: string
}