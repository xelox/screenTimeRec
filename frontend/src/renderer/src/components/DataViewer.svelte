<script lang="ts">
    import { formatTime } from "../util/time"
    import Donut from "./Donut.svelte";

    export let data: {
        startTime: number,
        lastSave: number,
        data: {
            [application: string]: {
                [title: string]: number
            }
        }
    };
    let proccessedData: {
        [application: string]: {
            total: number,
            subitems: {
                [title: string]: number
            }
        }
    } = {};

    let graphData: {id: string, value: number}[] = [];

    const proccessData = () => {
        for(const [application, titles] of Object.entries(data.data)){
            for(const [title, time] of Object.entries(titles)){
                if(proccessedData[application]){
                    proccessedData[application].subitems[title] = time;
                    proccessedData[application].total += time;
                }else{
                    proccessedData[application] = {
                        total: time,
                        subitems: {
                            [title]: time,
                        },
                    }
                }
            }
        }
        for(const [application, applicationData] of Object.entries(proccessedData)){
            graphData.push({id: application, value: applicationData.total});
        }
    }
    proccessData();
</script>

<style>
    p{
        margin: 0;
    }
</style>

<main>
    <Donut data={graphData} />
    {#each Object.entries(proccessedData).sort((a, b)=>{return b[1].total - a[1].total}) as [application, applicationData]}
        <h2>{application} {formatTime(applicationData.total)}</h2>
        {#each Object.entries(applicationData.subitems).sort((a, b)=>{return b[1] - a[1]}) as [title, time]}
            <p>{title}: {formatTime(time)}</p>
        {/each}
    {/each}
</main>

