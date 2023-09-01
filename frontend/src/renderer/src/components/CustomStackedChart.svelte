<script lang="ts">
    import { onMount } from "svelte"
    import app from "../main"
    import { interpolateColor, mapStringToIndex, normalizeValue } from "../util/general"
    import type { stackedWeedGraphSchema } from "../util/schemas"
    import { formatTime, formatTimeHoursOnly } from "../util/time"
    import { flip } from 'svelte/animate';
    import { quintOut } from 'svelte/easing';
    import de from "date-fns/locale/de"
    import { fade, slide } from "svelte/transition"

    const colorScale = [
        {color: '#8AF8D5', position: 0},
        {color: "#a7ebc7", position: 0.25},
        {color: "#c0eaa5", position: 0.5},
        {color: "#f3bf97", position: 0.75},
        {color: "#f59f9c", position: 1}, 
    ];
    //the position of the mouse in the window
    let mouseX
    let mouseY
    window.addEventListener('mousemove', (e)=>{
        if(!hoverElement.showing) return;
        mouseX = e.clientX;
        mouseY = e.clientY;
    })

    let hoverDate: string | null = null;

    let allApps: {[key: string]: number} = {}

    const ascendingSort = (a, b) => {
        return a[activeSortArg] > b[activeSortArg] ? 1 : -1;
    }
    const descendingSort = (a, b) => {
        return b[activeSortArg] > a[activeSortArg] ? 1 : -1;
    }
    let activeSortArgName = 'Time';
    let activeSortArg = 1;
    let activeSort = descendingSort;
    let activeSortName = 'Descending ↓';

    const randomColors = [
        '#f8ffe5', '#06d6a0', '#1b9aaa', '#ef476f', '#ffc43d',
    ]
    export let data: stackedWeedGraphSchema = {
        Mon: [],
        Tue: [],
        Wed: [],
        Thu: [],
        Fri: [],
        Sat: [],
        Sun: [],
    }
    let hoverElement: {app: string, time: string, showing: boolean} = false;
    const setHoverElement = (app: string | null, time?: number) => {
        if(!app) return hoverElement.showing = false;
        hoverElement = {app, time: formatTime(time), showing: true}
    }

    function animateBox(node, { delay, duration, easing, finalHeight }) {
        return {
            delay,
            duration,
            easing,
            css: (t, u) => {
                return `
                    height: ${t * finalHeight}px;
                    opacity: ${t};
                `;
            }
        };
    }

    const makeWeekList = () => {
        const tmp = {}
        for(const [day, apps] of Object.entries(data.dayData)){
            for(const [app, time] of Object.entries(apps.appData)){
                if(tmp[app]){
                    tmp[app] += time;
                } else {
                    tmp[app] = time;
                }
            }
        }
        allApps = tmp;
    }

    $: if(data) makeWeekList();
</script>

