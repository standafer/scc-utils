<script lang="ts">
    import type {
        CEScheduleEntry,
        ClassEntry,
    } from "@/library/class-entry/types";
    import { DateTime } from "luxon";
    import { type Writable, derived } from "svelte/store";
    import { spring } from "svelte/motion";
    import { Button } from "@/components/ui/button";
    import { slide } from "svelte/transition";
    import type { Builder } from "bits-ui";

    export let builders: Array<Builder> = [];
    export let classEntry: ClassEntry;
    export let scheduleEntry: CEScheduleEntry;
    export let earliestStart: Writable<DateTime>;
    export let latestEnd: Writable<DateTime>;
    export let widthOffset: number = 0;

    // Calculate the total duration of the day in minutes
    const totalDayMinutes = derived(
        [earliestStart, latestEnd],
        ([$earliestStart, $latestEnd]) => {
            return $latestEnd.diff($earliestStart, "minutes").minutes;
        },
    );

    const entryPosition = derived(
        [earliestStart, latestEnd, totalDayMinutes],
        ([$earliestStart, $latestEnd, $totalDayMinutes]) => {
            if (scheduleEntry.time.type !== "range")
                return { top: 0, height: 0 };

            const start = scheduleEntry.time.interval.start;
            const end = scheduleEntry.time.interval.end;

            if (!start || !end) return { top: 0, height: 0 };

            // Adjust start and end to be within the current day
            const adjustedStart = start.set({
                year: $earliestStart.year,
                month: $earliestStart.month,
                day: $earliestStart.day,
            });
            const adjustedEnd = end.set({
                year: $earliestStart.year,
                month: $earliestStart.month,
                day: $earliestStart.day,
            });

            // If adjusted end is before adjusted start, it means the event ends on the next day
            const crossesMidnight = adjustedEnd < adjustedStart;
            if (crossesMidnight) {
                adjustedEnd.plus({ days: 1 });
            }

            const clampedStart = DateTime.max(adjustedStart, $earliestStart);
            const clampedEnd = DateTime.min(adjustedEnd, $latestEnd);

            const top = Math.max(
                0,
                (clampedStart.diff($earliestStart, "minutes").minutes /
                    $totalDayMinutes) *
                    100,
            );
            const height = Math.max(
                0,
                Math.min(
                    100 - top,
                    (clampedEnd.diff(clampedStart, "minutes").minutes /
                        $totalDayMinutes) *
                        100,
                ),
            );

            return { top, height };
        },
    );

    // Create spring animations for smooth transitions
    const tweenedTop = spring($entryPosition.top + $entryPosition.height / 2, {
        stiffness: 0.1,
        damping: 0.4,
    });
    const tweenedHeight = spring(0, { stiffness: 0.1, damping: 0.3 });

    $: $tweenedTop = $entryPosition.top;
    $: $tweenedHeight = $entryPosition.height;

    const stringToColour = (str: string) => {
        let hash = 0;
        str.split("").forEach((char) => {
            hash = char.charCodeAt(0) + ((hash << 5) - hash);
        });
        let colour = "#";
        for (let i = 0; i < 3; i++) {
            const value = (hash >> (i * 8)) & 0xff;
            colour += value.toString(16).padStart(2, "0");
        }
        return colour;
    };
</script>

<Button
    class="absolute left-0 right-0 p-2 rounded text-xs z-10 overflow-hidden bg-opacity-50 text-background ml-auto mr-auto border-2 border-foreground/50"
    style="top: {$tweenedTop}%; height: {$tweenedHeight}%; background-color: {stringToColour(
        `${classEntry.title}${classEntry.crn}`,
    )}75; width: calc(100% + {widthOffset}px);"
    variant="ghost"
    on:click
    {builders}
>
    <div transition:slide>
        {#if scheduleEntry.time.type === "range"}
            <p class="text-black">
                {#if classEntry.displayOverride}
                    {classEntry.displayOverride}
                {:else}
                    {classEntry.subject}
                    {classEntry.course}
                {/if}
            </p>
        {/if}
    </div>
</Button>
