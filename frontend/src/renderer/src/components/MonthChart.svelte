<script lang="ts">
    //@ts-nocheck
    import { format } from "date-fns"
    import { categoryStore } from "../store/categoryStore"
    import type { appListSchema } from "../util/schemas"
    import {categoryMapStore} from "../store/categoryStore";
    import TransitiveValue from "./TransitiveValue.svelte"
    import { quadOut } from "svelte/easing"
    import { flip } from "svelte/animate"

    export let start: string
    export let end: string

    type Cell = {
        dayNum?: {
            dayNum: number,
            opacity: number,
            dayString: string
        },
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
        const effectiveDate = new Date(firstOfMonth.getFullYear(), firstOfMonth.getMonth(), dayNum)
        const dayString = format(effectiveDate, 'do MMM yyyy');
        return {dayNum: effectiveDate.getDate(), opacity: 1, dayString};
    }

    const loadData = () => {
        const now = format(new Date(), 'yyyy-MM-dd');
        console.log(start, end);
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
            for(let i = 0; i < 7; i++){
                for(let j = 0; j < 6; j++)
                    tmpGrid[i][j].dayNum = dayNumAtCoordinates(j, i);
            }
            // console.log(rows)
            for(const dataBit of data){
                const app = dataBit.application;
                if(!$categoryMapStore[app]) $categoryMapStore[app] = dataBit.category_id;
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
                        inactiveTime: 0,
                        activeTime: 0,
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

    let hoverCellInfo: {
        showing: boolean, 
        cell: {[category: string]: number}, 
        pos: {x: number, y: number},
        dayStr: string,
        total: number
    } = {showing: false, cell: {}, pos: {x: 0, y: 0}, dayStr: '', total: 0};
    const zeroHoverTooltip = ()=> {
        for(const category of Object.keys($categoryStore)){
            hoverCellInfo.cell[category] = 0;
        }
    }
    zeroHoverTooltip();
    const fillHoverTooltip = (cell: Cell) => {
        for(const category of Object.keys(hoverCellInfo.cell)){
            hoverCellInfo.cell[category] = cell.categories[category] ?? 0;
        }
    }
    function serHoverCellInfo(cell: Cell | null = null, e: MouseEvent): any {
        zeroHoverTooltip();
        if(cell !== null) {
            fillHoverTooltip(cell);
            hoverCellInfo.dayStr = cell.dayNum?.dayString ?? '';
            hoverCellInfo.total = cell.total;
        }
        else {
            hoverCellInfo.dayStr = '';
            hoverCellInfo.total = 0;
        }
        const target = e.target as HTMLElement;
        const posGrabElement = target;
        const p = posGrabElement.getBoundingClientRect();
        hoverCellInfo.pos = {x: p.x, y: p.y};
        hoverCellInfo.showing = cell !== null;
    }
</script>

<main>
    <div class="chartWrap">
        {#each grid as rows, i}
            <div class="row">
                <div class="headLabel">{daysOfWeek[i]}</div>
                {#each rows as cell, j}
                    <!-- svelte-ignore a11y-no-static-element-interactions -->
                    <!-- svelte-ignore a11y-mouse-events-have-key-events -->
                    <div class="cell" style="background-color:{cell.isCurrent ? 'var(--wash)' : ''}"
                        on:mouseover={(e)=>serHoverCellInfo(cell, e)}
                        on:mouseleave={(e)=>serHoverCellInfo(null, e)}
                    >
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
                        <div class="dayOfMonth" style="opacity: {cell.dayNum?.opacity || 0}; background-color:{cell.isCurrent ? 'var(--pastel-red)' : ''}; color:{cell.isCurrent?'black':'inherit'}"><span>{cell.dayNum?.dayNum || ''}</span></div>
                    </div>
                    {#if i === 0}
                        <div class="weekWrap" style="top: {j * (300/7)}px"><span><TransitiveValue targetValue={weekTotals[j]}/></span></div>
                    {/if}
                {/each}
            </div>
        {/each}
    </div>

    <div class="hoverTooltipWrap" style="top: {hoverCellInfo.pos.y}px; left: {hoverCellInfo.pos.x}px; opacity: {hoverCellInfo.showing?1:0}">
        <div class="hoverTooltipHeader">
            <span>{hoverCellInfo.dayStr}</span> <br>
            <span><TransitiveValue targetValue={hoverCellInfo.total} duration={700} delay={100}/></span>
        </div>
        <div class="hoverTooltipCategories">
            {#each Object.entries(hoverCellInfo.cell).sort((a, b)=>{return b[1] - a[1]}) as [category_id, time] (category_id)}
                <div 
                    style="opacity: {time >= 60_000 ? 1 : 0.5}"
                    class="listElement" 
                    key={category_id}  
                    animate:flip={{ delay: 0, duration: 350, easing: quadOut }}>
                    <div class=left>
                        <div class="categoryColor" style="background-color: {$categoryStore[category_id]?.color || 'black'}"></div>
                        <span>{category_id}</span>
                    </div>
                    <span class=right><TransitiveValue targetValue={time} duration={700} delay={100}/>{$categoryStore[category_id].emojy}</span>
                </div>
            {/each}
        </div>
    </div>
</main>

<style>
    main{
        position: relative;
    }
    .headLabel{
        position: absolute;
        bottom: calc(-1rem - 12px);
        transform:  rotate(15deg);
        width: 100%;
        text-align: center;
    }
    .chartWrap{
        display: flex;
        position: relative;
        margin-top: 0rem;
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
        transition: transform 0.1s ease-in-out;
        overflow: hidden;
    }
    .cell:hover{
        background-color: var(--wash);
        transform: scale(1.3);
        border-radius: 4px;
        border: 1px solid var(--border-color);
        z-index: 3;
    }
    .cell:hover .dayOfMonth{
        background-color: var(--pastel-red);
        color: black !important;
        pointer-events: none;
    }
    /* .cell:last-child{
        border-bottom: none;
    }
    .row:last-child{
        border-right: none;
    } */
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
        pointer-events: none;
        position: relative;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .cellContentWrap div{
        pointer-events: none;
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
    .hoverTooltipWrap{
        pointer-events: none;
        background-color: var(--wash);
        border: 1px solid rgb(255, 0, 157);
        position: absolute;
        z-index: 8;
        width: 300px;
        padding: 12px;
        border-radius: 4px;
        transform: translate(calc(-300px / 7 * 3 - 50%), calc(-300px / 7 * 2 + 56px));
        min-width: 100px;
        min-height: 100px;
        transition: all 0.3s ease-out;
    }
    .hoverTooltipWrap::after{
        content: '';
        background-color: inherit;
        border: inherit;
        position: absolute;
        left: 50%;
        top: 0;
        width: 20px;
        height: 20px;
        border-top-left-radius: 4px;
        transform: translate(-50%, -50%) rotate(45deg);
        border-bottom: none;
        border-right: none;
    }
    .listElement{
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 4px;
        border-radius: 4px;
        margin-bottom: 4px;
        overflow: hidden;
    }
    .categoryColor{
        width: 0.5rem;
        height: 1rem;
        border-radius: 999px;
        transform: translateX(-3px);
        background-color: red;
        position: absolute;
    }
    .right{
        flex: 0 0 auto;
        text-align: right;
        overflow: hidden;
        white-space: nowrap;
    }
    .left{
        align-items: center;
        flex: 1 1 auto;
        background: linear-gradient(to right, white, white calc(100% - 1.5rem), transparent);
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        overflow: hidden;
        white-space: nowrap;
        font-weight: 600;
    }
    .left>span{
        padding-left: 10px;
    }
    .hoverTooltipHeader{
        /* display: flex;
        justify-content: space-between; */
        text-align: center;
        margin-bottom: 8px;
        font-size: 1.3rem;
    }
</style>