<style>
    :root{
        --border-color: rgb(100, 49, 241);
    }
    main{
        padding: 10px 0 0 0;
        position: relative;
        height: 100%;
        display: flex;
        flex-direction: column;
    }
    .chartBarHoveredTip{
        left:50%;
        position: relative;
        transform: translateX(-50%);
        max-width: max-content;
    }
    .chartWrap{
        width: 300px;
        height: 300px;
        position: relative;
        left: 50%;
        transform: translateX(-50%);
    }
    .yAxisWrap{
        pointer-events: none;
        position: absolute;
        width: 300px;
        display: flex;
        flex-direction: column-reverse;
        justify-content: space-between;
        align-items: flex-end;
        height: 300px;
        z-index: 1;
    }
    .yLabel{
        width: 100%;
        text-align: right;
        border-top: 1px solid var(--border-color);
    }
    .yLabel:first-child{
        border-top: none;
    }
    .yLabel:last-child{
        border-top: none;
    }
    .yLabel>span{
        width: 100%;
        position: absolute;
        transform: translate(-606px, 10px);
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
    .dayHolder:hover{
        background-color: var(--base);
    }
    .currentDate{
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
    .appBoxWrap{
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
    .appBox:hover{
        border: 1px solid var(--pastel-red);
    }
    .hoverTooltip{
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
    .sortControlls{
        display: flex;
        justify-content: space-around;
        width: 306px;
        margin-top: 36px;
        margin-bottom: 10px;
        left: 50%;
        position: relative;
        transform: translateX(-50%);
    }
    .sortControlls div{
        display: flex;
        justify-content: space-around;
    }
    .sortControlls button{
        color: var(--text);
        background-color: var(--wash);
        border: none;
        padding: 4px;
        cursor: pointer;
        border-radius: 4px;
        width: 147px;
    }
    .listAll{
        overflow-y: scroll;
        position: relative;
        background-color: var(--wash);
        border-radius: 4px;
    }
    .listElement{
        display: flex;
        justify-content: space-between;
        padding: 4px;
        border-bottom: 1px solid var(--super_dark);
    }
    .listElement:last-child{
        border-bottom: none;
    }
    .listElement:hover{
        background-color: var(--base);
    }
    .timeApp{
        /* font-weight: bold */
    }
</style>

<main in:fade out:fade>
    <div class="chartBarHoveredTip">
        {#if hoverDate}
            <div class="periodTitle">
                Open: {hoverDate}
            </div>
        {:else}
            Select a day
        {/if}
    </div>

    <div class="chartWrap">
        <div class="yAxisWrap">
            {#each new Array(8) as yLabel, i}
                <div class="yLabel"><span>{formatTimeHoursOnly((data.max / 8) * i)}</span></div>
            {/each}
        </div>
        <div class="barChartWrap">
            {#each Object.entries(data.dayData) as [day, apps]}
                <div class="dayHolder {apps.isCurrentDate ? "currentDate" : ""}" 
                on:mouseenter={()=>{hoverDate = apps.actualDate}}
                on:mouseleave={()=>{hoverDate = null}}
                >
                    <div class="xLabel">{day}</div>
                    {#if Object.keys(apps.appData).length}
                        <div class="appBoxWrap" in:fade={{duration: 400, easing: quintOut}} out:fade={{duration: 400, easing: quintOut}}>
                            {#each Object.entries(apps.appData).sort(activeSort) as [app, time], i (app)}
                                <div class="appBox" 
                                animate:flip={{delay: 0, duration: 400, easing: quintOut}}
                                key={app}
                                style="height: {(time / data.max) * 280}px; background-color: {randomColors[mapStringToIndex(app, randomColors.length)]}" 
                                on:mouseenter={()=>{
                                    setHoverElement(app, time)
                                }}
                                on:mouseleave={()=>{
                                    setHoverElement(null)
                                }}></div>
                            {/each}
                        </div>
                    {/if}
                </div>
            {/each}
        </div>
    </div>

    <!-- radial buttons to select sort order-->
    <div class="sortControlls">
        <div>
            <button on:click={()=>{
                if(activeSortName === 'Ascending ↑'){
                    activeSortName = 'Descending ↓';
                    activeSort = descendingSort;
                    return
                };
                activeSortName = 'Ascending ↑';
                activeSort = ascendingSort;
            }}>{activeSortName}</button>
        </div>
        <div>
            <button on:click={()=>{
                if(activeSortArgName === 'Alphabetic'){
                    activeSortArgName = 'Time';
                    activeSortArg = 1;
                    activeSort = activeSort;
                    return
                };
                activeSortArgName = 'Alphabetic';
                    activeSortArg = 0;
                    activeSort = activeSort;
            }}>{activeSortArgName}</button>
        </div>
    </div>
    {#if Object.keys(allApps).length}
        <div class="listAll" in:fade={{duration: 400, easing: quintOut}} out:fade={{duration: 400, easing: quintOut}}>
            {#each Object.entries(allApps).sort(activeSort) as [app, total], i (app) }
            <!-- style="color: {interpolateColor(normalizeValue(total, data.appMin, data.appMax), colorScale)};" -->
                <div class="listElement"
                animate:flip={{delay: 0, duration: 400, easing: quintOut}}
                key={app}
                >
                    <span class="appName">{i+1}. {app}</span> 
                    <span class="timeApp" 
                    style="color: {interpolateColor(normalizeValue(total, data.appMin, data.appMax), colorScale)};"
                    >{formatTime(total)}</span>
                </div>
            {/each}
        </div>
    {/if}
</main>

<div class="hoverTooltip" 
style="left: {mouseX}px; top: {mouseY}px; opacity: {hoverElement.showing ? 1 : 0};">
{#if hoverElement}
    {hoverElement.app}: {hoverElement.time}
{/if}
</div>

