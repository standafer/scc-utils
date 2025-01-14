<script lang="ts">
    import {
        readable,
        writable,
        type Readable,
        type Writable,
    } from "svelte/store";
    import {
        persist,
        createLocalStorage,
        type PersistentStore,
    } from "@macfja/svelte-persistent-store";
    import {
        createTable,
        Render,
        Subscribe,
        createRender,
        BodyRow,
    } from "svelte-headless-table";
    import {
        addPagination,
        addSortBy,
        addHiddenColumns,
    } from "svelte-headless-table/plugins";
    import { runComparison } from "@/library/filter-language/runner";
    import type {
        ClassEntry,
        FilterableClassEntry,
        RowAttribute,
    } from "@/library/class-entry/types";
    import type { CSTError, CSTNode } from "@/library/filter-language/cst";

    import * as Table from "@/components/ui/table";
    import { Button } from "@/components/ui/button";
    import * as DropdownMenu from "@/components/ui/dropdown-menu";
    import DataTableActions from "./ce-data-table-actions.svelte";
    import CePagination from "./ce-pagination.svelte";
    import CeSearch from "./ce-search.svelte";
    import CeCapacity from "./ce-capacity.svelte";

    import ChevronUp from "~icons/material-symbols/keyboard-arrow-up?raw&width=100%25&height=100%25";
    import ChevronDown from "~icons/material-symbols/keyboard-arrow-down?raw&width=100%25&height=100%25";
    import Eye from "~icons/material-symbols/visibility?raw&width=100%25&height=100%25";
    import Bug from "~icons/material-symbols/bug-report?raw&width=100%25&height=100%25";
    import CeDataTableControls from "./ce-data-table-controls.svelte";
    import { slide } from "svelte/transition";
    import CeSchedule from "./ce-schedule.svelte";
    import CeType from "./ce-type.svelte";

    export let data: Readable<ClassEntry[]>;
    export let filteredData: Writable<ClassEntry[]> = writable([]);

    export const rowAttributes = persist<Record<string, RowAttribute>>(
        writable({}),
        createLocalStorage(),
        "row-attributes",
    );

    function updateRowAttribute(uid: string, attribute: Partial<RowAttribute>) {
        rowAttributes.update((attrs) => {
            const current = attrs[uid] || { expanded: false, selected: false };
            const updated = { ...current, ...attribute };

            if (!updated.expanded && !updated.selected) {
                delete attrs[uid];
            } else {
                attrs[uid] = updated;
            }

            return attrs;
        });
    }

    function getFilterableClassEntry(
        classEntry: ClassEntry,
    ): FilterableClassEntry {
        const attributes = $rowAttributes[classEntry.uid] || {
            expanded: false,
            selected: false,
        };
        return { ...classEntry, ...attributes };
    }
    export let filterValue: PersistentStore<string>;
    const parseValue = writable<{
        root: CSTNode | null;
        errors: CSTError[];
    }>();
    $: $filteredData = $parseValue?.root
        ? $data.filter((entry) =>
              runComparison(
                  getFilterableClassEntry(entry),
                  $parseValue.root as CSTNode,
              ),
          )
        : $data;

    const headlessTable = createTable(filteredData, {
        page: addPagination(),
        sort: addSortBy({ disableMultiSort: true }),
        hide: addHiddenColumns(),
    });

    const columns = createColumns(headlessTable);

    const {
        headerRows,
        pageRows,
        tableAttrs,
        tableBodyAttrs,
        pluginStates,
        flatColumns,
        rows,
    } = headlessTable.createViewModel(columns);

    const { pageIndex, pageSize } = pluginStates.page;
    const { hiddenColumnIds } = pluginStates.hide;

    const actionSettings = persist(
        writable({
            includeSelfInFilter: false,
        }),
        createLocalStorage(),
        "action-settings",
    );

    const pageSizes = [5, 10, 20, 50, 100];
    const pageSizeIndex = persist(
        writable("0"),
        createLocalStorage(),
        "page-size-index",
    );
    $: $pageSize = pageSizes[$pageSizeIndex] || pageSizes[0]!;

    const ids = flatColumns.map((col) => col.id);
    const hideForId = persist(
        writable(Object.fromEntries(ids.map((id) => [id, true]))),
        createLocalStorage(),
        "hidden-columns-state",
    );

    $: {
        pluginStates.hide.hiddenColumnIds.set($hiddenColumnIds);
        $hiddenColumnIds = Object.entries($hideForId)
            .filter(([key, hide]) => !hide && key !== "debug")
            .map(([id]) => id);
    }
    $: debug = $hideForId["debug"];

    const hidableColumns = [
        "title",
        "campus",
        "credit",
        "subject",
        "course",
        "section",
        "capacity",
        "waitlist",
    ];
    $: hidableFlatColumns = flatColumns.filter((col) =>
        hidableColumns.includes(col.id),
    );

    function createColumns(table: typeof headlessTable) {
        return table.createColumns([
            createCheckboxColumn(table),
            createDataColumn(table, "crn", "CRN"),
            createDataColumn(table, "title", "Title"),
            createTypeColumn(table),
            createDataColumn(table, "subject", "Subject"),
            createDataColumn(table, "course", "Course"),
            createDataColumn(table, "campus", "Campus"),
            createDataColumn(table, "credit", "Credit"),
            createCapacityColumn(table, "capacity", "Capacity"),
            createCapacityColumn(table, "waitlist", "Waitlist"),
            createDataColumn(table, "section", "Section"),
            createActionsColumn(table),
        ]);
    }

    function createCheckboxColumn(table: typeof headlessTable) {
        return table.column({
            accessor: "uid",
            header: "",
            cell: ({ value: uid }) => {
                const selected = writable(
                    $rowAttributes[uid]?.selected || false,
                );
                const expanded = writable(
                    $rowAttributes[uid]?.expanded || false,
                );

                selected.subscribe((isSelected) =>
                    updateRowAttribute(uid, { selected: isSelected }),
                );
                expanded.subscribe((isExpanded) =>
                    updateRowAttribute(uid, { expanded: isExpanded }),
                );

                rowAttributes.subscribe((attrs) => {
                    selected.set(attrs[uid]?.selected || false);
                    expanded.set(attrs[uid]?.expanded || false);
                });

                return createRender(CeDataTableControls, {
                    selected,
                    expanded,
                });
            },
            plugins: {
                sort: {
                    compareFn: ({ remaining: lr }, { remaining: rr }) =>
                        lr - rr,
                },
            },
        });
    }

    function getUidFromRow(row: BodyRow<ClassEntry>): string {
        if ("original" in row) {
            return (row.original as ClassEntry).uid;
        }
        throw new Error("Row does not contain original property");
    }

    function createDataColumn(
        table: typeof headlessTable,
        accessor: keyof ClassEntry,
        header: string,
    ) {
        return table.column({ accessor, header });
    }

    function createCapacityColumn(
        table: typeof headlessTable,
        accessor: "capacity" | "waitlist",
        header: string,
    ) {
        return table.column({
            accessor,
            header,
            cell: (one) => {
                const uid = getUidFromRow(one.row);
                return createRender(CeCapacity, {
                    data,
                    uid,
                    key: accessor,
                });
            },
            plugins: {
                sort: {
                    compareFn: ({ remaining: lr }, { remaining: rr }) =>
                        lr - rr,
                },
            },
        });
    }

    function createActionsColumn(table: typeof headlessTable) {
        return table.column({
            accessor: ({ uid }) => uid,
            header: "",
            cell: ({ value }) =>
                createRender(DataTableActions, {
                    data,
                    uid: value,
                    settings: actionSettings,
                    onEditFilter: (filter) => {
                        filterValue.set(filter);
                    },
                }),
            plugins: { sort: { disable: true } },
        });
    }

    function createTypeColumn(table: typeof headlessTable) {
        return table.column({
            accessor: "type",
            header: "Type",
            cell: ({ value }) => createRender(CeType, { value }),
        });
    }
