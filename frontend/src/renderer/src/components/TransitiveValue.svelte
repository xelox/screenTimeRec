<script lang="ts">
    import { formatTimeConstantStringSize } from "../util/time"

    let displayValue = 0;
    let beforeMutation = 0;
    let mutationStartTs = Date.now();

    export let formatFunction = formatTimeConstantStringSize;
    export let delay = 0;
    export let targetValue = 0;
    export let duration = 500;
    export let easeFunc = (x: number): number => {
        return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
    }

    const interval = 50;

    let intervalId: NodeJS.Timer | null = null;

    const startMutation = (targetValue: number) => {
        setTimeout(() => {
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
        }, delay)
    }

    $: startMutation(targetValue);
</script>

<span>
    {formatFunction(displayValue)}
</span>
