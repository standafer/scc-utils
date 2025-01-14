<script lang="ts">
    import type { CSTNode } from "@/library/filter-language/cst";
    export let node: CSTNode;

    function getBlockColor(kind: string): string {
        switch (kind) {
            case "expressionOpen":
            case "expressionClose":
                return "bg-gray-200 dark:bg-gray-800";
            case "symbolAnd":
            case "symbolOr":
                return "bg-blue-400 dark:bg-blue-500";
            case "identifier":
                return "bg-yellow-400 dark:bg-yellow-500";
            case "string":
                return "bg-purple-400 dark:bg-purple-500";
            default:
                return "bg-gray-200 dark:bg-gray-800";
        }
    }

    const KIND_REPLACEMENTS: Record<string, string> = {
        ["symbolAnd"]: "AND",
        ["symbolOr"]: "OR",
        ["symbolFuzzyEquals"]: "Fuzzy Eq",
        ["symbolEquals"]: "Exact Eq",
        ["symbolNotEquals"]: "Not Exact Eq",
        ["symbolGreaterThan"]: "Greater Than",
        ["symbolLessThan"]: "Less Than",
        ["symbolGreaterThanOrEqual"]: "Less Than or Eq",
        ["symbolLessThanOrEqual"]: "Greater Than or Eq",
    };

    $: hasChildren = node && node.children && node.children.length > 0;
    $: isExpression =
        node.kind == "expressionOpen" || node.kind == "expressionClose";
    $: center = node.kind == "symbolAnd" || node.kind == "symbolOr";
</script>

{#if node}
    <div class="inline-flex flex-col" class:items-center={!center}>
        {#if isExpression}
            {#if node.kind == "expressionOpen"}
                <div class="flex items-stretch">
                    <div
                        class={`flex items-center px-2 py-1 rounded-l-md ${getBlockColor(
                            node.kind,
                        )}`}
                    >
                        <h2 class="text-sm font-medium">(</h2>
                    </div>
                    <div
                        class="flex items-start space-x-2 p-2 border-y-[1px] border-r-[1px] shadow-sm border-gray-200 dark:border-gray-800"
                    >
                        {#each node.children as child}
                            <svelte:self node={child} />
                        {/each}
                    </div>
                    <div
                        class={`flex items-center px-2 py-1 rounded-r-md ${getBlockColor(
                            node.kind,
                        )}`}
                    >
                        <h2 class="text-sm font-medium">)</h2>
                    </div>
                </div>
            {/if}
        {:else}
            <div
                class="flex items-center justify-center space-x-1 px-2 py-1 rounded-t-md {getBlockColor(
                    node.kind,
                )}"
                class:rounded-b-md={!hasChildren}
            >
                <h2 class="text-sm font-medium">
                    {KIND_REPLACEMENTS[node.kind] || node.kind}
                </h2>
                <h4 class="text-xs">
                    {node?.startIndex} - {node?.endIndex}
                </h4>
            </div>
            {#if hasChildren}
                <div
                    class="flex items-start rounded-b-md border-[1px] space-x-2 p-2 shadow-sm border-gray-200 dark:border-gray-800"
                    class:rounded-t-md={!center || isExpression}
                >
                    {#each node.children as child}
                        <svelte:self node={child} />
                    {/each}
                </div>
            {/if}
        {/if}
    </div>
{/if}
