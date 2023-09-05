<script lang="ts">
    import { formatTimeConstantStringSize } from "../util/time"

    let displayValue = 0;
    export let targetValue = 0;
    export let duration = 500;
    let beforeMutation = 0;
    let mutationStartTs = Date.now();

    function easeFunc(x: number): number {
        return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
    }

    const interval = 50;

    let intervalId: NodeJS.Timer | null = null;

    const startMutation = (targetValue) => {
        console.log('targetValue', targetValue)
        mutationStartTs = Date.now();
        beforeMutation = displayValue;
        if(intervalId) clearInterval(intervalId);
        intervalId = setInterval(() => {
            const t = Date.now() - mutationStartTs;
            const p = t / duration;
            const progress = easeFunc(p);
            if (progress >= 1) {
                displayValue = targetValue;
                clearInterval(intervalId);
                intervalId = null;
                return;
            }
            displayValue = Math.floor(beforeMutation + (targetValue - beforeMutation) * progress);
        }, interval);
    }

    $: startMutation(targetValue);
</script>

<span style="white-space: pre; font-family: 'Monocraft Nerd Font', monospace;">
{formatTimeConstantStringSize(displayValue)}
</span>
