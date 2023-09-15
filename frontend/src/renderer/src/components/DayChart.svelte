<script lang="ts">
    import { onMount } from "svelte"
    import { categoryMapStore, categoryStore } from "../store/categoryStore"
    import TransitiveValue from "./TransitiveValue.svelte"
    import type { appListSchema } from "../util/schemas"
    
    const transitionDuration = 600;
    const outerRadius = 140;
    const innerRadius = 90;

    const easeFunc = (x: number): number => {
        return x < 0.5 ? 16 * x * x * x * x * x : 1 - Math.pow(-2 * x + 2, 5) / 2;
    }

    export let start = null;
    let canvas: HTMLCanvasElement | null = null;
    let ctx: CanvasRenderingContext2D | null = null;
    let lastUpdate = Date.now();
    onMount(() => {
        if(!canvas) return;
        ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        canvas.width = 300;
        canvas.height = 300;

        canvas.addEventListener('mousemove', (e) => {
            const mx = e.offsetX;
            const my = e.offsetY;
            findHoverAppAndAct(mx, my);
       })
        renderData();
    });

const findHoverAppAndAct = (mx: number, my: number) => {
    if(!geometricData) return;
    const d = Math.sqrt((mx - canvas.width / 2) ** 2 + (my - canvas.height / 2) ** 2);
    if(d > innerRadius && d < outerRadius){
        const atomp1 = Math.atan2(my - canvas.height / 2, mx - canvas.width / 2);
        const atom = atomp1 < 0 ? 2 * Math.PI + atomp1 : atomp1;
        for(const [app, {startAngle, endAngle, time}] of Object.entries(geometricData)){
            if(atom > startAngle && atom < endAngle){
                if(app === hoverApp?.name) {
                    hoverApp.show = true;
                    break;
                }
                const middleAngle = (startAngle + endAngle) / 2;
                const x = Math.cos(middleAngle) * (outerRadius + innerRadius) / 2 + canvas.width / 2;
                const y = Math.sin(middleAngle) * (outerRadius + innerRadius) / 2 + canvas.height / 2;
                hoverApp = {
                    name: app,
                    time,
                    show: true,
                    pos: {x, y},
                    up: middleAngle > Math.PI
                }
                break;
            }
        }
    }
    else if (hoverApp) hoverApp.show = false;
}

    type GeometricData = {
        [app: string]: {
            startAngle: number;
            endAngle: number;
            time: number;
        }
    }

    let geometricData: GeometricData | null = null;

    let hoverApp: {
        name: string;
        time: number;
        show: boolean;
        pos: { x: number, y: number };
        up: boolean
    } | null = null;

    type Data = { 
        total: number;
        appdata: {
            [app: string]: number;
        }
    }

    let data: Data = {total: 0, appdata: {}};

    const proccessRawData = (rawData: any[]) => {
        const tmpData: Data = {total: 0, appdata: {}};
        const tmpList: appListSchema = {};
        let min = Infinity; 
        for(const item of rawData) {
            const app = item.application;
            if(app === 'unknown') continue;
            if(!categoryMapStore[app])
                    $categoryMapStore[app] = item.category_id ?? 'Uncategorized';
            //chart data logic
            tmpData.total += item.time;
            if(!tmpData.appdata[app]) tmpData.appdata[item.application] = item.time;
            else tmpData.appdata[app] += item.time;
            //simple list logic
            tmpList[app] = {
                total: tmpData.appdata[app],
                activeTime: 0,
                inactiveTime: 0,
            }
            if(tmpList[app].total < min) min = tmpList[item.application].total;
        }
        data = tmpData;
        const e = new CustomEvent('newSimpleList', {detail: {list: tmpList, max: data.total, min}});
        window.dispatchEvent(e);
    }

    const renderData = () => {
        requestAnimationFrame(renderData);
        if(!ctx || !canvas) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if(data.total === 0) return;
        let startAngle = 0;
        let now = Date.now();
        const op = (now - lastUpdate) / (transitionDuration / 2);
        let p = op;
        if(p > 1) p = 1;
        if(p < 0) p = 1 + p;
        p = easeFunc(p);
        let maxAngle = 2 * Math.PI * p;
        if(op < 0) {
            maxAngle = 2 * Math.PI - maxAngle;
            startAngle = -maxAngle
        };
        const tmpGeometricData: GeometricData = {};
        for(const [app, time] of Object.entries(data.appdata).sort((a, b) => b[1] - a[1])){
            const a = (time / data.total) * maxAngle;
            const category = $categoryMapStore[app];
            const fillStyle = $categoryStore[category]?.color || 'black';
            const con = hoverApp?.name === app && hoverApp?.show;
            const effectiveOuterRadius = con ? outerRadius + 4 : outerRadius;
            ctx.beginPath();
            ctx.lineTo(canvas.width / 2, canvas.height / 2);
            ctx.arc(canvas.width / 2, canvas.height / 2, effectiveOuterRadius, startAngle, startAngle + a, false);
            ctx.lineTo(canvas.width / 2, canvas.height / 2);
            ctx.fillStyle = fillStyle;
            ctx.fill();
            ctx.stroke();
            ctx.closePath();
            if(op >= 1) {
                tmpGeometricData[app] = {
                    startAngle: startAngle,
                    endAngle: startAngle + a,
                    time
                }
            }
            startAngle += a;
        }
        ctx.beginPath();
        ctx.lineTo(canvas.width / 2, canvas.height / 2);
        ctx.arc(canvas.width / 2, canvas.height / 2, innerRadius, 0, 2 * Math.PI, false);
        ctx.lineTo(canvas.width / 2, canvas.height / 2);
        ctx.fillStyle = 'rgb(44, 54, 61)';
        ctx.fill();
        ctx.closePath();
        if(op >= 1 && !geometricData){
            geometricData = tmpGeometricData;
        }
    }

    const getData = () => {
        window.api.loadPeriod(start, start, (err, rawData) => {
            if(err) return console.error(err);
            geometricData = null;
            if(data.total === 0) {
                proccessRawData(rawData);
                lastUpdate = Date.now();
            }
            lastUpdate = Date.now() + transitionDuration / 2;
            setTimeout(()=>{proccessRawData(rawData)}, transitionDuration / 2);
        })
    }

    $: start && getData();
  
