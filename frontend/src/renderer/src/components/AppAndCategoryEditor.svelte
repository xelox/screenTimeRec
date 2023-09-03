<script lang="ts">
    import EditBtn from "./editBtn.svelte";
    import DeleteBtn from "./deleteBtn.svelte";
    import { onMount } from "svelte"
    import {categoryStore} from "../store/categoryStore"
    import ColorPicker from 'svelte-awesome-color-picker';
    let appToEdit = '';
    let editingCaterogry = '';
    
    const openEditTool = (category: string) => {
        editingCaterogry = category;
    }
    onMount(() => {
        window.addEventListener('openAppEdit', (e: CustomEvent) => {
            console.log(e.detail)
            appToEdit = e.detail
        })
    })
</script>

{#if appToEdit}
    <main>
        <h2>{appToEdit}</h2>
        
        <!-- catergory select -->
        <div class="categoriesWrap">
            <div class="categoryAdd categoryName">
                Add new category
            </div>
            {#each $categoryStore as category, i}
                <div class="categoryBtn" style="background-color: {category.color};">
                    <div class="categoryName" >{category.name}</div>
                    <div class="controllsWrap">
                        <button on:click={()=>openEditTool(category.name)}><EditBtn/></button>
                        <button><DeleteBtn/></button>
                    </div>
                    {#if editingCaterogry === $categoryStore[i].name}
                        <div class="categoryEditTool">
                            <input type="text" bind:value={$categoryStore[i].name}>
                            <ColorPicker bind:hex={$categoryStore[i].color} label={$categoryStore[i].color}/>
                        </div>
                    {/if}
                </div>
            {/each}
        </div>

    </main>
{/if}

<style>
    main{
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        display: block;
        justify-content: center;
        align-items: center;
        background-color: var(--base);
        position: fixed;
        padding: 8px;
        border-radius: 4px;
        border: 1px solid var(--border-color);
    }
    .categoriesWrap{
        background-color: var(--wash);
        border-radius: 4px;
        padding: 4px;
    }
    .categoryBtn{
        display: flex;
        flex-direction: row;
        border-radius: 4px;
        min-width: 400px;
        justify-content: space-between;
        cursor:default;
        position: relative;
    }
    .categoryName{
        padding: 4px;
        font-size: 1rem;
    }
    .categoryAdd{
        text-align: center;
        background-color: var(--wash);
        color: var(--middle);
        cursor: pointer;
    }
    button{
        background-color: black;
        border: none;
        width: calc(1rem + 8px);
        height: calc(1rem + 8px);
        margin-top: 3px;
        padding: 4px;
        border-radius: 999px;
        cursor: pointer;
    }
    .categoryEditTool{
        padding: 4px;
        position: absolute;
        width: 100%;
        background-color: var(--text);
        color: black;
        top: 0;
        bottom: 0;
        transform: translateY(40px);
        border-radius: 4px;
        z-index: 1;
    }
    .categoryEditTool::before{
        background-color: inherit;
        content: '';
        width: 10px;
        height: 10px;
        display: block;
        position: absolute;
        left: 50%; top: 0;
        transform: translate(-50%, -50%) rotate(45deg);
        z-index: 2;
    }
</style>