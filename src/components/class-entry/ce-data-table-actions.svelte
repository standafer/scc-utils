<script lang="ts">
    import Ellipsis from "lucide-svelte/icons/ellipsis";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
    import { Button } from "$lib/components/ui/button";
    import type { ClassEntry } from "@/library/class-entry/types";
    import type { Readable, Writable } from "svelte/store";

    export let data: Readable<Array<ClassEntry>>;
    export let uid: string;
    export let onEditFilter: (filter: string) => void;
    export let settings: Writable<{
        includeSelfInFilter: boolean;
    }>;

    let thisClass: ClassEntry | undefined;
    $: thisClass = $data.find((c) => c.uid === uid);

    function makeQuery(callback: (c: ClassEntry) => string): string {
        if (!thisClass) return "";

        if ($settings.includeSelfInFilter) {
            return `(${callback(thisClass)}) or (crn:= ${thisClass.crn})`;
        } else {
            return callback(thisClass);
        }
    }

    const filters = [
        {
            name: "Open sections",
            filter: () => {
                if (!thisClass) return;

                onEditFilter(
                    makeQuery(
                        (queryClass) =>
                            `subject:= "${queryClass.subject}" and course:= "${queryClass.course}" and capacity.remaining:> 0`,
                    ),
                );
            },
        },
        {
            name: "Available (open or waitlist)",
            filter: () => {
                if (!thisClass) return;

                onEditFilter(
                    makeQuery(
                        (queryClass) =>
                            `subject:= "${queryClass.subject}" and course:= "${queryClass.course}" and (capacity.remaining:> 0 or waitlist.remaining:> 0)`,
                    ),
                );
            },
        },
        {
            name: "All sections",
            filter: () => {
                if (!thisClass) return;

                onEditFilter(
                    makeQuery(
                        (queryClass) =>
                            `subject:= "${queryClass.subject}" and course:= "${queryClass.course}"`,
                    ),
                );
            },
        },
    ];
</script>

<DropdownMenu.Root closeOnItemClick={false}>
    <DropdownMenu.Trigger asChild let:builder>
        <Button
            variant="ghost"
            builders={[builder]}
            size="icon"
            class="relative h-8 w-8 p-0"
        >
            <span class="sr-only">Open menu</span>
            <Ellipsis class="h-4 w-4" />
        </Button>
    </DropdownMenu.Trigger>
    {#if thisClass}
        <DropdownMenu.Content>
            <DropdownMenu.Group>
                <DropdownMenu.Label>Filter</DropdownMenu.Label>
                {#each filters as { name, filter }}
                    <DropdownMenu.Item on:click={filter}
                        >{name}</DropdownMenu.Item
                    >
                {/each}
            </DropdownMenu.Group>
            <DropdownMenu.Separator />
            <DropdownMenu.Group>
                <DropdownMenu.CheckboxItem
                    bind:checked={$settings.includeSelfInFilter}
                >
                    Include self in filter
                </DropdownMenu.CheckboxItem>
            </DropdownMenu.Group>
        </DropdownMenu.Content>
    {/if}
</DropdownMenu.Root>
