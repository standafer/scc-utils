<script lang="ts">
    import Filter from "~icons/material-symbols/filter-alt?raw&width=100%25&height=100%25";

    import type { PersistentStore } from "@macfja/svelte-persistent-store";
    import * as DropdownMenu from "@/components/ui/dropdown-menu";
    import { Button } from "@/components/ui/button";

    export let schedulerFilterSettings: PersistentStore<{
        includeWaitlist: boolean;
        discludeSelf: boolean;
    }>;
</script>

<DropdownMenu.Root closeOnItemClick={false} {...$$restProps}>
    <DropdownMenu.Trigger asChild let:builder>
        <Button
            variant="ghost"
            builders={[builder]}
            size="icon"
            class="relative h-8 w-8 p-0"
        >
            <span class="h-4 w-4">
                {@html Filter}
            </span>
        </Button>
    </DropdownMenu.Trigger>
    <DropdownMenu.Content>
        <DropdownMenu.Group>
            <DropdownMenu.Label>Click to filter</DropdownMenu.Label>
        </DropdownMenu.Group>
        <DropdownMenu.Separator />
        <DropdownMenu.Group>
            <DropdownMenu.CheckboxItem
                bind:checked={$schedulerFilterSettings.includeWaitlist}
            >
                Include waitlist
            </DropdownMenu.CheckboxItem>
            <DropdownMenu.CheckboxItem
                bind:checked={$schedulerFilterSettings.discludeSelf}
            >
                Disclude self
            </DropdownMenu.CheckboxItem>
        </DropdownMenu.Group>
    </DropdownMenu.Content>
</DropdownMenu.Root>
