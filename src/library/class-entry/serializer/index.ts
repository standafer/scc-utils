import type { ClassEntry } from "@/library/class-entry/types";
import { DateTime, Interval } from "luxon";

/**
 * TODO:
 * a) Convert to something other than JSON.
 *  - Maybe MessagePack?
 *  - Right now it's about as scuffed as it gets.
 */

export function serialize(entry: Array<ClassEntry>): string {
    return JSON.stringify(entry);
}

export function deserialize(value: string): Array<ClassEntry> {
    try {
        return JSON.parse(value, (_, value) => {
            if (value && value.isLuxonInterval) {
                return Interval.fromDateTimes(
                    DateTime.fromISO(value.s),
                    DateTime.fromISO(value.e),
                );
            }
            return value;
        });
    } catch {
        console.error(`Failed to deserialize value: ${value}`);
        return [];
    }
}
