import type { CEDayOfWeek } from "@/library/class-entry/html-parser/constants";
import { type Interval } from "luxon";

export type RowAttribute = {
    expanded: boolean;
    selected: boolean;
};

export type CECapacity = {
    total: number;
    actual: number;
    remaining: number;
};

export type ScheduleEntryDateRange = {
    interval: Interval;
};

export const enum ScheduleEntryTimeType {
    Range = "range",
    Label = "label",
}
/**
 * Represents a time range for a schedule entry.
 * Only the time is specified, not the date.
 */
export type ScheduleEntryTimeRange = {
    type: ScheduleEntryTimeType.Range;

    interval: Interval;
};
/**
 * Represents a time label for a schedule entry.
 * In cases where the time is not specified, the label is used instead.
 */
export type ScheduleEntryTimeLabel = {
    type: ScheduleEntryTimeType.Label;

    /**
     * The label of the time.
     * @example "TBA" / To Be Announced
     */
    label: string;
};
export type ScheduleEntryTime = ScheduleEntryTimeRange | ScheduleEntryTimeLabel;

export type ScheduleAndClassEntry = {
    scheduleEntry: CEScheduleEntry;
    classEntry: ClassEntry;
};

export type CEScheduleEntry = {
    /**
     * Non-stable unique identifier for the schedule entry.
     */
    uid: string;

    days: Array<(typeof CEDayOfWeek)[keyof typeof CEDayOfWeek]>;
    time: ScheduleEntryTime;
    date: ScheduleEntryDateRange;

    instructor: string;
    location: string;

    attributes: string;
};

export type ClassEntryType = "online" | "hybrid" | "in-person";

export type ClassEntry = {
    /**
     * Non-stable unique identifier for the class entry.
     */
    uid: string;

    type: ClassEntryType;

    title: string;

    /**
     * The class entry's class reference number.
     */
    crn: number;
    /**
     * The class entry's campus code.
     * @see http://www.solano.edu/counseling/1920/ReadingtheSemesterSchedule.pdf (pg. 5)
     */
    campus: string;
    credit: number;

    subject: string;
    course: string;

    displayOverride?: string;

    section: string;

    capacity: CECapacity;
    waitlist: CECapacity;

    schedule: Array<CEScheduleEntry>;
};

export type FilterableClassEntry = ClassEntry & {
    selected: boolean;
    expanded: boolean;
};
