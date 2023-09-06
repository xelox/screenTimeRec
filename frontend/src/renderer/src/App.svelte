<script lang="ts">
    import CustomStackedChart from './components/CustomStackedChart.svelte'
    import AppAndCategoryEditor from './components/AppAndCategoryEditor.svelte'
    import SimpleList from './components/simpleList.svelte'
    import PivotAndPeriodControlls from './components/PivotAndPeriodControlls.svelte';
    import TransitiveValue from './components/TransitiveValue.svelte'
    import ImageIcon from './components/ImageIcon.svelte'

    const args = window.api.argv;
    
    const isOverlay = args.includes('overlay');
    const isMain = args.includes('main');

    const currentWindow = {app: 'none', time: 0}
    if(isOverlay){
        window.api.getCurrentAppTime().then(res=>{
            currentWindow.app = res.app;
            currentWindow.time = res.time;
        })
        setInterval(()=>{
            window.api.getCurrentAppTime().then(res=>{
                currentWindow.app = res.app;
                currentWindow.time = res.time;
            })
        }, 1000)
    }
</script>

<style>
    main{
        background-color: var(--dark-blue);
        padding: 20px 0 20px 0;
        display: flex;
        height: 100vh;
    }
    main>div{
        padding: 0 10px 0 10px;
    }
    .periodViewPannel{
        padding: 0 50px 0 150px;
    }
    .simpleListWrap{
        width: 700px;
        height: calc(100vh - 40px);
        display: block;
    }
    .overlay{
        overflow: hidden;
        height: 100vh;
        width: 100vw;
        font-size: 0.8rem;
    }
    .overlayContent{
        background-color: rgba(0, 0, 0, 0.835);
        width: calc(130px + 8px);
        padding: 4px;
        position: absolute;
        bottom: 0;
        border: 1px solid var(--border-color);
        border-radius: 4px;
        margin: 8px;
        overflow: hidden;
    }
    .overlay img{
        width: 0.8rem;
        height: 0.8rem;
        transform: translateY(2px);
    }
    .overlayContent>p{
        width:130px;
        text-overflow: eclipsis;
        white-space: nowrap;
    }
</style>

{#if isOverlay}
    <div class="overlay">
        <div class="overlayContent">
            <p>
                <ImageIcon app={currentWindow.app} size="0.8rem" /> {currentWindow.app} <br>
                <TransitiveValue targetValue={currentWindow.time} />
            </p>
        </div>
    </div>
{/if}

{#if isMain}
    <main>
        <div class="periodViewPannel">
            <PivotAndPeriodControlls/>
            <CustomStackedChart/>
        </div>
        <div class="simpleListWrap">
            <SimpleList/>
        </div>
    </main>
{/if}

<AppAndCategoryEditor/>

