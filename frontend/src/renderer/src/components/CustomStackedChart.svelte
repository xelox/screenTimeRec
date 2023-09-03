<script lang="ts">
    // @ts-nocheck -> sorry, I can't be bothered to "fix" `key` not existing on `HTMLProps` (I don't know how.)
    import { interpolateColor, mapStringToIndex, normalizeValue } from '../util/general'
    import type { appListSchema, stackedWeedGraphSchema } from '../util/schemas'
    import { formatTime, getMonday, getSunday } from '../util/time'
    import { flip } from 'svelte/animate'
    import { quintOut } from 'svelte/easing'
    import { fade } from 'svelte/transition'
    import SimpleList from './simpleList.svelte'
    import {format} from 'date-fns'
    import app from '../main'

    //the position of the mouse in the window
    const currentDate = format(Date.now(), 'yyyy-MM-dd');
    let pivotDate: Date = new Date();
    function changePeriod(d: number){
        if(d < 0) pivotDate = new Date(pivotDate.setDate(pivotDate.getDate() - 7))
        else pivotDate = new Date(pivotDate.setDate(pivotDate.getDate() + 7))
    }
    function mouseScrollOnPeriod (e: WheelEvent) {
        changePeriod(e.deltaY);
    }
    let mouseX: number
    let mouseY: number
    window.addEventListener('mousemove', (e) => {
        if (!hoverElement.showing) return
        mouseX = e.clientX
        mouseY = e.clientY
    })

    let hoverDate: string | null = null

    let allApps: appListSchema = {}

    const ascendingSort = (a, b) => {
        if(activeSortArg === 1) return a[activeSortArg].total > b[activeSortArg].total ? 1 : -1
        return a[activeSortArg] > b[activeSortArg] ? 1 : -1
    }
    const descendingSort = (a, b) => {
        if(activeSortArg === 1) return a[activeSortArg].total < b[activeSortArg].total ? 1 : -1
        return a[activeSortArg] < b[activeSortArg] ? 1 : -1
    }
    let activeSortArgName = 'Time'
    let activeSortArg = 1
    let activeSort = descendingSort
    let activeSortName = 'Descending ↓'

    const randomColors = ['#f8ffe5', '#06d6a0', '#1b9aaa', '#ef476f', '#ffc43d']
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
    let hoverElement: { app: string; time: string; showing: boolean }= {
        app: '',
        time: '',
        showing: false
    }
    const setHoverElement = (app: string | null, time?: number):void => {
        if (!app) {
            hoverElement.showing = false
            return
        }
        hoverElement = { app, time: formatTime(time), showing: true }
    }

    const makeWeekList = () => {
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
                        inactiveTime: time.inactiveTime
                    }
                }
            }
        }
        allApps = tmp
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
                tmpData.dayData[day].actualDateISO = date
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

    $: if (graphData) makeWeekList()
</script>

