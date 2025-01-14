<script lang="ts">
    import { CEDayOfWeek } from "@/library/class-entry/html-parser/constants";
    import {
        ScheduleEntryTimeType,
        type ClassEntry,
        type ScheduleAndClassEntry,
    } from "@/library/class-entry/types";
    import { DateTime, Interval } from "luxon";
    import { convertDayOfWeekToForm } from "@/library/class-entry/html-parser/utils/day-of-week-utils";
    import { Button } from "@/components/ui/button";
    import { writable, type Readable } from "svelte/store";
    import ChevronRight from "~icons/material-symbols/keyboard-arrow-right?raw&width=100%25&height=100%25";
    import * as Collapsible from "@/components/ui/collapsible";

    import CeScheduleRangedEntry from "./ce-schedule-ranged-entry.svelte";
    import { Badge } from "../ui/badge";
    import * as Tooltip from "../ui/tooltip";
    import CeHoverContent from "./ce-hover-content.svelte";
    import { slide } from "svelte/transition";
    import Separator from "../ui/separator/separator.svelte";
    import type { PersistentStore } from "@macfja/svelte-persistent-store";
    import CeScheduleSettings from "./ce-schedule-settings.svelte";

    export let schedulerFilterSettings: PersistentStore<{
        includeWaitlist: boolean;
        discludeSelf: boolean;
    }>;
    export let data: Readable<Array<ClassEntry>>;
    export let height = 200;
    export let timingConflictsConfig: {
        checkConflicts: boolean;
        onDeselect: (uid: string) => void;
        onChangeFilter: (filter: string) => void;
    } = {
        checkConflicts: false,
        onDeselect: () => {},
        onChangeFilter: () => {},
    };

    function getFilter(classEntry: ClassEntry) {
        // const capacityChecker =
        //     ? "(capacity.remaining:> 0 or waitlist.remaining:> 0)"
        //     : "capacity.remaining:> 0";
        let query = `subject:= "${classEntry.subject}" and course:= "${classEntry.course}"`;
        if ($schedulerFilterSettings.includeWaitlist) {
            query += ` and (capacity.remaining:> 0 or waitlist.remaining:> 0)`;
        } else {
            query += ` and capacity.remaining:> 0`;
        }
        if ($schedulerFilterSettings.discludeSelf) {
            query += ` and not crn:= ${classEntry.crn}`;
        }
        return query;
    }

    const populateWeekdaySchedules = (data: Array<ClassEntry>) => {
        const weekdaySchedules: Record<
            (typeof CEDayOfWeek)[keyof typeof CEDayOfWeek],
            {
                rangeEntries: ScheduleAndClassEntry[];
                labelEntries: ScheduleAndClassEntry[];
            }
        > = {
            [CEDayOfWeek.Sunday]: { rangeEntries: [], labelEntries: [] },
            [CEDayOfWeek.Monday]: { rangeEntries: [], labelEntries: [] },
            [CEDayOfWeek.Tuesday]: { rangeEntries: [], labelEntries: [] },
            [CEDayOfWeek.Wednesday]: { rangeEntries: [], labelEntries: [] },
            [CEDayOfWeek.Thursday]: { rangeEntries: [], labelEntries: [] },
            [CEDayOfWeek.Friday]: { rangeEntries: [], labelEntries: [] },
            [CEDayOfWeek.Saturday]: { rangeEntries: [], labelEntries: [] },
        };

        data.forEach((classEntry) => {
            classEntry.schedule.forEach((scheduleEntry) => {
                scheduleEntry.days.forEach((day) => {
                    if (scheduleEntry.time.type === "label") {
                        weekdaySchedules[day].labelEntries.push({
                            scheduleEntry,
                            classEntry,
                        });
                    } else if (scheduleEntry.time.type === "range") {
                        weekdaySchedules[day].rangeEntries.push({
                            scheduleEntry,
                            classEntry,
                        });
                    }
                });
            });
        });

        return weekdaySchedules;
    };

    // Update the createWeekdayScheduleArray function
    const createWeekdayScheduleArray = (
        weekdaySchedules: Record<
            (typeof CEDayOfWeek)[keyof typeof CEDayOfWeek],
            {
                rangeEntries: ScheduleAndClassEntry[];
                labelEntries: ScheduleAndClassEntry[];
            }
        >,
    ) => {
        return Object.entries(weekdaySchedules).map(
            ([day, { rangeEntries, labelEntries }]) => ({
                day: day as (typeof CEDayOfWeek)[keyof typeof CEDayOfWeek],
                rangeEntries,
                labelEntries,
            }),
        );
    };

    // Update the reactive statements
    $: weekdayScheduleArray = createWeekdayScheduleArray(
        populateWeekdaySchedules($data),
    );

    const sortedWeekdays = [
        CEDayOfWeek.Sunday,
        CEDayOfWeek.Monday,
        CEDayOfWeek.Tuesday,
        CEDayOfWeek.Wednesday,
        CEDayOfWeek.Thursday,
        CEDayOfWeek.Friday,
        CEDayOfWeek.Saturday,
    ];

    let sortedWeekdayScheduleArray: Array<{
        day: (typeof CEDayOfWeek)[keyof typeof CEDayOfWeek];
        rangeEntries: ScheduleAndClassEntry[];
        labelEntries: ScheduleAndClassEntry[];
    }> = [];

    $: {
        sortedWeekdayScheduleArray = sortedWeekdays.map((day) => {
            const travelTimes: Array<ScheduleAndClassEntry> = [];
            const found = weekdayScheduleArray.find((ws) => ws.day === day) || {
                day,
                rangeEntries: [],
                labelEntries: [],
            };

            found.rangeEntries.sort((a, b) => {
                if (
                    a.scheduleEntry.time.type === ScheduleEntryTimeType.Range &&
                    b.scheduleEntry.time.type === ScheduleEntryTimeType.Range
                ) {
                    if (
                        !a.scheduleEntry.time.interval.start ||
                        !b.scheduleEntry.time.interval.start
                    ) {
                        return 0;
                    }

                    return (
                        a.scheduleEntry.time.interval.start.toMillis() -
                        b.scheduleEntry.time.interval.start.toMillis()
                    );
                }

                return 0;
            });

            for (let i = 0; i < found.rangeEntries.length - 1; i++) {
                const a = found.rangeEntries[i];
                const b = found.rangeEntries[i + 1];
                if (!a || !b) break;

                const { classEntry: aClass, scheduleEntry: aSchedule } = a;
                const { classEntry: bClass, scheduleEntry: bSchedule } = b;

                const TRAVEL_TIME = [
                    { from: "M", to: "VV", time: 30 },
                    { from: "M", to: "VJO", time: 60 },
                    { from: "M", to: "M", time: 0 },
                    { from: "VJO", to: "VV", time: 60 },
                    { from: "VJO", to: "M", time: 30 },
                    { from: "VJO", to: "VJO", time: 0 },
                    { from: "VV", to: "M", time: 30 },
                    { from: "VV", to: "VJO", time: 60 },
                    { from: "VV", to: "VV", time: 0 },
                ];

                const foundTravelTime = TRAVEL_TIME.find(
                    (time) =>
                        time.from == aClass.campus && time.to == bClass.campus,
                );
                if (
                    !foundTravelTime ||
                    foundTravelTime.time == 0 ||
                    aSchedule.time.type != ScheduleEntryTimeType.Range ||
                    bSchedule.time.type != ScheduleEntryTimeType.Range ||
                    !aSchedule.time.interval.end ||
                    !bSchedule.time.interval.start
                )
                    continue;

                travelTimes.push({
                    classEntry: {
                        ...aClass,
                        displayOverride: `TRAVEL ${foundTravelTime.from} -> ${foundTravelTime.to}`,
                    },
                    scheduleEntry: {
                        ...a.scheduleEntry,
                        uid: `${a.scheduleEntry.uid}-travel`,
                        time: {
                            type: ScheduleEntryTimeType.Range,
                            interval: Interval.fromDateTimes(
                                aSchedule.time.interval.end,
                                aSchedule.time.interval.end.plus({
                                    minutes: foundTravelTime.time,
                                }),
                            ),
                        },
                    },
                });
            }

            travelTimes.forEach((travelTime) =>
                found.rangeEntries.push(travelTime),
            );

            return found;
        });
    }

    // Find the earliest start time and latest end time across all schedules
    let earliestStart = writable(DateTime.fromObject({ hour: 23, minute: 59 }));
    let latestEnd = writable(DateTime.fromObject({ hour: 0, minute: 0 }));

    $: {
        let newEarliestStart = { hour: 23, minute: 59 };
        let newLatestEnd = { hour: 0, minute: 0 };

        sortedWeekdayScheduleArray.forEach(({ rangeEntries }) => {
            rangeEntries.forEach(({ scheduleEntry: entry }) => {
                if (entry.time.type === "range") {
                    if (
                        !entry.time.interval.start ||
                        !entry.time.interval.end
                    ) {
                        return;
                    }

                    const startTime = {
                        hour: entry.time.interval.start.hour,
                        minute: entry.time.interval.start.minute,
                    };

                    const endTime = {
                        hour: entry.time.interval.end.hour,
                        minute: entry.time.interval.end.minute,
                    };

                    console.log(startTime, endTime);

                    if (isEarlier(startTime, newEarliestStart)) {
                        newEarliestStart = startTime;
                    }

                    if (isLater(endTime, newLatestEnd)) {
                        newLatestEnd = endTime;
                    }
                }
            });
        });

        earliestStart.set(DateTime.fromObject(newEarliestStart));
        latestEnd.set(DateTime.fromObject(newLatestEnd));
    }

    type TimeLike = { hour: number; minute: number };

    function isEarlier(time1: TimeLike, time2: TimeLike) {
        return (
            time1.hour < time2.hour ||
            (time1.hour === time2.hour && time1.minute < time2.minute)
        );
    }

    function isLater(time1: TimeLike, time2: TimeLike) {
        return (
            time1.hour > time2.hour ||
            (time1.hour === time2.hour && time1.minute > time2.minute)
        );
    }

    function detectConflicts(
        weekdayScheduleArray: Array<{
            day: (typeof CEDayOfWeek)[keyof typeof CEDayOfWeek];
            rangeEntries: Array<ScheduleAndClassEntry>;
        }>,
    ) {
        const conflicts: Array<{
            day: (typeof CEDayOfWeek)[keyof typeof CEDayOfWeek];
            conflictingEntries: [ScheduleAndClassEntry, ScheduleAndClassEntry];
            conflictingTimes: {
                start: DateTime;
                end: DateTime;
            };
        }> = [];

        weekdayScheduleArray.forEach(({ day, rangeEntries }) => {
            for (let i = 0; i < rangeEntries.length; i++) {
                for (let j = i + 1; j < rangeEntries.length; j++) {
                    const entry1 = rangeEntries[i] as ScheduleAndClassEntry;
                    const entry2 = rangeEntries[j] as ScheduleAndClassEntry;

                    if (
                        entry1.scheduleEntry.time.type === "range" &&
                        entry2.scheduleEntry.time.type === "range"
                    ) {
                        const start1 =
                            entry1.scheduleEntry.time.interval.start!;
                        const end1 = entry1.scheduleEntry.time.interval.end!;
                        const start2 =
                            entry2.scheduleEntry.time.interval.start!;
                        const end2 = entry2.scheduleEntry.time.interval.end!;

                        if (
                            (start1 <= start2 && start2 < end1) ||
                            (start1 < end2 && end2 <= end1) ||
                            (start2 <= start1 && start1 < end2) ||
                            (start2 < end1 && end1 <= end2)
                        ) {
                            conflicts.push({
                                day,
                                conflictingEntries: [entry1, entry2],
                                conflictingTimes: {
                                    start: DateTime.max(start1, start2),
                                    end: DateTime.min(end1, end2),
                                },
                            });
                        }
                    }
                }
            }
        });

        return conflicts;
    }

    let totalMinutes = writable(0);
    $: {
        totalMinutes.set($latestEnd.diff($earliestStart, "minutes").minutes);
    }
    $: conflicts =
        timingConflictsConfig.checkConflicts &&
        detectConflicts(sortedWeekdayScheduleArray);

    function parseDate(end: any, arg1: string, arg2: Date): any {
        throw new Error("Function not implemented.");
    }
