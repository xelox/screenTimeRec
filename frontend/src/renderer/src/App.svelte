<script lang="ts">
    import { onMount } from 'svelte'
    import {format} from 'date-fns';
    import yaml from 'yaml'
    import { getMonday, getSunday } from './util/time'
    import WeekPeriodGraph from './components/WeekPeriodGraph.svelte'

    const options: {
        saveDir: null | string,
        saveFormat: string
    } = {
        saveDir: null,
        saveFormat: 'yyyy-MM-dd'
    }

  

    onMount(() => {
        let loadedOptions = {};
        window.api.readFile(window.api.path.join(window.api.root, 'options.yaml'))
        .then((optionsString) => {
            loadedOptions = yaml.parse(optionsString)
            console.log(options)
        })
        .catch((err) => {
            console.log(err)
        })
        .finally(() => {
            options.saveDir = loadedOptions['outputDir'] ?? window.api.env.APPDATA
            options.saveFormat = loadedOptions['filenameFormat'] ?? 'yyyy-MM-dd'
            pivotDate = new Date();
        })
    })

    let pivotDate: null | Date = null;
</script>

<style>
    main{
        padding: 20px 80px 20px 80px;
    }
    button, .periodTitle{
        background-color: var(--wash);
        color: var(--middle);
        border: none;
        padding: 4px;
        border-radius: 4px;
    }
</style>

<main>
    <div class="periodViewPannel">
        {#if pivotDate}
            <button on:click={() => {pivotDate = new Date(pivotDate.setDate(pivotDate.getDate() - 7))}}>{'<'}</button>
            <span class="periodTitle">{format(getMonday(pivotDate), 'do MMM')} to {format(getSunday(pivotDate), 'do MMM')}</span>
            <button on:click={() => {pivotDate = new Date(pivotDate.setDate(pivotDate.getDate() + 7))}}>{'>'}</button>    
            <WeekPeriodGraph {pivotDate} saveFormat={options.saveFormat} saveDir={options.saveDir}/>
        {/if}
    </div>
</main>
