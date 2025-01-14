<script lang="ts">
    import * as Resizable from "@/components/ui/resizable";

    let innerWidth = 0;
</script>

<svelte:window bind:innerWidth />

{#if innerWidth >= 900}
    <Resizable.PaneGroup class="min-h-full mt-3" direction="horizontal">
        <Resizable.Pane defaultSize={50} class="pr-6">
            <slot name="panel1">1</slot>
        </Resizable.Pane>
        <Resizable.Handle class="" withHandle />
        <Resizable.Pane defaultSize={50} class="pl-6">
            <slot name="panel2">2</slot>
        </Resizable.Pane>
    </Resizable.PaneGroup>
{:else}
    <slot name="panel1" />
    <slot name="panel2" />
{/if}
