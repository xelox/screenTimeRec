<script>
    import { Line } from 'svelte-chartjs'
    export let data
    import 'chart.js/auto'
    import { formatTimeHoursOnly } from '../util/time'
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
            tooltips: {
                callbacks: {
                    formattedValue: function (_context) {
                        return 'hhh'
                    }
                }
            }
        }
    }}
/>
