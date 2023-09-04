<script lang="ts">
    import { format } from "date-fns"
    import { categoryStore } from "../store/categoryStore"
    import type { appListSchema } from "../util/schemas"
    import { formatTime } from "../util/time"

    export let start: string
    export let end: string

    type Cell = {
        total: number,
        isCurrent?: boolean,
        categories: {
            [category: string]: number
        }
    }

    const daysOfWeek = [ 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    type Grid = [
        [Cell, Cell, Cell, Cell, Cell, Cell],
        [Cell, Cell, Cell, Cell, Cell, Cell],
        [Cell, Cell, Cell, Cell, Cell, Cell],
        [Cell, Cell, Cell, Cell, Cell, Cell],
        [Cell, Cell, Cell, Cell, Cell, Cell],
        [Cell, Cell, Cell, Cell, Cell, Cell],
        [Cell, Cell, Cell, Cell, Cell, Cell],
    ]
    let grid: Grid = [
        [{total: 0, categories: {}}, {total: 0, categories: {}}, {total: 0, categories: {}}, {total: 0, categories: {}}, {total: 0, categories: {}}, {total: 0, categories: {}}],
        [{total: 0, categories: {}}, {total: 0, categories: {}}, {total: 0, categories: {}}, {total: 0, categories: {}}, {total: 0, categories: {}}, {total: 0, categories: {}}],
        [{total: 0, categories: {}}, {total: 0, categories: {}}, {total: 0, categories: {}}, {total: 0, categories: {}}, {total: 0, categories: {}}, {total: 0, categories: {}}],
        [{total: 0, categories: {}}, {total: 0, categories: {}}, {total: 0, categories: {}}, {total: 0, categories: {}}, {total: 0, categories: {}}, {total: 0, categories: {}}],
        [{total: 0, categories: {}}, {total: 0, categories: {}}, {total: 0, categories: {}}, {total: 0, categories: {}}, {total: 0, categories: {}}, {total: 0, categories: {}}],
        [{total: 0, categories: {}}, {total: 0, categories: {}}, {total: 0, categories: {}}, {total: 0, categories: {}}, {total: 0, categories: {}}, {total: 0, categories: {}}],
        [{total: 0, categories: {}}, {total: 0, categories: {}}, {total: 0, categories: {}}, {total: 0, categories: {}}, {total: 0, categories: {}}, {total: 0, categories: {}}],
    ];

    let weekTotals: number[] = [0, 0, 0, 0, 0, 0, 0];

    function sumColumn(column: number){
        let sum = 0;
       
        for(let i = 0; i < 7; i++){
            console.log(grid[i][column])
            sum += grid[i][column].total;
        }
        console.log('summing column', column + 1, 'resulted in', sum);
        return sum;
    }

    function findDateCell(date: Date): { row: number; column: number } {
        const firstOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        const initial = (firstOfMonth.getDay() + 6) % 7;
        const column = Math.floor((initial + date.getDate() - 1) / 7);
        const row = (initial + date.getDate() - 1) % 7;
        return { row, column };
    }
    function dayNumAtCoordinates(row: number, column: number) {
        const firstOfMonth = new Date(start);
        const initial = (firstOfMonth.getDay() + 6) % 7;
        const dayNum = row * 7 + column - initial + 1;
        const lengthOfPreviusMonth = new Date(firstOfMonth.getFullYear(), firstOfMonth.getMonth(), 0).getDate();
        const lengthOfThisMonth = new Date(firstOfMonth.getFullYear(), firstOfMonth.getMonth() + 1, 0).getDate();
        if(dayNum < 1) return {dayNum: lengthOfPreviusMonth + dayNum , opacity: 0.5};
        if(dayNum > new Date(end).getDate()) return {dayNum: dayNum - lengthOfThisMonth, opacity: 0.5};
        return {dayNum, opacity: 1};
    }

    const loadData = () => {
        const now = format(new Date(), 'yyyy-MM-dd');
        const tmpGrid: Grid = [
            [{total: 0, categories: {}}, {total: 0, categories: {}}, {total: 0, categories: {}}, {total: 0, categories: {}}, {total: 0, categories: {}}, {total: 0, categories: {}}],
            [{total: 0, categories: {}}, {total: 0, categories: {}}, {total: 0, categories: {}}, {total: 0, categories: {}}, {total: 0, categories: {}}, {total: 0, categories: {}}],
            [{total: 0, categories: {}}, {total: 0, categories: {}}, {total: 0, categories: {}}, {total: 0, categories: {}}, {total: 0, categories: {}}, {total: 0, categories: {}}],
            [{total: 0, categories: {}}, {total: 0, categories: {}}, {total: 0, categories: {}}, {total: 0, categories: {}}, {total: 0, categories: {}}, {total: 0, categories: {}}],
            [{total: 0, categories: {}}, {total: 0, categories: {}}, {total: 0, categories: {}}, {total: 0, categories: {}}, {total: 0, categories: {}}, {total: 0, categories: {}}],
            [{total: 0, categories: {}}, {total: 0, categories: {}}, {total: 0, categories: {}}, {total: 0, categories: {}}, {total: 0, categories: {}}, {total: 0, categories: {}}],
            [{total: 0, categories: {}}, {total: 0, categories: {}}, {total: 0, categories: {}}, {total: 0, categories: {}}, {total: 0, categories: {}}, {total: 0, categories: {}}],
        ];
        const tmpList: appListSchema = {};
        window.api.loadPeriod(start, end, (err, data) => {
            const tmpWeekTotals = [0, 0, 0, 0, 0, 0, 0];
            if (err) {
                console.log(err)
                return
            }
            // console.log(rows)
            for(const dataBit of data){
                const app = dataBit.application;
                if(app === 'unknown') continue;
                const coords = findDateCell(new Date(dataBit.date));
                const category = dataBit.category_id ?? 'Uncategorized';
                tmpGrid[coords.row][coords.column].total += dataBit.time;
                if(!tmpGrid[coords.row][coords.column].categories[category]) tmpGrid[coords.row][coords.column].categories[category] = 0;
                tmpGrid[coords.row][coords.column].categories[category] += dataBit.time;
                if(tmpList[app]){
                    tmpList[app].total += dataBit.time;
                } else {
                    tmpList[app] = {
                        total: dataBit.time,
                    }
                }
                tmpWeekTotals[coords.column] += dataBit.time;
                if(!tmpGrid[coords.row][coords.column].isCurrent && dataBit.date === now) tmpGrid[coords.row][coords.column].isCurrent = true;
            }
            let min = Infinity;
            let max = 0;
            for(const app of Object.values(tmpList)) {
                if(app.total > max) max = app.total;
                if(app.total < min) min = app.total;
            }
            grid = tmpGrid;
            weekTotals = tmpWeekTotals;
            window.dispatchEvent(new CustomEvent('newSimpleList', {detail: {list: tmpList, min, max}}));
        });
    }

    $: if(start && end) loadData()
</script>

<main>
    <div class="chartWrap">
        {#each grid as rows, i}
            <div class="row">
                <div class="headLabel">{daysOfWeek[i]}</div>
                {#each rows as cell, j}
                    <div class="cell" style="background-color:{cell.isCurrent ? 'var(--wash)' : 'none'}">
                        <div class="cellContentWrap" style="max-height: {Object.keys(cell.categories).length ? '100%' : '0%'}">
                            {#each Object.entries(cell.categories).sort((a, b)=>{return a[1] - b[1]}) as [category, time]}
                                <div 
                                    class='categoryBar'
                                    style="
                                    background-color: {$categoryStore[category]?.color || 'black'};
                                    height: {time / (24 * 60 * 60 * 1000) * 100}%;"
                                    >
                                </div>
                            {/each}
                        </div>
                        <div class="dayOfMonth" style="opacity: {dayNumAtCoordinates(j, i).opacity}; background-color:{cell.isCurrent ? 'var(--pastel-red)' : 'none'}; color:{cell.isCurrent?'black':'inherit'}"><span>{dayNumAtCoordinates(j, i).dayNum}</span></div>
                    </div>
                    {#if i === 0}
                        <div class="weekWrap" style="top: {j * (300/7)}px"><span>{formatTime(weekTotals[j])}</span></div>
                    {/if}
                {/each}
            </div>
        {/each}
    </div>
</main>

<style>
    .headLabel{
        position: absolute;
        top: calc(-1rem - 4px);
        width: 100%;
        text-align: center;
    }
    .chartWrap{
        display: flex;
        position: relative;
        margin-top: 2rem;
        border: 1px solid var(--border-color);
    }
    .row{
        display: flex;
        flex-direction: column;
        position: relative;
    }
    .cell{
        border-bottom: 1px solid var(--border-color);
        border-left: 1px solid var(--border-color);
        width: calc(300px / 7 + 1px);
        height: calc(300px / 7);
        position: relative;
        z-index: 2;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
    }
    .cell:hover{
        background-color: var(--base);
    }
    .cell:hover .dayOfMonth{
        background-color: var(--pastel-red);
        color: black;
    }
    /* .cell:last-child{
        border-bottom: none;
    }
    .row:last-child{
        border-right: none;
    } */
    .categoryBar{
    }
    .dayOfMonth{
        position: absolute;
        top: 4px;
        text-align: center;
        left: 50%;
        transform: translateX(-50%);
        width: 1.2rem;
        height: 1.2rem;
        font-size: 0.7rem;
        border-radius: 999px;
        background-color: var(--super_dark);
        display: flex;
        flex-direction: column;
        justify-content: center;
    }
    .cellContentWrap{
        position: relative;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        transition: all 0.2s ease-in-out;
    }
    .weekWrap{
        position: absolute;
        font-size: 1rem;
        /* background-color: red; */
        height: calc(300px / 7);
        width: 307px;
        text-align: right;
        /* transform: translateX(-307px); */
        color: var(--text-color);
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        z-index: 1;
        cursor: pointer;
    }
    .weekWrap:hover{
        background-color: var(--base);
    }
    .weekWrap span{
        transform: translateX(-320px)
    }
</style>