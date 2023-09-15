<script lang="ts">
    //@ts-nocheck
    import { format } from "date-fns"
    import type { stackedWeedGraphSchema } from "../util/schemas"
    import { formatTime, getMonday } from "../util/time"
    import { categoryMapStore, categoryStore } from "../store/categoryStore"
    import { flip } from "svelte/animate"
    import { quintOut } from "svelte/easing"
    import {activeSortStore} from '../store/globalSort'
    import TransitiveValue from "./TransitiveValue.svelte"

    let mouseX: number
    let mouseY: number

    let hoverElement = {
        showing: false,
        app: '',
        time: '<0sec'
    }
    window.addEventListener('mousemove', (e) => {
        if (!hoverElement.showing) return
        mouseX = e.clientX
        mouseY = e.clientY
    })

    const currentDate = format(new Date(), 'yyyy-MM-dd');

    export let start: string;
    export let end: string;

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
        const monday = start;
        const sunday = end;
        const pivotDate = new Date(monday);

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
                tmpData.dayData[day].actualDateISO = date
                dI += 24 * 60 * 60 * 1000
                if (currentDate === date) tmpData.dayData[day].isCurrentDate = true
            }

            for (const row of rows) {
                const app = row.application
                if(app === 'unknown') continue;
                if(!categoryMapStore[app])
                    $categoryMapStore[app] = row.category_id ?? 'Uncategorized';
                const date = new Date(row.date)
                const day = format(date, 'EEE')
                const time = row.time
                const dayHolder = tmpData.dayData[day]
                dayHolder.total += time
                if(!dayHolder.appData[app]) dayHolder.appData[app] = {
                    total: time,
                    inactiveTime: 0,
                    activeTime: 0,
                    category: row.category_id ?? 'Uncategorized'
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

            const tmp = {}
            for (const [_day, apps] of Object.entries(graphData.dayData)) {
                for (const [app, time] of Object.entries(apps.appData)) {
                    if (tmp[app]) {
                        tmp[app].total += time.total
                        tmp[app].activeTime += time.activeTime
                        tmp[app].inactiveTime += time.inactiveTime
                    } else {
                        tmp[app] = {
                            total: time.total,
                            activeTime: time.activeTime,
                            inactiveTime: time.inactiveTime,
                            category: time.category
                        }
                    }
                }
            }
            const newListEvent = new CustomEvent('newSimpleList', {
                detail: {
                    list: tmp,
                    max: graphData.appMax,
                    min: graphData.appMin,
                }
            })
            window.dispatchEvent(newListEvent);
            // setTimeout(loadWeek, 5_000)
        })
    }

    $: if(start && end) loadWeek()
</script>

