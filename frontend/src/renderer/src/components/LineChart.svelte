<script>
    import { Line } from 'svelte-chartjs'
    export let data
    import 'chart.js/auto'
    import { formatTime, formatTimeHoursOnly } from '../util/time'
</script>

<Line
    {data}
    options={{
        responsive: true,
        scales: {
            y: {
                ticks: {
                    callback: function (value, _index, _ticks) {
                        return formatTimeHoursOnly(value)
                    }
                }
            }
        },
        plugins: {
            tooltip: {
                callbacks: {
                    label: function (context) {
                        return formatTime(context.parsed.y)
                    }
                }
            }
        }
    }}
/>
