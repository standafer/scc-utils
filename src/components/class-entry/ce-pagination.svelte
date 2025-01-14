<script lang="ts">
    import * as Pagination from "@/components/ui/pagination";
    import * as Popover from "@/components/ui/popover";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
    import { Button } from "@/components/ui/button";
    import { Input } from "@/components/ui/input";
    import ChevronLeft from "~icons/material-symbols/keyboard-arrow-left?raw&width=100%25&height=100%25";
    import ChevronDown from "~icons/material-symbols/keyboard-arrow-down?raw&width=100%25&height=100%25";
    import ChevronRight from "~icons/material-symbols/keyboard-arrow-right?raw&width=100%25&height=100%25";

    export let count: number;
    export let pageSizes: Array<number>;
    export let pageSizeIndex;
    export let onPageChange: (page: number) => void;

    $: totalPages = Math.ceil(count / pageSize);
    $: pageSize = pageSizes[+$pageSizeIndex] || 5;

    const pageSizeOptions = [5, 10, 20, 50, 100];

    let currentPage = 1;
    let inputPage = "";

    $: {
        if (currentPage > totalPages) {
            currentPage = Math.max(1, totalPages);
            onPageChange(currentPage);
        }
    }

    function handleInputPageChange() {
        const pageNumber = parseInt(inputPage, 10);
        if (pageNumber > 0 && pageNumber <= totalPages) {
            currentPage = pageNumber;
            onPageChange(pageNumber);
            inputPage = "";
        }
    }
</script>

<Pagination.Root
    {count}
    perPage={pageSize}
    siblingCount={1}
    onPageChange={(page) => {
        currentPage = page;
        onPageChange(page);
    }}
    let:pages
    page={currentPage}
>
    <Pagination.Content>
        <Pagination.Item>
            <Pagination.PrevButton>
                <span class="h-4 w-4">
                    {@html ChevronLeft}
                </span>
                <span class="hidden sm:block">Previous</span>
            </Pagination.PrevButton>
        </Pagination.Item>
        {#each pages as page (page.key)}
            {#if page.type === "ellipsis"}
                <Pagination.Item>
                    <Popover.Root>
                        <Popover.Trigger>
                            <Button variant="ghost" class="p-0">
                                <Pagination.Ellipsis />
                            </Button>
                        </Popover.Trigger>
                        <Popover.Content class="p-2">
                            <form
                                on:submit|preventDefault={handleInputPageChange}
                            >
                                <Input
                                    type="number"
                                    placeholder="Go to page"
                                    bind:value={inputPage}
                                    min="1"
                                    max={totalPages}
                                />
                                <Button type="submit" class="mt-2 w-full"
                                    >Go</Button
                                >
                            </form>
                        </Popover.Content>
                    </Popover.Root>
                </Pagination.Item>
            {:else}
                <Pagination.Item>
                    <Pagination.Link
                        {page}
                        isActive={currentPage === page.value}
                    >
                        {page.value}
                    </Pagination.Link>
                </Pagination.Item>
            {/if}
        {/each}
        <Pagination.Item>
            <Pagination.NextButton>
                <span class="hidden sm:block">Next</span>
                <span class="h-4 w-4">
                    {@html ChevronRight}
                </span>
            </Pagination.NextButton>
        </Pagination.Item>
    </Pagination.Content>
</Pagination.Root>

<DropdownMenu.Root>
    <DropdownMenu.Trigger asChild let:builder>
        <Button variant="outline" class="ml-auto" builders={[builder]}>
            <p>
                {pageSize} per page
            </p>
            <span class="ml-2 h-4 w-4">
                {@html ChevronDown}
            </span>
        </Button>
    </DropdownMenu.Trigger>
    <DropdownMenu.Content>
        <!-- {#each hidableFlatColumns as col}
            <DropdownMenu.CheckboxItem bind:checked={$hideForId[col.id]}>
                <span class="w-[100%]" slot="indicator">
                    {@html Eye}
                </span>
                {col.header}
            </DropdownMenu.CheckboxItem>
        {/each} -->
        <DropdownMenu.RadioGroup bind:value={$pageSizeIndex}>
            {#each pageSizeOptions as size, index}
                <DropdownMenu.RadioItem value={index.toString()}>
                    {size} per page
                </DropdownMenu.RadioItem>
            {/each}
        </DropdownMenu.RadioGroup>
    </DropdownMenu.Content>
</DropdownMenu.Root>
