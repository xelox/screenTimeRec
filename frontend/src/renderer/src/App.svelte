<script lang="ts">
    import CustomStackedChart from './components/CustomStackedChart.svelte'
    import AppAndCategoryEditor from './components/AppAndCategoryEditor.svelte'
    import SimpleList from './components/simpleList.svelte'
    import PivotAndPeriodControlls from './components/PivotAndPeriodControlls.svelte';

</script>

<style>
    main{
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
</style>

<main>
    <div class="periodViewPannel">
        <PivotAndPeriodControlls/>
        <CustomStackedChart/>
    </div>
    <div class="simpleListWrap">
        <SimpleList/>
    </div>
</main>

<AppAndCategoryEditor/>

