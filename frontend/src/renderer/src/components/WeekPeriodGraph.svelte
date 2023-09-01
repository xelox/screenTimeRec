<script lang="ts">
    import { format } from "date-fns"
    import { getMonday, getSunday, isSameDate } from "../util/time"
    import type { stackedWeedGraphSchema } from "../util/schemas"
    import CustomStackedChart from "./CustomStackedChart.svelte"
    import { onMount } from "svelte"
    let wrapDom: HTMLElement;
    let topPos: number;

    onMount(()=>{
        if(!wrapDom) return;
        topPos = wrapDom.getBoundingClientRect().top;
    })
    const currentDate = new Date();
    export let pivotDate: Date;
    export let saveFormat: string;
    export let saveDir: string;

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
            },
        },
        max: 0,
        min: 0,
        appMax: 0,
        appMin: 0,
    };

    const loadWeek = async () => {
        let tmpData: stackedWeedGraphSchema = {
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
                },
            },
            max: 0,
            min: 0,
            appMax: 0,
            appMin: 0,
        };
        for(let d = getMonday(pivotDate).getTime(); d <= getSunday(pivotDate).getTime(); d += (1000 * 60 * 60 * 24)){
            const fileName = format(d, saveFormat);
            const dataFile = window.api.path.join(saveDir, fileName + '.json');
            tmpData.dayData[format(d, 'EEE')].actualDate = fileName;
            tmpData.dayData[format(d, 'EEE')].isCurrentDate = isSameDate(currentDate, new Date(d));
            try {
                const file = window.api.readFileSync(dataFile);
                const dateData = JSON.parse(file);
                for(const [app, subitems] of Object.entries(dateData.data)){
                    // console.log(app);
                    for(const time of Object.values(subitems)){
                        // console.log(time);
                        // const dayHolder = tmpData.dayData[format(d, 'EEE')];
                        const dayHolder = tmpData.dayData[format(d, 'EEE')];
                        const appHolder = dayHolder.appData[app];
                        if(appHolder){
                            dayHolder.appData[app] += time;
                        } else {
                            dayHolder.appData[app] = time;
                        }
                        dayHolder.total += time;
                    }
                }
            } catch (error) {
                // console.error(error);
            }
           
        }
        for(const day of Object.values(tmpData.dayData)){
            if(day.total > tmpData.max) tmpData.max = day.total;
            if(day.total < tmpData.min) tmpData.min = day.total;
            for(const time of Object.values(day.appData)){
                if(time > tmpData.appMax) tmpData.appMax = time;
                if(time < tmpData.appMin) tmpData.appMin = time;
            }
        }
        graphData = tmpData
    }
    $: if(pivotDate) loadWeek();
</script>

<style>
    main{
        height: 100%;
    }
</style>

<main bind:this={wrapDom} style="max-height: calc(100% - {topPos}px);">
    <CustomStackedChart data={graphData} />
</main>