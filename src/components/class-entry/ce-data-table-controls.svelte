<script lang="ts">
    import { type Writable } from "svelte/store";
    import ChevronDown from "~icons/material-symbols/keyboard-arrow-down?raw&width=100%25&height=100%25";
    import { Checkbox } from "$lib/components/ui/checkbox";
    import Button from "@/components/ui/button/button.svelte";
    import { tweened } from "svelte/motion";
    import { cubicOut } from "svelte/easing";

    export let selected: Writable<boolean>;
    export let expanded: Writable<boolean>;

    function getChevronRotation(expanded: boolean) {
        return expanded ? 180 : 0;
    }

    let rotationTween = tweened(0, {
        duration: 300,
        easing: cubicOut,
    });

    $: {
        rotationTween.set(getChevronRotation($expanded));
    }
</script>

<div class="min-w-[2rem] flex items-center justify-center gap-1">
    <Checkbox bind:checked={$selected} />
    <Button
        variant="ghost"
        class="p-0 px-2 m-0"
        on:click={() => expanded.update((v) => !v)}
    >
        <span
            class="h-4 w-4"
            style={`transform: rotate(${$rotationTween}deg);`}
        >
            {@html ChevronDown}
        </span>
    </Button>
</div>
