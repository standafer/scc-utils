import {
    CEDayOfWeek,
    CE_DAY_OF_WEEK_FORMS,
    type CEDayOfWeekForms,
} from "@/library/class-entry/html-parser/constants";

/**
 * Parses a string representing days of the week and returns an array of corresponding CEDayOfWeek values.
 * @param daysOfWeek - The string representing days of the week.
 * @returns An array of CEDayOfWeek values.
 * @throws Error if an invalid day of the week is encountered.
 */
export function parseDaysWeekString(
    daysOfWeek: string,
): Array<(typeof CEDayOfWeek)[keyof typeof CEDayOfWeek]> {
    const days = daysOfWeek.trim().split("");

    return days.map((day) => {
        const ceDay = Object.values(CEDayOfWeek).find((value) => value === day);
        if (!ceDay) {
            throw new Error(`Invalid day of week: ${day} (${daysOfWeek})`);
        }
        return ceDay;
    });
}

export function convertDayOfWeekToForm(
    dayOfWeek: (typeof CEDayOfWeek)[keyof typeof CEDayOfWeek],
    form: CEDayOfWeekForms,
): string {
    return CE_DAY_OF_WEEK_FORMS[dayOfWeek][form];
}

export function convertDaysOfWeekToForm(
    daysOfWeek: Array<(typeof CEDayOfWeek)[keyof typeof CEDayOfWeek]>,
    form: CEDayOfWeekForms,
): Array<string> {
    return daysOfWeek.map((dayOfWeek) =>
        convertDayOfWeekToForm(dayOfWeek, form),
    );
}
