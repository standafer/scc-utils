<script lang="ts">
    import type { ScheduleAndClassEntry } from "@/library/class-entry/types";
    import { Badge } from "@/components/ui/badge";
    import { Separator } from "@/components/ui/separator";
    import { DateTime } from "luxon";

    export let scheduleAndClassEntries: Array<ScheduleAndClassEntry>;
</script>

<div class="space-y-2">
    {#each scheduleAndClassEntries as { scheduleEntry, classEntry }, i}
        {@const indexOfScheduleEntry =
            classEntry.schedule.indexOf(scheduleEntry)}
        <div>
            <h4 class="text-lg font-medium">
                {#if classEntry.schedule.length > 1}
                    <Badge>
                        {indexOfScheduleEntry + 1} / {classEntry.schedule
                            .length}
                    </Badge>
                {/if}
                {classEntry.title}
                <Badge variant="secondary">
                    {classEntry.subject}
                    {classEntry.course}
                </Badge>
            </h4>
            <ul>
                <li>
                    <strong>Location:</strong>
                    {scheduleEntry.location} @ {classEntry.campus}
                </li>
                <li>
                    <strong>Time:</strong>{" "}
                    {#if scheduleEntry.time.type == "range"}
                        {scheduleEntry.time.interval.start?.toLocaleString(
                            DateTime.TIME_SIMPLE,
                        )} - {scheduleEntry.time.interval.end?.toLocaleString(
                            DateTime.TIME_SIMPLE,
                        )}
                    {:else}
                        {scheduleEntry.time.label}
                    {/if}
                </li>
                <li>
                    <strong>Instructor:</strong>
                    {scheduleEntry.instructor}
                </li>
            </ul>
        </div>
        {#if i !== scheduleAndClassEntries.length - 1}
            <Separator />
        {/if}
    {/each}
</div>
