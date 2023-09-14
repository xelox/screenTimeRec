<script lang="ts">
    import {format} from 'date-fns';
    import {getMonday, getSunday} from '../util/time';
    import { onMount } from 'svelte'

    const possiblePeriodTypes = ['day', 'week', 'month', 'year'];
    let periodTypeIndex = 2;
    let periodType = 'day';

    const startFunctionOfType = {
        day: (pivotDate: Date) => pivotDate,
        week: (pivotDate: Date) => getMonday(pivotDate),
        month: (pivotDate: Date) => new Date(pivotDate.getFullYear(), pivotDate.getMonth(), 1),
        year: (pivotDate: Date) => new Date(pivotDate.getFullYear(), 0, 1),
    }
    const endFunctionOfType = {
        day: (pivotDate: Date) => pivotDate,
        week: (pivotDate: Date) => getSunday(pivotDate),
        month: (pivotDate: Date) => new Date(pivotDate.getFullYear(), pivotDate.getMonth() + 1, 0),
        year: (pivotDate: Date) => new Date(pivotDate.getFullYear(), 11, 31),
    }

    let pivotDate = new Date();
    let start: string = format(startFunctionOfType.week(pivotDate), 'yyyy-MM-dd');
    let end: string = format(endFunctionOfType.week(pivotDate), 'yyyy-MM-dd');

    function changePeriod(d: number){
        const periodToDeltaMap = {
            day: 1,
            week: 7,
            month: 30,
            year: 365,
        }
        const delta = periodToDeltaMap[periodType]
        if(d < 0) pivotDate = new Date(pivotDate.setDate(pivotDate.getDate() - delta))
        else pivotDate = new Date(pivotDate.setDate(pivotDate.getDate() + delta))
    }
    function mouseScrollOnPeriod(e){
        changePeriod(e.deltaY);
        broadcastPeriodChange();
    }
    function mouseScrollOnPeriodType(e){
        const delta = e.deltaY > 0 ? 1 : -1;
        let newIndex = periodTypeIndex + delta;
        if(newIndex < 0) newIndex = possiblePeriodTypes.length - 1;
        else if(newIndex >= possiblePeriodTypes.length) newIndex = 0;
        periodTypeIndex = newIndex;
        periodType = possiblePeriodTypes[periodTypeIndex];
        broadcastPeriodChange();
    }

    function changeStartAndEnd(){
        start = format(startFunctionOfType[periodType](pivotDate), 'yyyy-MM-dd');
        end = format(endFunctionOfType[periodType](pivotDate), 'yyyy-MM-dd');
    }

    function broadcastPeriodChange(){
        changeStartAndEnd();
        window.dispatchEvent(new CustomEvent('periodChange', {detail: {start, end, periodType}}));
    }

    onMount(() => {
        setTimeout(() => {
            broadcastPeriodChange();
        }, 200);
        broadcastPeriodChange();
    });
</script>

<div class="periodTypeWrap" on:wheel|passive={mouseScrollOnPeriodType}>
    <span class="periodTypeControll">{periodType}</span>
</div>
<div class="pivotDateControlls" on:wheel|passive={mouseScrollOnPeriod}>
    <button on:click={() => {changePeriod(-1)}}>{'<'}</button>
    <span class="periodTitle">
        {#if periodType === 'day'}
        {format(pivotDate, 'do MMM yyyy')}
        {:else if periodType === 'week'}
        from {format(pivotDate, 'EE do MMM yyyy')}
        {:else if periodType === 'month'}
        {format(pivotDate, 'MMM yyyy')}
        {:else if periodType === 'year'}
        {format(pivotDate, 'yyyy')}
        {/if}
    </span>
    <button on:click={() => {changePeriod(1)}}>{'>'}</button>    
</div>

<style>
    .periodTypeWrap{
        text-align: center;
        margin-bottom: 10px;
        cursor:e-resize;
    }
    .pivotDateControlls{
        display: block;
        width: max-content;
        left: 50%;
        position: relative;
        transform: translateX(calc(-50%));
        cursor:e-resize;
        margin-bottom: 10px;
    }
    .pivotDateControlls button, .periodTitle, .periodTypeControll{
        background-color: var(--border-color);
        color: var(--text);
        border: none;
        padding: 4px;
        border-radius: 4px;
        font-size: 1.1rem;
        padding: 2px 6px 2px 6px;
    }
</style>