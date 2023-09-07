<script lang="ts">
    //@ts-nocheck
    import { flip } from 'svelte/animate'
    import type { appListSchema } from '../util/schemas'
    import { interpolateColor, normalizeValue } from '../util/general'
    import { formatTime } from '../util/time'
    import { onMount } from 'svelte'
    import { quintOut } from 'svelte/easing'
    import { categoryMapStore, categoryStore } from '../store/categoryStore'
    import { fade } from 'svelte/transition'
    import {activeSortStore} from '../store/globalSort'
    import TransitiveValue from './TransitiveValue.svelte'
    import ImageIcon from './ImageIcon.svelte'

    let list: appListSchema = {}
    let max: number = 0
    let min: number = 0

    onMount(() => {
        window.addEventListener('newSimpleList', (e) => {
            list = e.detail.list
            max = e.detail.max
            min = e.detail.min
        })
    })

    const openAppEdit = (app: string) => {
        const event = new CustomEvent('openAppEdit', {
            detail: app
        })
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

<div class="listAll">
    <div class="scrollAll">
        <div
            class="noDataIndicator"
            style="
            text-align: center; 
            opacity: {Object.keys(list).length ? '0' : '1'};
            display: block;
            overflow: hidden;
            font-size: 1.5rem;
            transition: all 0.5s ease-in-out;"
        >
            <span>No data available here!</span>
        </div>
        {#if Object.keys(list).length}
            <main
                in:fade={{ duration: 500, easing: quintOut }}
                out:fade={{ duration: 500, easing: quintOut }}
            >
                {#each Object.entries(list).sort($activeSortStore) as [app, total], i (app)}
                    <button
                        class="listElement"
                        animate:flip={{ delay: 0, duration: 400, easing: quintOut }}
                        key={app}
                        on:click={() => {
                            openAppEdit(app)
                        }}
                    >
                        <span class="categoryColor" style="background-color: {$categoryStore[$categoryMapStore[app] ?? 'Uncategorized']?.color || 'transparent'};"></span>
                        <span class="appName">
                            <ImageIcon app={app} size="1rem" />
                            {app}
                        </span>
                        <span
                            class="timeApp"
                            style="color: {interpolateColor(
                                normalizeValue(total.total, min, max),
                                colorScale
                            )};"
                            ><TransitiveValue targetValue={total.total} />
                            {$categoryStore[$categoryMapStore[app] ?? 'Uncategorized']?.emojy || ''}</span
                        >
                    </button>
                {/each}
            </main>
        {/if}
    </div>
</div>

<style>
    .listElement {
        text-align: left;
        border: none;
        display: flex;
        width: 100%;
        justify-content: space-between;
        padding: 4px;
        /* border-bottom: 1px solid var(--super_dark); */
        overflow: show;
        cursor: pointer;
        background-color: transparent;
        color: var(--text);
        font-size: 1rem;
    }
    .listElement:last-child {
        border-bottom: none;
    }
    .listElement:hover {
        background-color: var(--base);
    }
    .scrollAll{
        overflow-y: scroll;
        height: calc(100vh - 40px);
        background-color: var(--wash);
        border-radius: 4px;
    }
    .appName{
        display: block;
        flex: 1;
    }
    .categoryColor{
        width: 0.5rem;
        height: 1rem;
        border-radius: 999px;
        margin-right: 10px;
        transform: translateY(2px);
    }
</style>
