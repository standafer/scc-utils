<script lang="ts">
    import { Input } from "@/components/ui/input";
    import { tokenize } from "@/library/filter-language/lexer";
    import { parse } from "@/library/filter-language/cst";
    import { slide } from "svelte/transition";
    import CSTNode from "./cst-node.svelte";

    export let value: string = "";
    export let parseResult: ReturnType<typeof parse>;
    export let debug: boolean = false;

    $: [tokens] = tokenize(value, null);
    $: parseResult = parse(tokens);
</script>

<div class="relative w-full pr-3">
    <div class="flex items-center justify-between">
        <Input
            class="w-full p-2"
            type="text"
            bind:value
            on:input
            placeholder="Filter"
        />
    </div>

    {#if debug}
        <div class="mt-4" transition:slide>
            {#if parseResult.root}
                <CSTNode node={parseResult.root} />
            {:else}
                <p class="text-muted-foreground">No parse tree available</p>
            {/if}
        </div>
    {/if}
    {#if parseResult.errors.length > 0}
        <div class="mt-4" transition:slide>
            <h3 class="text-sm text-muted-foreground font-semibold">
                FILTER SYNTAX ERRORS
            </h3>
            <ul class="list-disc list-inside">
                {#each parseResult.errors as error}
                    <li class="text-red-500">
                        {error.message} (at index {error.startIndex})
                    </li>
                {/each}
            </ul>
        </div>
    {/if}
</div>
