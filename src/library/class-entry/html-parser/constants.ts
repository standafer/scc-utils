/**
 * Represents a standard day of the week.
 */
export const CEDayOfWeek = {
    Sunday: "U",
    Monday: "M",
    Tuesday: "T",
    Wednesday: "W",
    Thursday: "R",
    Friday: "F",
    Saturday: "S",
} as const;

export type CEDayOfWeekForms = "long" | "short" | "letter";

export const CE_DAY_OF_WEEK_FORMS: Record<
    (typeof CEDayOfWeek)[keyof typeof CEDayOfWeek],
    Record<CEDayOfWeekForms, string>
> = {
    [CEDayOfWeek.Sunday]: {
        long: "Sunday",
        short: "Sun",
        letter: "U",
    },
    [CEDayOfWeek.Monday]: {
        long: "Monday",
        short: "Mon",
        letter: "M",
    },
    [CEDayOfWeek.Tuesday]: {
        long: "Tuesday",
        short: "Tue",
        letter: "T",
    },
    [CEDayOfWeek.Wednesday]: {
        long: "Wednesday",
        short: "Wed",
        letter: "W",
    },
    [CEDayOfWeek.Thursday]: {
        long: "Thursday",
        short: "Thu",
        letter: "R",
    },
    [CEDayOfWeek.Friday]: {
        long: "Friday",
        short: "Fri",
        letter: "F",
    },
    [CEDayOfWeek.Saturday]: {
        long: "Saturday",
        short: "Sat",
        letter: "S",
    },
} as const;

export const HTML_SELECTORS = {
    TableRows: ".datadisplaytable tr",
} as const;

export const HTML_CLASSES = {
    DepartmentTitle: "ddtitle",
    ClassEntryHeader: "ddheader",
    ClassEntryRow: "dddefault",
} as const;

export const CELL_INDICIES = {
    CRN: 1,
    Subject: 2,
    Course: 3,
    Section: 4,
    Campus: 5,
    Credit: 6,
    Title: 7,
    Days: 8,
    Times: 9,
    CapacityTotal: 10,
    CapacityActual: 11,
    CapacityRemaining: 12,
    WaitlistTotal: 13,
    WaitlistActual: 14,
    WaitlistRemaining: 15,
    Instructor: 16,
    Date: 17,
    Location: 18,
    Attribute: 19,
} as const;

const genericRegExpMatch = (text: string) => `(?:(?:^|s)${text}(?=$|s))`;

export const REGEX = {
    TBA: new RegExp(genericRegExpMatch("TBA"), "g"),
    ONLINE: new RegExp(genericRegExpMatch("ONLINE"), "g"),
} as const;
