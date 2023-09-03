<script lang="ts">
    import { format } from 'date-fns'
    import { onMount } from 'svelte'
    import type { appListSchema } from '../util/schemas'
    import SimpleList from './simpleList.svelte'
    let dateToView = format(Date.now(), 'yyyy-MM-dd')

    const ascendingSort = (a, b) => {
        if (activeSortArg === 1) return a[activeSortArg].total > b[activeSortArg].total ? 1 : -1
        return a[activeSortArg] > b[activeSortArg] ? 1 : -1
    }
    const descendingSort = (a, b) => {
        if (activeSortArg === 1) return a[activeSortArg].total < b[activeSortArg].total ? 1 : -1
        return a[activeSortArg] < b[activeSortArg] ? 1 : -1
    }
    let activeSortArgName = 'Time'
    let activeSortArg = 1
    let activeSort = descendingSort
    let activeSortName = 'Descending ↓'

    onMount(() => {
        window.addEventListener('setDateToView', (e: CustomEvent) => {
            dateToView = e.detail
        })
    })

    // let graph: relativeDayGraphSchema = {
    //     max: 0,
    //     min: 0,
    //     total: 0,
    //     totalActive: 0,
    //     totalInactive: 0,
    //     appData: {}
    // }

    let min = 0
    let max = 0

    let list: appListSchema = {}

    const fetchAndRenderDayData = () => {
        window.api.loadDay(dateToView, (err, res) => {
            // const tmpGraphData: relativeDayGraphSchema = {
            //     max: 0,
            //     min: 0,
            //     total: 0,
            //     totalActive: 0,
            //     totalInactive: 0,
            //     appData: {}
            // }
            const tmpList = {}
            let tmpMin = Infinity
            let tmpMax = 0
            if (err) return console.error(err)

            for (const dataBit of res) {
                if (dataBit.application === 'unknown') continue
                // if(!tmpGraphData.appData[dataBit.application])
                // tmpGraphData.appData[dataBit.application] = {
                //     size: 0,
                //     total: 0,
                //     inactiveTime: 0,
                //     activeTime: 0
                // }
                // tmpGraphData.total += dataBit.total
                // if(dataBit.active) tmpGraphData.totalActive += dataBit.totalActive
                // else tmpGraphData.totalInactive += dataBit.totalInactive
                // tmpGraphData.appData[dataBit.application] = {
                //     size: 0,
                //     total: dataBit.total,
                //     inactiveTime: dataBit.totalActive,
                //     activeTime: dataBit.totalInactive
                // }

                if (!tmpList[dataBit.application])
                    tmpList[dataBit.application] = {
                        total: 0,
                        inactiveTime: 0,
                        activeTime: 0
                    }
                if (dataBit.active) tmpList[dataBit.application].activeTime += dataBit.time
                else tmpList[dataBit.application].inactiveTime += dataBit.time
                tmpList[dataBit.application].total += dataBit.time
            }

            for (const app in tmpList) {
                if (tmpList[app].total > tmpMax) tmpMax = tmpList[app].total
                if (tmpList[app].total < tmpMin) tmpMin = tmpList[app].total
            }
            min = tmpMin
            max = tmpMax
            list = tmpList
            // graph = tmpGraphData
        })
    }

    $: if (dateToView) fetchAndRenderDayData()
</script>

<main>
    <div class="chartWrap">

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
    {#if Object.keys(list).length === 0}
        <p>no data</p>
    {:else}
        <div class="listAll">
            <SimpleList {list} {max} {min} sort={activeSort} />
        </div>
    {/if}
</main>

<style>
    main{
        padding: 10px 0 0 0;
        position: relative;
        height: 100%;
        display: flex;
        flex-direction: column;
    }
    .chartWrap{
        height: 379px;
        width: 379px;
        border: 1px solid var(--border-color);
        border-radius: 4px;
        position: relative;
        left: 50%;
        transform: translateX(-50%);
    }
    .listAll {
        overflow-y: scroll;
        position: relative;
        background-color: var(--wash);
        border-radius: 4px;
        flex: 1;
    }

    .sortControlls {
        display: flex;
        justify-content: space-around;
        width: 306px;
        margin-top: 10px;
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
</style>
