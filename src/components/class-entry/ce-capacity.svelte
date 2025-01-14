<script lang="ts">
    import type { ClassEntry } from "@/library/class-entry/types";
    import { Badge } from "$lib/components/ui/badge";
    import type { Readable } from "svelte/store";

    export let data: Readable<Array<ClassEntry>>;
    export let uid: string;
    export let key: "waitlist" | "capacity";

    let thisClass: ClassEntry | undefined;
    $: thisClass = $data.find((c) => c.uid === uid);
</script>

{#if thisClass}
    <div class="flex gap-x-2 items-center h-5">
        <div class="h-full">
            <p>{thisClass[key].remaining}</p>
        </div>

        <Badge
            variant={thisClass[key].remaining <= 0 ? "secondary" : "outline"}
            class="text-xs justify-end font-normal"
        >
            <div class="inline-block relative -top-0.5">
                {thisClass[key].actual}
            </div>
            <div class="inline-block mx-0.5">/</div>
            <div class="inline-block relative top-0.5">
                {thisClass[key].total}
            </div>
        </Badge>
    </div>
{/if}