</script>

<main>
    {#if data}
        <div class="totalTip">
            Total: <br> <TransitiveValue targetValue={data.total}/>
        </div>
    {/if}

    <canvas bind:this={canvas}/>
    {#if hoverApp}
        <div class="hoverTooltip" style={`left: ${hoverApp.pos.x}px; top: ${hoverApp.pos.y}px; transform: translate(-50%, ${hoverApp.up? 'calc(-100% - 16px)' : '16px'}); opacity: ${hoverApp.show ? 0.95 : 0}`}>
            <h3>{hoverApp.name}</h3>
            <TransitiveValue targetValue={hoverApp.time}/> <br>
            <TransitiveValue targetValue={hoverApp.time / data.total * 100} formatFunction={(v) => `${v.toFixed(2)}%`}/>
        </div>
    {/if}
</main>

<style>
    .totalTip{
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        text-align: center;
        padding: 4px;
        border-radius: 4px;
        z-index: 9;
    }
    main{ position: relative; }
    canvas{
        position: relative;
        width: 300px;
        height: 300px;
        border-radius: 4px;
    }
    .hoverTooltip{
        pointer-events: none;
        border: 1px solid rgb(255, 0, 157);
        padding: 12px;
        position: absolute;
        background-color: var(--wash);
        z-index: 9;
        border-radius: 4px;
        width: max-content;
        transition: all 0.3s ease-in-out;
        transform: translateX(-50%);
        min-width: 150px;
    }
</style>