<script lang="ts">
    import { onMount } from 'svelte'
    import {format} from 'date-fns';
    import yaml from 'yaml'
    import { getMonday, getSunday } from './util/time'
    import WeekPeriodGraph from './components/WeekPeriodGraph.svelte'

    function mouseScrollOnPeriod (e: WheelEvent) {
        changePeriod(e.deltaY);
    }

    const options: {
        saveDir: null | string,
        saveFormat: string
    } = {
        saveDir: null,
        saveFormat: 'yyyy-MM-dd'
    }

    function changePeriod(d: number){
        if(d < 0) pivotDate = new Date(pivotDate.setDate(pivotDate.getDate() - 7))
        else pivotDate = new Date(pivotDate.setDate(pivotDate.getDate() + 7))
    }

    onMount(() => {
        let loadedOptions = {};
        window.api.readFile(window.api.path.join(window.api.root, 'options.yaml'))
        .then((optionsString) => {
            loadedOptions = yaml.parse(optionsString)
        })
        .catch((err) => {
            console.log(err)
        })
        .finally(() => {
            options.saveDir = loadedOptions['outputDir'] ?? window.api.env.APPDATA
            options.saveFormat = loadedOptions['filenameFormat'] ?? 'yyyy-MM-dd'
            pivotDate = new Date();
        });
    })

    let pivotDate: null | Date = null;
</script>

<style>
    main{
        padding: 20px 0 20px 0;
        display: flex;
        height: 100vh;
        position: relative;
    }
    main>div{
        padding: 0 10px 0 10px;
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
    button, .periodTitle{
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
    .periodViewPannel{
        /* border: 1px solid white; */
        flex: 1;
    }
    .dayViewPannel{
        border-left: 1px solid rgba(0, 0, 0, 0.226);
        flex: 1
    }
</style>

<main>
    <div class="periodViewPannel">
        {#if pivotDate}
            <div class="pivotDateControlls" on:wheel={mouseScrollOnPeriod}>
                <button on:click={() => {changePeriod(-1)}}>{'<'}</button>
                <span class="periodTitle">{format(getMonday(pivotDate), 'do MMM')} to {format(getSunday(pivotDate), 'do MMM')}</span>
                <button on:click={() => {changePeriod(1)}}>{'>'}</button>    
            </div>
            <WeekPeriodGraph {pivotDate} saveFormat={options.saveFormat} saveDir={options.saveDir}/>
        {/if}
    </div>
    <div class="dayViewPannel">

    </div>
</main>
