<script lang="ts">
    import { format } from "date-fns"
    import { getMonday, getSunday } from "../util/time"
    import BarChart from "./BarChart.svelte"

    export let pivotDate: Date;
    export let saveFormat: string;
    export let saveDir: string;

    let graphData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
            {
                label: 'Time spent',
                data: [0, 0, 0, 0, 0, 0, 0],
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgb(255, 99, 132)',
                borderWidth: 1,
                
            },
        ],
    }

    const loadWeek = async () => {
        let data: {
            Mon: number, Tue: number, Wed: number, Thu: number, Fri: number, Sat: number, Sun: number
        } = {
            Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0
        }
        for(let d = getMonday(pivotDate).getTime(); d <= getSunday(pivotDate).getTime(); d += (1000 * 60 * 60 * 24)){
            const dataFile = window.api.path.join(saveDir, format(d, saveFormat) + '.json');
            try {
                const file = window.api.readFileSync(dataFile);
                const dateData = JSON.parse(file);
                for(const subitems of Object.values(dateData.data)){
                    for(const item of Object.values(subitems)){
                        data[format(d, 'EEE')] += item;
                    }
                }
            } catch (error) {
                // console.log(error);
            }
           
        }
        graphData.datasets[0].data = Object.values(data);
        console.log(graphData);
    }
    $: if(pivotDate) loadWeek();
</script>

<main>
    <BarChart data={graphData}/>
</main>