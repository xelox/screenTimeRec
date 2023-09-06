<script lang="ts">
    import { onMount } from "svelte"

    export let app: string = 'unknown';
    export let size = '1rem';
    export let retry = false;

    let imgDom: HTMLImageElement = null;

    onMount(()=>{
        loadImg(app);
    })

    const loadImg = (app:string) => {
        if(!imgDom) return;
        
        const imagePath = window.api.path.join(window.api.env.APPDATA,'screenTimeRec','icons', `${app}.png`);
        imgDom.src = imagePath;
        imgDom.onerror = _e => {
            imgDom.src = window.api.path.join(window.api.env.APPDATA,'screenTimeRec',"defaultExecImg.png");
            if(retry){
                setTimeout(() => {
                    imgDom.src = imagePath;
                }, 500);
            }
        }
    }

    $: loadImg(app);
  
</script>
<img bind:this={imgDom} alt="{app}" style="width: {size}; heigth: {size}; transform: translateY(2px)">