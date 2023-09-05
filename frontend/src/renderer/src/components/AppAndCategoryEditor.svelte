<script lang="ts">
    import DeleteBtn from "./deleteBtn.svelte";
    import { onMount } from "svelte"
    import {categoryStore, categoryMapStore} from "../store/categoryStore"
    import ColorPicker from 'svelte-awesome-color-picker';

    let appToEdit = '';
    let editingCaterogry = '';

    let nameBeforeEdit = '';
    let colorBeforeEdit = '';
    let emojyBeforeEdit = '';
    let categoryEditToolY = 0;

    onMount(() => {
        window.addEventListener('openAppEdit', (e: CustomEvent) => {
            console.log('open', e.detail)
            appToEdit = e.detail
        });

        window.api.loadCategories((err, rows)=>{
            if(err) return console.log(err)
            const tmp = {}
            for(const row of rows){
                tmp[row.id] = row
            }
            categoryStore.set(tmp)
        })
    })

    const openCategoryEditTool = (e: MouseEvent, category: any, category_id: string) => {
        nameBeforeEdit = category.category_name;
        colorBeforeEdit = category.color;
        emojyBeforeEdit = category.emojy;
        editingCaterogry = category_id;
        const target = e.target as HTMLElement;
        categoryEditToolY = target.getBoundingClientRect().y - target.parentElement.parentElement.parentElement.parentElement.getBoundingClientRect().y;

        console.log(categoryEditToolY);
        e.preventDefault();    
    }
</script>

{#if appToEdit}
    <main>
        <div class="toolWrap">
        <span class="currentCategoryTip">{$categoryMapStore[appToEdit]}</span>
        <button class=delBtn on:click={()=>{appToEdit=''; editingCaterogry=''}}><DeleteBtn/></button>
        <h2>{appToEdit}</h2>
        
        <!-- catergory select -->
        <div class="categoriesSelect">
            <div class="categoriesWrap">
                {#each Object.entries($categoryStore).sort((a, b)=>{return a[1].category_name < b[1].category_name ? -1 : 1}) as [category_id, category]}
                    <div class="categoryBtn" 
                        style="background-color: {$categoryMapStore[appToEdit] === category_id ? 'var(--super_dark)' : ''}"
                    >
                        <span class="categoryColor" style="background-color: {category.color}"></span>
                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                        <!-- svelte-ignore a11y-no-static-element-interactions -->
                        <div class="categoryName" 
                        on:click={e=>{
                            if(e.target !== e.currentTarget) return console.log(e.target, e.currentTarget);
                            window.api.setAppCategory(appToEdit, category_id, (err)=>{
                                if(err) return console.log(err);
                                console.log('saved', appToEdit , category_id)
                                $categoryMapStore[appToEdit] = category_id;
                                appToEdit = '';
                                editingCaterogry = '';
                            })
                        }} on:contextmenu={(e) => {openCategoryEditTool(e, category, category_id)}}>{category.category_name} {category.emojy}</div>
                        {#if editingCaterogry === category_id}
                            <div class="categoryEditTool" style="top:{ categoryEditToolY}px;">
                                <div style="display: flex;">
                                    
                                    <input type="text" bind:value={$categoryStore[category_id].category_name}>
                                </div>    
                                <ColorPicker bind:hex={$categoryStore[category_id].color} label={$categoryStore[category_id].color}/>
                                <div class="editBtnsWrap">
                                    <button class="editBtns saveCategoryEdit" on:click={()=>{
                                        window.api.saveNewCategoryProp(category_id, $categoryStore[category_id].category_name, $categoryStore[category_id].color, $categoryStore[category_id].emojy, (err)=>{
                                            if(err) return console.log(err);
                                            editingCaterogry = '';
                                            nameBeforeEdit = '';
                                            colorBeforeEdit = '';
                                            emojyBeforeEdit = '';
                                        })
                                    }}>Save</button>
                                    <button class="editBtns cancelCategoryEdit" on:click={()=>{
                                        $categoryStore[category_id].category_name = nameBeforeEdit;
                                        $categoryStore[category_id].color = colorBeforeEdit;
                                        $categoryStore[category_id].emojy = emojyBeforeEdit;
                                        editingCaterogry = '';
                                    
                                    }}>Cancel</button>
                                </div>
                            </div>
                        {/if}
                    </div>
                {/each}
            </div>
        </div>
        </div>
    </main>
{/if}

<style>
    main{
        backdrop-filter: blur(4px);
        background-color: #00000031;
        position: absolute;
        width: 100vw;
        height: 100vh;
        top: 0;
        left: 0;
        z-index: 10;
    }
    .toolWrap{
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        display: block;
        justify-content: center;
        align-items: center;
        background-color: var(--base);
        position: absolute;
        padding: 8px;
        border-radius: 4px;
        box-shadow:
            0 1px 3px rgba(0, 0, 0, 0.24), /* First layer */
            0 7px 5px rgba(0, 0, 0, 0.18), /* Second layer */
            0 13px 7px rgba(0, 0, 0, 0.12); /* Third layer */
    }
    .currentCategoryTip{
        color: var(--detail);
    }
    .delBtn{
        position: absolute;
        right: 10px;
        top: 10px
    }
    h2{
        color: white;
        width: 100%;
        margin-bottom: 8px;
    }
    .categoriesWrap{
        max-height: 450px;
        overflow-y: auto;
    }
    .categoryBtn{
        border: none;
        color: var(--text);
        display: flex;
        flex-direction: row;
        min-width: 400px;
        justify-content: space-between;
        cursor:default;
        cursor: pointer;
        border-bottom: 1px solid var(--border-color);
    }
    .categoryBtn:hover{
        background-color: var(--wash);
    }
    .categoryName{
        width: 100%;
        font-size: 1rem;
        text-align: right;
        padding: 4px;
    }
    .delBtn{
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
        padding: 12px;
        position: absolute;
        width: calc(100% + 100px);
        height: fit-content;
        background-color: var(--wash);
        color: var(--text);
        top: 0;
        transform: translate(-62px, 40px);
        border-radius: 4px;
        z-index: 1;
        box-shadow:
            0 1px 3px rgba(0, 0, 0, 0.24), /* First layer */
            0 7px 5px rgba(0, 0, 0, 0.18), /* Second layer */
            0 13px 7px rgba(0, 0, 0, 0.12); /* Third layer */
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
    .categoryEditTool input{
        background-color: var(--wash);
        border: 1px solid var(--pastel-blue);
        width: 100%;
        color: var(--text);
        padding: 4px;
        border-radius: 4px;
        margin-bottom: 10px;
    }
    .editBtns{
        background-color: rgb(22, 65, 31);
        border: 1px solid var(--pastel-green);
        padding: 4px;
        border-radius: 4px;
        cursor: pointer;
        /* border: 1px solid var(--border-color); */
        margin: 4px;
        color: white;
    }
    .cancelCategoryEdit{
        background-color: rgb(65, 22, 22);
        border: 1px solid var(--pastel-red);
    }
    .editBtnsWrap{
        display: flex;
        flex-direction: row;
        justify-content: right;
    }
    .categoryColor{
        width: 0.5rem;
        height: 1rem;
        position: relative;
        border-radius: 999px;
        margin: 6px 0 0 6px;
        transform: translateY(2px);
    }
</style>