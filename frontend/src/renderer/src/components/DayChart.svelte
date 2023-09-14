<script lang="ts">
    import { onMount } from "svelte"
    import { categoryMapStore, categoryStore } from "../store/categoryStore"
    import TransitiveValue from "./TransitiveValue.svelte"
    
    const transitionDuration = 600;
    const outerRadius = 130;
    const innerRadius = 70;

    const easeFunc = (x: number): number => {
        return x < 0.5 ? 16 * x * x * x * x * x : 1 - Math.pow(-2 * x + 2, 5) / 2;
    }

    export let start = null;
    let canvas: HTMLCanvasElement | null = null;
    let ctx: CanvasRenderingContext2D | null = null;
    let lastUpdate = Date.now();
    let mx = 150, my = 150;
    onMount(() => {
        if(!canvas) return;
        ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        canvas.width = 300;
        canvas.height = 300;
        mx = canvas.width / 2;
        my = canvas.height / 2;
        console.log(ctx);

        canvas.addEventListener('mousemove', (e) => {
            mx = e.offsetX;
            my = e.offsetY;

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
            else hoverApp.show = false;
        })

        renderData();
    });

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
        console.log('proccessing new data'); 
        const tmpData: Data = {total: 0, appdata: {}};
        for(const item of rawData) {
            if(item.application === 'unknown') continue;
            tmpData.total += item.time;
            if(!tmpData.appdata[item.application]) tmpData.appdata[item.application] = item.time;
            else tmpData.appdata[item.application] += item.time;
        }
        data = tmpData;
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
            const effectiveOuterRadius = hoverApp?.name === app && hoverApp?.show ? outerRadius + 10 : outerRadius;
            ctx.beginPath();
            ctx.lineTo(canvas.width / 2, canvas.height / 2);
            ctx.arc(canvas.width / 2, canvas.height / 2, effectiveOuterRadius, startAngle, startAngle + a, false);
            ctx.lineTo(canvas.width / 2, canvas.height / 2);
            ctx.fillStyle = fillStyle;
            ctx.fill();
            ctx.strokeStyle = 'black';
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
            console.log(geometricData);
        }
    }

    const getData = () => {
        window.api.loadPeriod(start, start, (err, rawData) => {
            if(err) return console.error(err);
            geometricData = null;
            lastUpdate = Date.now() + transitionDuration / 2;
            setTimeout(()=>{proccessRawData(rawData)}, transitionDuration / 2);
        })
    }

    $: start && getData();
  
</script>

<main>
    <canvas bind:this={canvas}/>
    {#if hoverApp}
        <div class="hoverTooltip" style={`left: ${hoverApp.pos.x}px; top: ${hoverApp.pos.y}px; transform: translate(-50%, ${hoverApp.up? 'calc(-100% - 16px)' : '16px'}); opacity: ${hoverApp.show ? 0.85 : 0}`}>
            <h3>{hoverApp.name}</h3>
            <TransitiveValue targetValue={hoverApp.time}/>
        </div>
    {/if}
</main>

<style>
    main{
        position: relative;
    }
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
    }
</style>