<main>
    <div class="pivotDateControlls" on:wheel={mouseScrollOnPeriod}>
        <button on:click={() => {changePeriod(-1)}}>{'<'}</button>
        <span class="periodTitle">{format(getMonday(pivotDate), 'do MMM yy')} - {format(getSunday(pivotDate), 'do MMM yy')}</span>
        <button on:click={() => {changePeriod(1)}}>{'>'}</button>    
    </div>

    <div class="chartBarHoveredTip">
        {#if hoverDate}
            <div>
                Open: {hoverDate}
            </div>
        {:else}
            Select a day
        {/if}
    </div>

    <div class="chartWrap" on:wheel={e=>changePeriod(e.deltaY)}>
        <div class="yAxisWrap">
            {#each new Array(7) as _yLabel, i}
                <div class="yLabel" style="top: {((300 / 7) * ( 6 - i))}px"><span>{formatTime((graphData.max / 7) * (i + 1))}</span></div>
            {/each}
        </div>
        <div class="barChartWrap">
            {#each Object.entries(graphData.dayData) as [day, apps]}
                <!-- svelte-ignore a11y-no-static-element-interactions -->
                <!-- @ts-ignore -->
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <div
                    class="dayHolder {apps.isCurrentDate ? 'currentDate' : ''}"
                    on:mouseenter={() => {
                        hoverDate = apps.actualDate
                    }}
                    on:mouseleave={() => {
                        hoverDate = null
                    }}
                    on:click={() => {
                        const event = new CustomEvent('setDateToView', { detail: apps.actualDateISO })
                        window.dispatchEvent(event)
                    }}
                >
                    <div class="xLabel">{day}</div>
                    {#if Object.keys(apps.appData).length}
                        <div
                            class="appBoxWrap"
                            in:fade={{ duration: 400, easing: quintOut }}
                            out:fade={{ duration: 400, easing: quintOut }}
                        >
                            {#each Object.entries(apps.appData).sort(activeSort) as [app, time] (app)}
                                <!-- svelte-ignore a11y-no-static-element-interactions -->
                                <div
                                    class="appBox"
                                    animate:flip={{ delay: 0, duration: 400, easing: quintOut }}
                                    
                                    key={app}
                                    style="height: {(time.total / graphData.max) *
                                        280}px; background-color: {randomColors[
                                        mapStringToIndex(app, randomColors.length)
                                    ]}"
                                    on:mouseenter={_e => {
                                        setHoverElement(app, time.total)
                                    }}
                                    on:mouseleave={_e => {
                                        setHoverElement(null)
                                    }}
                                ></div>
                            {/each}
                        </div>
                    {/if}
                </div>
            {/each}
        </div>
    </div>

    <div class="sortControlls">
        <div>
            <button
                on:click={() => {
                    if (activeSortName === 'Ascending ↑') {
                        activeSortName = 'Descending ↓'
                        activeSort = descendingSort
                        return
                    }
                    activeSortName = 'Ascending ↑'
                    activeSort = ascendingSort
                }}>{activeSortName}</button
            >
        </div>
        <div>
            <button
                on:click={() => {
                    if (activeSortArgName === 'Alphabetic') {
                        activeSortArgName = 'Time'
                        activeSortArg = 1
                        activeSort = activeSort
                        return
                    }
                    activeSortArgName = 'Alphabetic'
                    activeSortArg = 0
                    activeSort = activeSort
                }}>{activeSortArgName}</button
            >
        </div>
    </div>

    {#if Object.keys(allApps).length}
        <div
            class="listAll"
            in:fade={{ duration: 400, easing: quintOut }}
            out:fade={{ duration: 400, easing: quintOut }}
        >
            <SimpleList list={allApps} min={graphData.appMin} max={graphData.appMax} sort={activeSort} />
        </div>
    {/if}
</main>

<div
    class="hoverTooltip"
    style="left: {mouseX}px; top: {mouseY}px; opacity: {hoverElement.showing ? 1 : 0};"
>
    {#if hoverElement}
        {hoverElement.app}: {hoverElement.time}
    {/if}
</div>

<style>
    :root {
        --border-color: rgb(100, 49, 241);
    }
    main {
        padding: 10px 0 0 0;
        position: relative;
        height: 100%;
        display: flex;
        flex-direction: column;
    }
    .pivotDateControlls{
        /* background-color: red; */
        display: block;
        width: max-content;
        left: 50%;
        position: relative;
        transform: translateX(calc(-50%));
        cursor: pointer;
    }
    .pivotDateControlls button, .periodTitle{
        background-color: var(--border-color);
        color: var(--text);
        border: none;
        padding: 4px;
        border-radius: 4px;
        cursor:grabbing;
        font-size: 1.1rem;
    }
    button{
        width: 2rem;
        text-align: center;
    }
    .chartBarHoveredTip {
        left: 50%;
        position: relative;
        transform: translateX(-50%);
        max-width: max-content;
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
        background-color: red;
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
        justify-content: space-between;
        align-items: flex-end;
        height: 100%;
        border-radius: 4px;
        border: 1px solid var(--border-color);
        overflow: hidden;
        z-index: 2;
    }
    .dayHolder:last-child {
        border-right: none;
    }
    .dayHolder {
        height: 300px;
        width: 100%;
        border-right: 1px solid var(--border-color);
        cursor: pointer;
    }
    .dayHolder:hover {
        background-color: var(--base);
    }
    .currentDate {
        background-color: var(--wash);
        /* border: 1px solid var(--super_dark) !important; */
    }
    .xLabel {
        transform: translateY(24px) rotate(15deg);
        width: calc(300px / 7);
        text-align: center;
        transform-origin: 0 0;
        position: absolute;
        bottom: 0;
    }
    .appBoxWrap {
        /* background-color: red; */
        height: 100%;
        display: flex;
        flex-direction: column-reverse;
        justify-content: flex-start;
        align-items: center;
    }
    .appBox {
        width: 100%;
        color: black;
        overflow: hidden;
        z-index: 2;
    }
    .appBox:hover {
        border: 1px solid var(--pastel-red);
    }
    .hoverTooltip {
        pointer-events: none;
        background-color: var(--base);
        display: block;
        position: absolute;
        transform: translate(0, -40px);
        padding: 4px;
        transition: all 0.1s ease-in-out;
        border-radius: 4px;
        border: 1px solid var(--border-color);
    }
    .sortControlls {
        display: flex;
        justify-content: space-around;
        width: 306px;
        margin-top: 36px;
        margin-bottom: 10px;
        left: 50%;
        position: relative;
        transform: translateX(-50%);
    }
    .sortControlls div {
        display: flex;
        justify-content: space-around;
    }
    .sortControlls button {
        color: var(--text);
        background-color: var(--wash);
        border: none;
        padding: 4px;
        cursor: pointer;
        border-radius: 4px;
        width: 147px;
    }
    .listAll {
        overflow-y: scroll;
        position: relative;
        background-color: var(--wash);
        border-radius: 4px;
        flex: 1;
    }
</style>
