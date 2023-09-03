<script lang="ts">
    //@ts-nocheck
    import { flip } from 'svelte/animate'
    import type { appListSchema } from '../util/schemas'
    import { interpolateColor, normalizeValue } from '../util/general'
    import { formatTime } from '../util/time'
    import { onMount } from 'svelte'
    import { quintOut } from 'svelte/easing'

    export let list: appListSchema = {}
    export let max: number = 0
    export let min: number = 0
    export let sort: (a: any, b: any) => number

    const openAppEdit = (app: string) => {
        const event = new CustomEvent('openAppEdit', {
            detail: app
        })
        console.log(event)
        window.dispatchEvent(event)
    }

    const colorScale = [
        { color: '#8AF8D5', position: 0 },
        { color: '#a7ebc7', position: 0.25 },
        { color: '#c0eaa5', position: 0.5 },
        { color: '#f3bf97', position: 0.75 },
        { color: '#f59f9c', position: 1 }
    ]
</script>

<main>
    {#each Object.entries(list).sort(sort) as [app, total], i (app)}
        <!-- style="color: {interpolateColor(normalizeValue(total, data.appMin, data.appMax), colorScale)};" -->
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <button
            class="listElement"
            animate:flip={{ delay: 0, duration: 400, easing: quintOut }}
            key={app}

            on:click={()=>{openAppEdit(app)}}
        >
            <span class="appName">
                <img
                    src={window.api.path.join(
                        window.api.env.APPDATA,
                        'screenTimeRec',
                        'icons',
                        app + '.png'
                    )}
                    alt=""
                    style="width: 1rem; height: 1rem; transform: translateY(0.15rem);"
                />
                {i + 1}. {app}
            </span>
            <span
                class="timeApp"
                style="color: {interpolateColor(
                    normalizeValue(total.total, min, max),
                    colorScale
                )};">{formatTime(total.total)}</span
            >
        </button>
    {/each}
</main>

<style>
    .listElement {
        display: flex !important;
        width: 100%;
        justify-content: space-between;
        padding: 4px;
        border-bottom: 1px solid var(--super_dark);
        position: relative;
        overflow: show;
        cursor: pointer;
        background-color: transparent;
        border: none;
        color: var(--text);
        font-size: 1rem;
    }
    .listElement:last-child {
        border-bottom: none;
    }
    .listElement:hover {
        background-color: var(--base);
    }
</style>
