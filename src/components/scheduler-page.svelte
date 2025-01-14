<script lang="ts">
    import {
        persist,
        createLocalStorage,
        type PersistentStore,
    } from "@macfja/svelte-persistent-store";
    import Dropzone from "svelte-file-dropzone";
    import { toast } from "svelte-sonner";

    import * as Collapsible from "@/components/ui/collapsible";
    import Expand from "~icons/material-symbols/expand-all?raw&width=100%25&height=100%25";
    import HTML from "~icons/material-symbols/html?raw&width=100%25&height=100%25";
    import OutwardIcon from "./outward-icon.svelte";

    import { Button } from "@/components/ui/button";
    import { Separator } from "@/components/ui/separator";
    import * as Tooltip from "@/components/ui/tooltip";

    import {
        type ClassEntry,
        type RowAttribute,
    } from "@/library/class-entry/types";
    import { parse } from "@/library/class-entry/html-parser";
    import { serialize, deserialize } from "@/library/class-entry/serializer";
    import { derived, writable } from "svelte/store";
    import CeDataTable from "./class-entry/ce-data-table.svelte";
    import DynamicContainer from "./dynamic-container.svelte";
    import CeSchedule from "./class-entry/ce-schedule.svelte";

    let rowAttributes: PersistentStore<Record<string, RowAttribute>>;
    let innerWidth = 0;

    let dropzoneProps = {
        disableDefaultStyles: true,
        accept: [".html"],
        multiple: false,
    };

    let persistedClassEntries = persist(
        writable<string>("[]"),
        createLocalStorage(),
        "class-entries",
    );

    let filterValue = persist(
        writable<string>(""),
        createLocalStorage(),
        "filter",
    );

    let schedulerFilterSettings = persist(
        writable<{
            includeWaitlist: boolean;
            discludeSelf: boolean;
        }>({
            includeWaitlist: false,
            discludeSelf: false,
        }),
        createLocalStorage(),
        "scheduler-filter-settings",
    );

    let classEntries = derived(persistedClassEntries, (entries) => {
        return deserialize(entries);
    });

    function handleFilesSelect(e: {
        detail: { acceptedFiles: any; fileRejections: any };
    }) {
        const { acceptedFiles, fileRejections } = e.detail;

        if (fileRejections.length > 1) {
            toast.error(`Please enter only one file at a time.`);
        } else if (fileRejections.length === 1) {
            toast.error(`Please enter only HTML files.`);
        }

        const [acceptedFile] = acceptedFiles;

        const reader = new FileReader();
        reader.onload = (e) => {
            const html = e.target?.result as string;
            let parsed: Array<ClassEntry> = [];
            try {
                toast.info(`File loaded. Parsing...`);
                const start = performance.now();
                parsed = parse(html);
                if (parsed.length < 100) {
                    toast.warning(
                        `Parsing completed successfully, however, only ${parsed.length} class entries were found. This seems too low. Please check the file and try again.`,
                    );
                } else {
                    toast.success(
                        `Successfully parsed ${parsed.length} class entries in ${(
                            performance.now() - start
                        ).toFixed(0)}ms`,
                    );
                }

                const serialized = serialize(parsed);
                persistedClassEntries.set(serialized);
            } catch (err) {
                toast.error(
                    `An error occurred while parsing the file. Please check the file and try again. ${err}`,
                );
            }
        };
        reader.readAsText(acceptedFile);
    }

    function mapRowAttributesToSelectedClassEntries(
        entries: Array<ClassEntry>,
        rowAttributes: Record<string, RowAttribute>,
    ): Array<ClassEntry> {
        return entries.filter((entry) => {
            const rowAttribute = rowAttributes[entry.uid];
            return rowAttribute?.selected;
        });
    }

    let selectedClassEntries = writable<Array<ClassEntry>>([]);
    $: {
        if (rowAttributes) {
            selectedClassEntries.set(
                mapRowAttributesToSelectedClassEntries(
                    $classEntries,
                    $rowAttributes,
                ),
            );
        }
    }
</script>

<svelte:window bind:innerWidth />

<div class="flex flex-col w-full">
    <h4 class="flex items-center justify-start space-x-2 text-base">
        <span class="font-bold">All data stays local on this browser.</span>
        <span>Please watch</span>
        <Tooltip.Root openDelay={0}>
            <Tooltip.Trigger>
                <Button
                    href="https://www.youtube.com/watch?v=idA7ymO2aDo"
                    target="_blank"
                    className="flex items-center"
                >
                    <span class="">the tutorial</span>
                    <OutwardIcon className="h-4 w-4" />
                </Button>
            </Tooltip.Trigger>
            <Tooltip.Content>
                <p>This is an external link to YouTube</p>
            </Tooltip.Content>
        </Tooltip.Root>
        <span>before entering files</span>
    </h4>
    <Collapsible.Root class="w-full space-y-2 mt-4">
        <div class="flex items-center justify-between space-x-4 px-4">
            <Collapsible.Trigger asChild let:builder>
                <Dropzone on:drop={handleFilesSelect} {...dropzoneProps}>
                    <Button variant="link">
                        <span class="h-[100%] mr-2">
                            {@html HTML}
                        </span>
                        <p>Click to select file</p>
                    </Button>
                </Dropzone>
                <Button variant="ghost" builders={[builder]}>
                    <span class="h-[100%]">
                        {@html Expand}
                    </span>
                    <span class="sr-only">Toggle</span>
                </Button>
            </Collapsible.Trigger>
        </div>

        <Collapsible.Content class="space-y-2">
            <Dropzone
                on:drop={handleFilesSelect}
                containerClasses="bg-secondary text-secondary-foreground hover:bg-secondary/80 w-full h-40 flex items-center justify-center rounded-md"
                {...dropzoneProps}
            >
                <p>... or drag 'n' drop here</p>
            </Dropzone>
        </Collapsible.Content>
    </Collapsible.Root>
    <Separator class="my-2" />

    <DynamicContainer>
        <div slot="panel1">
            <CeDataTable
                data={classEntries}
                bind:rowAttributes
                bind:filterValue
            />
        </div>
        <div slot="panel2">
            {#if $rowAttributes}
                <h4 class="text-lg font-bold">Your selected class entries</h4>
                <CeSchedule
                    {schedulerFilterSettings}
                    data={selectedClassEntries}
                    timingConflictsConfig={{
                        checkConflicts: true,
                        onDeselect: (uid) => {
                            rowAttributes.update((attrs) => {
                                const rowAttribute = attrs[uid];
                                if (rowAttribute) {
                                    rowAttribute.selected = false;
                                }
                                return attrs;
                            });
                        },
                        onChangeFilter: (filter) => {
                            filterValue.set(filter);
                        },
                    }}
                    height={400}
                />
            {/if}
        </div>
    </DynamicContainer>
</div>
