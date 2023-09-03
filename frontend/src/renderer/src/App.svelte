<script lang="ts">
    import DayViewer from './components/DayViewer.svelte'
    import CustomStackedChart from './components/CustomStackedChart.svelte'
    import AppAndCategoryEditor from './components/AppAndCategoryEditor.svelte'

</script>

<style>
    main{
        padding: 20px 0 20px 0;
        display: flex;
        height: 100vh;
        position: relative;
    }
    main>div{
        padding: 0 10px 0 10px;
    }
    .periodViewPannel{
        /* border: 1px solid white; */
        flex: 1;
    }
    .dayViewPannel{
        border-left: 1px solid rgba(0, 0, 0, 0.226);
        flex: 1
    }
</style>

<main>
    <div class="periodViewPannel">
        <CustomStackedChart/>
    </div>
    <div class="dayViewPannel">
        <DayViewer/>
    </div>
</main>

<AppAndCategoryEditor/>