<!-- <div class="chartBarHoveredTip">
    {#if hoverDate}
        <div>
            Open: {hoverDate}
        </div>
    {:else}
        Select a day
    {/if}
</div> -->

<main>
<div class="hoverTooltip" style="left: {mouseX}px; top: {mouseY}px; opacity: {hoverElement.showing ? 1 : 0};">
    {#if hoverElement}
        {hoverElement.app}: {hoverElement.time}
    {/if}
</div>

<div class="chartWrap">
    <div class="yAxisWrap">
        {#each new Array(7) as _yLabel, i}
            <div class="yLabel" style="top: {((300 / 7) * ( 6 - i))}px"><span><TransitiveValue targetValue={Math.floor((graphData.max / 7) * (i + 1))} /></span></div>
        {/each}
    </div>
    <div class="barChartWrap">
        {#each Object.entries(graphData.dayData) as [day, apps]}
        <button  class="dayHolder {apps.isCurrentDate ? 'currentDate' : ''}"
        on:click={() => {
            const event = new CustomEvent('requestPeriodChange', {
                detail: {
                    newPeriodType: 'day',
                    newPivot: new Date(apps.actualDateISO)
                }
            })
            window.dispatchEvent(event) 
        }}>
            <div class='dayHolderDataHolder'>
                <div class="xLabel">{day}</div>
                <div class="appBoxWrap" style="max-height: {Object.keys(apps.appData).length ? 300 : 1}px;">
                    {#each Object.entries(apps.appData).sort($activeSortStore) as [app, time] (app)}
                        <button
                            class="appBox"
                            animate:flip={{ delay: 0, duration: 400, easing: quintOut }}
                            on:contextmenu={()=>{
                                const event = new CustomEvent('openAppEdit', { detail: app })
                                window.dispatchEvent(event)
                            }}
                            on:mouseenter={() => {
                                hoverElement = {
                                    showing: true,
                                    app,
                                    time: formatTime(time.total)
                                }
                            }}
                            on:mouseleave={() => {
                                hoverElement = {
                                    showing: false,
                                    app: '',
                                    time: formatTime(time.total)
                                }
                            }}
                            key={app}
                            style="height: {(time.total / graphData.max) *
                                280}px; background-color: {$categoryStore[$categoryMapStore[app] ?? 'Uncategorized']?.color || 'transparent'}"
                        ></button>
                    {/each}
                </div>
            </div>
        </button>
        {/each}
    </div>
</div>
</main>

<style>
    main {
        position: relative;
    }
    .hoverTooltip {
        pointer-events: none;
        background-color: var(--wash);
        display: block;
        position: fixed;
        transform: translate(0, -80px);
        padding: 12px;
        transition: all 0.1s cubic-bezier(0.16, 1, 0.3, 1);
        border-radius: 4px;
        border: 1px solid rgb(255, 0, 157);
        font-size: 1.1rem;
        z-index: 8;
    }
    .chartWrap {
        width: 300px;
        height: 300px;
        position: relative;
        left: 50%;
        transform: translateX(-50%);
    }
    .yAxisWrap {
        pointer-events: none;
        position: absolute;
        width: 300px;
        height: 300px;
        z-index: 1;
    }
    .yLabel {
        position: absolute;
        width: 100%;
        text-align: right;
        border-top: 1px solid var(--border-color);
    }
    .yLabel:last-child {
        border-top: none;
    }
    .yLabel > span {
        width: 100%;
        position: absolute;
        transform: translate(-606px, -50%);
    }
    .barChartWrap {
        width: 100%;
        display: flex;
        flex-direction: row;
        height: 100%;
        border-radius: 4px;
        border: 1px solid var(--border-color);
        z-index: 2;
    }
    .dayHolder:last-child {
        border-right: none;
    }
    .dayHolder {
        color: var(--text);
        border: none;
        background-color: transparent;
        height: 300px;
        width: 100%;
        border-right: 1px solid var(--border-color);
        cursor: pointer;
        display: flex;
        align-items: flex-end;
    }
    .dayHolderDataHolder {
        width: calc(100% - 20px);
        left: 10px;
        position: relative;
    }
    .dayHolder:hover {
        background-color: var(--base);
    }
    .currentDate {
        background-color: var(--wash);
        /* border: 1px solid var(--super_dark) !important; */
    }
    .xLabel {
        transform: translate(-10px, 18px) rotate(15deg);
        width: calc(300px / 7);
        text-align: center;
        transform-origin: 0 0;
        position: absolute;
        bottom: 0;
        left: 0;
    }
    .appBoxWrap {
        display: block;
        transition: max-height 0.2s ease-in-out;
        height: 100%;
        display: flex;
        flex-direction: column-reverse;
        justify-content: flex-start;
        align-items: center;
        /* overflow: hidden; */
        bottom: 2px;
        position: relative;
        z-index: 2;
    }
    .appBox {
        border: none;
        width: 100%;
        color: black;
        z-index: 2;
        overflow: hidden;
        transition: all 0.1s ease-in-out;
    }
    .appBox:hover {
        border: 1px solid black;
        border-radius: 4px;
        transform: scaleX(1.3);
        z-index: 5;

    }
</style>