<script lang="ts">
    import { format } from 'date-fns'
    import { getMonday, getSunday } from '../util/time'
    import type { stackedWeedGraphSchema } from '../util/schemas'
    import CustomStackedChart from './CustomStackedChart.svelte'
    import { onMount } from 'svelte'
    let wrapDom: HTMLElement
    let topPos: number

    onMount(() => {
        if (!wrapDom) return
        topPos = wrapDom.getBoundingClientRect().top
    })
    const currentDate = format(new Date(), 'yyyy-MM-dd')
    export let pivotDate: Date

    let graphData: stackedWeedGraphSchema = {
        dayData: {
            Mon: {
                actualDate: null,
                total: 0,
                appData: {}
            },
            Tue: {
                actualDate: null,
                total: 0,
                appData: {}
            },
            Wed: {
                actualDate: null,
                total: 0,
                appData: {}
            },
            Thu: {
                actualDate: null,
                total: 0,
                appData: {}
            },
            Fri: {
                actualDate: null,
                total: 0,
                appData: {}
            },
            Sat: {
                actualDate: null,
                total: 0,
                appData: {}
            },
            Sun: {
                actualDate: null,
                total: 0,
                appData: {}
            }
        },
        max: 0,
        min: 0,
        appMax: 0,
        appMin: 0
    }

    const loadWeek = () => {
        const monday = format(getMonday(pivotDate), 'yyyy-MM-dd')
        const sunday = format(getSunday(pivotDate), 'yyyy-MM-dd')

        window.api.loadPeriod(monday, sunday, (err, rows) => {
            if (err) return console.error(err)
            let tmpData: stackedWeedGraphSchema = {
                dayData: {
                    Mon: {
                        actualDate: null,
                        total: 0,
                        appData: {},
                    },
                    Tue: {
                        actualDate: null,
                        total: 0,
                        appData: {}
                    },
                    Wed: {
                        actualDate: null,
                        total: 0,
                        appData: {}
                    },
                    Thu: {
                        actualDate: null,
                        total: 0,
                        appData: {}
                    },
                    Fri: {
                        actualDate: null,
                        total: 0,
                        appData: {}
                    },
                    Sat: {
                        actualDate: null,
                        total: 0,
                        appData: {}
                    },
                    Sun: {
                        actualDate: null,
                        total: 0,
                        appData: {}
                    }
                },
                max: 0,
                min: 0,
                appMax: 0,
                appMin: 0
            }

            let dI = getMonday(pivotDate).getTime()
            for (let i = 0; i < 7; i++) {
                const date = format(dI, 'yyyy-MM-dd')
                const day = format(dI, 'EEE')
                tmpData.dayData[day].actualDate = format(dI, 'do MMMM')
                dI += 24 * 60 * 60 * 1000
                if (currentDate === date) tmpData.dayData[day].isCurrentDate = true
            }

            for (const row of rows) {
                const app = row.application
                if(app === 'unknown') continue;
                const date = new Date(row.date)
                const day = format(date, 'EEE')
                const time = row.time
                const dayHolder = tmpData.dayData[day]
                dayHolder.total += time
                if(!dayHolder.appData[app]) dayHolder.appData[app] = {
                    total: time,
                    inactiveTime: 0,
                    activeTime: 0,
                }
                else dayHolder.appData[app].total += time
                if(row.active) dayHolder.appData[app].activeTime = time
                else dayHolder.appData[app].inactiveTime = time
            }

            for (const day of Object.values(tmpData.dayData)) {
                if (day.total > tmpData.max) tmpData.max = day.total
                if (day.total < tmpData.min) tmpData.min = day.total
                for (const val of Object.values(day.appData)) {
                    const time = val.total;
                    if (time > tmpData.appMax) tmpData.appMax = time
                    if (time < tmpData.appMin) tmpData.appMin = time
                }
            }
            graphData = tmpData

            // setTimeout(loadWeek, 5_000)
        })
    }
    $: if (pivotDate) loadWeek()
</script>

<main bind:this={wrapDom} style="max-height: calc(100% - {topPos}px);">
    <CustomStackedChart data={graphData} />
</main>

<style>
    main {
        height: 100%;
    }
</style>
