<script lang="ts">
    import { getMonday, getSunday } from '../util/time'
    import {format} from 'date-fns'
    import { onMount } from 'svelte'
    import WeekChart from './WeekChart.svelte'
    import {activeSortStore} from '../store/globalSort'
    import MonthChart from './MonthChart.svelte'
    import { fade, scale, slide } from 'svelte/transition'

   

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
    $activeSortStore = descendingSort
    let activeSortName = 'Descending ↓'

    // const randomColors = ['#f8ffe5', '#06d6a0', '#1b9aaa', '#ef476f', '#ffc43d']

  

    let periodType = 'month';
    let start = format(getMonday(new Date()), 'yyyy-MM-dd');
    let end = format(getSunday(new Date()), 'yyyy-MM-dd');

    onMount(()=>{
        window.addEventListener('periodChange', (e: CustomEvent)=>{
            start = e.detail.start;
            end = e.detail.end;
            periodType = e.detail.periodType;
        })
    })

    // $: if (graphData) makeWeekList()
</script>

<main>
    {#if periodType === 'week'}
        <div in:scale>
            <WeekChart start={start} end={end}/>
        </div>
    {:else if periodType === 'month'}
        <div in:scale>
            <MonthChart start={start} end={end}/>
        </div>
    {/if}
    <div class="sortControlls">
        <div>
            <button
                on:click={() => {
                    if (activeSortName === 'Ascending ↑') {
                        activeSortName = 'Descending ↓'
                        $activeSortStore = descendingSort
                        return
                    }
                    activeSortName = 'Ascending ↑'
                    $activeSortStore = ascendingSort
                }}>{activeSortName}</button
            >
        </div>
        <div>
            <button
                on:click={() => {
                    if (activeSortArgName === 'Alphabetic') {
                        activeSortArgName = 'Time'
                        activeSortArg = 1
                        $activeSortStore = $activeSortStore
                        return
                    }
                    activeSortArgName = 'Alphabetic'
                    activeSortArg = 0
                    $activeSortStore = $activeSortStore
                }}>{activeSortArgName}</button
            >
        </div>
    </div>
</main>



<style>
    :root {
        --border-color: rgb(100, 49, 241);
    }
    main {
        position: relative;
        display: flex;
        flex-direction: column;
    }

    button{
        width: 2rem;
        text-align: center;
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
</style>