</script>

<div class="w-full">
    <div class="flex items-center justify-between gap-2 mb">
        <div class="flex items-center justify-between gap-2">
            {$earliestStart.toLocaleString(DateTime.TIME_SIMPLE)} earliest
            <div class="h-4 w-4">
                {@html ChevronRight}
            </div>
            {$latestEnd.toLocaleString(DateTime.TIME_SIMPLE)} latest
        </div>
        <div class="flex justify-end">
            <CeScheduleSettings {schedulerFilterSettings} />
        </div>
    </div>
    {#if timingConflictsConfig.checkConflicts && conflicts && conflicts.length > 0}
        <div class="flex flex-col space-y-2 py-2" transition:slide>
            <Collapsible.Root>
                <Collapsible.Trigger asChild let:builder>
                    <Button variant="ghost" builders={[builder]}>
                        There {conflicts.length === 1 ? "is" : "are"}{" "}
                        <Badge variant="destructive" class="mx-1 text-xs">
                            {conflicts.length}
                        </Badge>
                        timing conflict{conflicts.length === 1 ? "" : "s"}
                    </Button>
                </Collapsible.Trigger>
                <Collapsible.Content>
                    {#each conflicts as { day, conflictingTimes, conflictingEntries }}
                        <div transition:slide class="w-full">
                            <h4 class="text-md text-destructive">
                                {convertDayOfWeekToForm(day, "long")} has a timing
                                conflict between {conflictingTimes.start.toLocaleString(
                                    DateTime.TIME_SIMPLE,
                                )} and {conflictingTimes.end.toLocaleString(
                                    DateTime.TIME_SIMPLE,
                                )}. ({conflictingTimes.end.diff(
                                    conflictingTimes.start,
                                    "minutes",
                                ).minutes} minutes of overlap)
                            </h4>
                            <div class="grid grid-cols-2 gap-2 my-2 mb-4">
                                <CeHoverContent
                                    scheduleAndClassEntries={conflictingEntries}
                                />

                                <div class="flex flex-row gap-2">
                                    <Separator orientation="vertical" />

                                    <div class="grid grid-cols-2 gap-2">
                                        {#each conflictingEntries as { classEntry }}
                                            <Button
                                                variant="secondary"
                                                class="text-xs text-wrap"
                                                on:click={() =>
                                                    timingConflictsConfig.onChangeFilter(
                                                        getFilter(classEntry),
                                                    )}
                                            >
                                                Filter {classEntry.subject}
                                                {classEntry.course} for alternatives
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                class="text-xs text-wrap"
                                                on:click={() =>
                                                    timingConflictsConfig.onDeselect(
                                                        classEntry.uid,
                                                    )}
                                            >
                                                Remove {classEntry.subject}
                                                {classEntry.course}
                                            </Button>
                                        {/each}
                                    </div>
                                </div>
                            </div>
                        </div>
                    {/each}
                </Collapsible.Content>
            </Collapsible.Root>
        </div>
    {/if}
    <div class="grid grid-cols-7 gap-2 py-4">
        {#each sortedWeekdayScheduleArray as { day, labelEntries }}
            <div class="flex items-center justify-center gap-2">
                {convertDayOfWeekToForm(day, "short")}
                {#if labelEntries.length > 0}
                    <Tooltip.Root openDelay={50} closeDelay={0}>
                        <Tooltip.Trigger>
                            <Badge variant="secondary" class="text-xs">
                                {labelEntries.length}
                            </Badge>
                        </Tooltip.Trigger>
                        <Tooltip.Content>
                            <CeHoverContent
                                scheduleAndClassEntries={labelEntries}
                            />
                        </Tooltip.Content>
                    </Tooltip.Root>
                {/if}
            </div>
        {/each}
    </div>

    <div class="grid grid-cols-7 gap-2" style="height: {height}px">
        {#each sortedWeekdayScheduleArray as { rangeEntries }}
            <div class="relative h-full">
                {#each rangeEntries as { scheduleEntry, classEntry } (scheduleEntry.uid)}
                    <Tooltip.Root openDelay={50} closeDelay={0}>
                        <Tooltip.Trigger asChild let:builder>
                            <CeScheduleRangedEntry
                                {classEntry}
                                {scheduleEntry}
                                {earliestStart}
                                {latestEnd}
                                on:click={() => {
                                    timingConflictsConfig.onChangeFilter(
                                        getFilter(classEntry),
                                    );
                                }}
                                builders={[builder]}
                            />
                        </Tooltip.Trigger>
                        <Tooltip.Content class="pointer-events-none">
                            <CeHoverContent
                                scheduleAndClassEntries={[
                                    {
                                        scheduleEntry,
                                        classEntry,
                                    },
                                ]}
                            />
                        </Tooltip.Content>
                    </Tooltip.Root>
                {/each}
            </div>
        {/each}
    </div>
</div>