</script>

<div {...$$restProps}>
    <div class="flex items-start pb-4">
        <CeSearch
            bind:parseResult={$parseValue}
            bind:value={$filterValue}
            {debug}
        />
        <DropdownMenu.Root closeOnItemClick={false}>
            <DropdownMenu.Trigger asChild let:builder>
                <Button variant="outline" class="ml-auto" builders={[builder]}>
                    <p>
                        <span
                            class:text-destructive={$hiddenColumnIds.length > 0}
                        >
                            {$hiddenColumnIds.length}
                        </span>
                        column{$hiddenColumnIds.length == 1 ? "" : "s"} hidden
                    </p>
                    <span class="ml-2 h-4 w-4">{@html ChevronDown}</span>
                </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
                {#each hidableFlatColumns as col}
                    <DropdownMenu.CheckboxItem
                        bind:checked={$hideForId[col.id]}
                    >
                        <span class="w-[100%]" slot="indicator"
                            >{@html Eye}</span
                        >
                        {col.header}
                    </DropdownMenu.CheckboxItem>
                {/each}
                <DropdownMenu.Separator />
                <DropdownMenu.CheckboxItem bind:checked={$hideForId["debug"]}>
                    <span class="w-[100%]" slot="indicator">{@html Bug}</span>
                    Debug
                </DropdownMenu.CheckboxItem>
            </DropdownMenu.Content>
        </DropdownMenu.Root>
    </div>
    <div class="rounded-md border">
        <Table.Root {...$tableAttrs}>
            <Table.Header>
                {#each $headerRows as headerRow}
                    <Subscribe rowAttrs={headerRow.attrs()}>
                        <Table.Row>
                            {#each headerRow.cells as cell (cell.id)}
                                <Subscribe
                                    attrs={cell.attrs()}
                                    let:attrs
                                    props={cell.props()}
                                    let:props
                                >
                                    <Table.Head
                                        {...attrs}
                                        class="[&:has([role=checkbox])]:pl-3 p-1"
                                    >
                                        {#if !props.sort.disabled}
                                            <Button
                                                variant="ghost"
                                                class="p-0"
                                                on:click={props.sort.toggle}
                                            >
                                                <Render of={cell.render()} />
                                                <span class="ml-2 h-4 w-4">
                                                    {#if props.sort.order === "desc"}
                                                        {@html ChevronUp}
                                                    {:else if props.sort.order === "asc"}
                                                        {@html ChevronDown}
                                                    {/if}
                                                </span>
                                            </Button>
                                        {:else}
                                            <Render of={cell.render()} />
                                        {/if}
                                    </Table.Head>
                                </Subscribe>
                            {/each}
                        </Table.Row>
                    </Subscribe>
                {/each}
            </Table.Header>
            <Table.Body {...$tableBodyAttrs}>
                {#each $pageRows as row (row.id)}
                    <Subscribe rowAttrs={row.attrs()} let:rowAttrs>
                        <Table.Row
                            {...rowAttrs}
                            data-state={$rowAttributes[getUidFromRow(row)]
                                ?.selected == true
                                ? "selected"
                                : ""}
                        >
                            {#each row.cells as cell (cell.id)}
                                <Subscribe attrs={cell.attrs()} let:attrs>
                                    <Table.Cell
                                        {...attrs}
                                        class="[&:has([role=checkbox])]:pl-3 p-1"
                                    >
                                        <Render of={cell.render()} />
                                    </Table.Cell>
                                </Subscribe>
                            {/each}
                        </Table.Row>
                        {#if $rowAttributes[getUidFromRow(row)]?.expanded == true}
                            <Table.Row
                                class="p-0 m-0 bg-muted/50 hover:bg-muted/50"
                            >
                                <Table.Cell
                                    colspan={flatColumns.length}
                                    class="p-0 m-0"
                                >
                                    <div class="p-4" transition:slide>
                                        <CeSchedule
                                            data={readable([row.original])}
                                        />
                                    </div>
                                </Table.Cell>
                            </Table.Row>
                        {/if}
                    </Subscribe>
                {/each}
            </Table.Body>
        </Table.Root>
    </div>
    <div class="flex items-center justify-between py-4">
        <div class="flex-1 flex items-center gap-4">
            <p class="text-sm text-muted-foreground">
                {Object.values($rowAttributes).filter((item) => item.selected)
                    .length} of {$rows.length} rows selected.
            </p>
            <Button
                variant="ghost"
                on:click={() => {
                    rowAttributes.set({});
                }}
            >
                Clear Selection
            </Button>
        </div>

        <div class="flex items-center gap-2">
            <CePagination
                count={$rows.length}
                {pageSizes}
                {pageSizeIndex}
                onPageChange={(page) => ($pageIndex = page - 1)}
            />
            <Button
                variant="ghost"
                on:click={() => {
                    filterValue.set("");
                }}
            >
                Clear Filter
            </Button>
        </div>
    </div>
</div>
