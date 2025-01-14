<script lang="ts">
    import * as Tooltip from "@/components/ui/tooltip";
    import type { ClassEntryType } from "@/library/class-entry/types";

    export let value: ClassEntryType;
</script>

<Tooltip.Root>
    <Tooltip.Trigger>
        {value.substring(0, 6).toUpperCase()}
    </Tooltip.Trigger>
    <Tooltip.Content>
        {#if value === "in-person"}
            Fully in-person class
        {:else if value === "hybrid"}
            Mix of in-person and online
        {:else if value === "online"}
            Fully online class
        {:else}
            {value}
        {/if}
    </Tooltip.Content>
</Tooltip.Root>
