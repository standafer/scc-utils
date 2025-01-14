import {
    type ParserContext,
    type ParserHandlerFunction,
} from "@/library/class-entry/html-parser/types";
import {
    ScheduleEntryTimeType,
    type CECapacity,
    type CEScheduleEntry,
    type ClassEntry,
    type ClassEntryType,
    type ScheduleEntryDateRange,
    type ScheduleEntryTime,
} from "@/library/class-entry/types";
import {
    getCheerioElement,
    getTextFromElementChildren,
} from "@/library/class-entry/html-parser/processor/html-processor";
import { CELL_INDICIES } from "@/library/class-entry/html-parser/constants";
import { parse as parseDate } from "date-fns";
import { uid } from "uid";
import { parseDaysWeekString } from "../utils/day-of-week-utils";
import { Interval } from "luxon";

export function mergeHandlerFunctions(
    ...functions: Array<ParserHandlerFunction>
) {
    return (context: ParserContext) => {
        functions.forEach((fn) => fn(context));
    };
}

export const PARSER_HANDLER_FUNCTIONS = {
    updateDepartment: updateDepartment,
    addClassEntry: addClassEntry,
    addAdditionalScheduleEntry: addAdditionalScheduleEntry,
    finalizeClassEntry: finalizeClassEntry,
} as const satisfies Record<string, ParserHandlerFunction>;

function updateDepartment(parserContext: ParserContext) {
    const { processorContext } = parserContext;

    const rowElement = getCheerioElement(
        processorContext,
        processorContext.position.current.rowReference,
    );
    if (!rowElement) return;

    parserContext.department = rowElement.text().trim();
}

/**
 * Adds a class entry to the parser context.
 *
 * @param parserContext - The parser context object.
 */
function addClassEntry(parserContext: ParserContext) {
    const { processorContext } = parserContext;

    const rowElement = getCheerioElement(
        processorContext,
        processorContext.position.current.rowReference,
    );
    if (!rowElement) return;

    const columns = getTextFromElementChildren(processorContext, rowElement);

    for (const CELL_INDEX of Object.values(CELL_INDICIES)) {
        if (columns[CELL_INDEX] === undefined) {
            throw new Error(`Column ${CELL_INDEX} is undefined`);
        }
    }

    const scheduleEntry = parseSchedule(
        columns[CELL_INDICIES.Days] || "",
        columns[CELL_INDICIES.Times] || "",
        columns[CELL_INDICIES.Instructor] || "",
        columns[CELL_INDICIES.Date] || "",
        columns[CELL_INDICIES.Location] || "",
        columns[CELL_INDICIES.Attribute] || "",
    );

    const classEntry: ClassEntry = {
        uid: uid(),
        type: getClassEntryTypeFromScheduleEntries([scheduleEntry]),
        title: columns[CELL_INDICIES.Title] || "",
        crn: +(columns[CELL_INDICIES.CRN] || ""),
        campus: columns[CELL_INDICIES.Campus] || "",
        credit: +(columns[CELL_INDICIES.Credit] || ""),
        subject: columns[CELL_INDICIES.Subject] || "",
        course: columns[CELL_INDICIES.Course] || "",
        section: columns[CELL_INDICIES.Section] || "",
        capacity: parseCapacity(
            +(columns[CELL_INDICIES.CapacityTotal] || ""),
            +(columns[CELL_INDICIES.CapacityActual] || ""),
            +(columns[CELL_INDICIES.CapacityRemaining] || ""),
        ),
        waitlist: parseCapacity(
            +(columns[CELL_INDICIES.WaitlistTotal] || ""),
            +(columns[CELL_INDICIES.WaitlistActual] || ""),
            +(columns[CELL_INDICIES.WaitlistRemaining] || ""),
        ),
        schedule: [scheduleEntry],
    };

    parserContext.classEntryBuffer = classEntry;
}

function getClassEntryTypeFromScheduleEntries(
    scheduleEntries: Array<CEScheduleEntry>,
): ClassEntryType {
    const hasOnline = scheduleEntries.some((entry) =>
        entry.location.toLowerCase().includes("online"),
    );
    const hasRanged = scheduleEntries.some(
        (entry) => entry.time.type == "range",
    );

    console.log(hasOnline, hasRanged);

    if (hasOnline && hasRanged) {
        return "hybrid";
    } else if (hasOnline) {
        return "online";
    } else {
        return "in-person";
    }
}

/**
 * Adds an additional schedule entry to the class entry.
 *
 * @param parserContext - The parser context object.
 */
function addAdditionalScheduleEntry(parserContext: ParserContext) {
    const { processorContext } = parserContext;

    const rowElement = getCheerioElement(
        processorContext,
        processorContext.position.current.rowReference,
    );
    if (!rowElement) return;

    const columns = getTextFromElementChildren(processorContext, rowElement);

    for (const CELL_INDEX of Object.values(CELL_INDICIES)) {
        if (columns[CELL_INDEX] === undefined) {
            throw new Error(`Column ${CELL_INDEX} is undefined`);
        }
    }

    const scheduleEntry = parseSchedule(
        columns[CELL_INDICIES.Days] || "",
        columns[CELL_INDICIES.Times] || "",
        columns[CELL_INDICIES.Instructor] || "",
        columns[CELL_INDICIES.Date] || "",
        columns[CELL_INDICIES.Location] || "",
        columns[CELL_INDICIES.Attribute] || "",
    );

    parserContext.classEntryBuffer.schedule.push(scheduleEntry);
    parserContext.classEntryBuffer.type = getClassEntryTypeFromScheduleEntries(
        parserContext.classEntryBuffer.schedule,
    );
}

function finalizeClassEntry(parserContext: ParserContext) {
    const { classEntryBuffer } = parserContext;
    parserContext.classEntries.push(classEntryBuffer);
}

export function parseSchedule(
    days: string,
    time: string,
    instructor: string,
    date: string,
    location: string,
    attribute: string,
): CEScheduleEntry {
    return {
        uid: uid(),
        days: parseDaysWeekString(days),
        time: parseScheduleTime(time),
        date: parseScheduleDate(date),
        instructor,
        location,
        attributes: attribute,
    };
}

function parseScheduleTime(time: string): ScheduleEntryTime {
    if (time.includes("TBA")) {
        return {
            type: ScheduleEntryTimeType.Label,
            label: "TBA",
        };
    } else if (time.includes("ONLINE")) {
        return {
            type: ScheduleEntryTimeType.Label,
            label: "ONLINE",
        };
    } else {
        const [start, end] = time.split("-");

        if (!start || !end) {
            return {
                type: ScheduleEntryTimeType.Label,
                label: `${time} (malformed)`,
            };
        }

        return {
            type: ScheduleEntryTimeType.Range,
            interval: Interval.fromDateTimes(
                parseDate(start, "h:mm a", new Date()),
                parseDate(end, "h:mm a", new Date()),
            ),
        };
    }
}

function parseScheduleDate(date: string): ScheduleEntryDateRange {
    const [start, end] = date.split("-");

    if (!start || !end) {
        throw new Error(`Invalid date range: ${date}`);
    }

    return {
        interval: Interval.fromDateTimes(
            parseDate(start, "MM/dd", new Date()),
            parseDate(end, "MM/dd", new Date()),
        ),
    };
}

function parseCapacity(
    capacity: number,
    actual: number,
    remaining: number,
): CECapacity {
    return {
        total: capacity,
        actual,
        remaining,
    };
}
