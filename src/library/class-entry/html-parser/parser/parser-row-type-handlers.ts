import {
    HTMLProcessorInferredType as InferredType,
    type ParserRowTypeHandlers,
} from "@/library/class-entry/html-parser/types";
import {
    PARSER_HANDLER_FUNCTIONS,
    mergeHandlerFunctions,
} from "@/library/class-entry/html-parser/parser/parser-handler-functions";

export const ROW_TYPE_HANDLERS: ParserRowTypeHandlers = {
    [InferredType.Nothing]: [],
    /**
     * Top of the file is nothing, followed by a department title
     * Always update the department title
     */
    [InferredType.DepartmentTitle]: [
        [{}, PARSER_HANDLER_FUNCTIONS.updateDepartment],
    ],
    /**
     * A department title is followed by a class entry header.
     *
     * 1) If a header is reached after a class entry, finalize the class entry.
     * 2) If a header is reached after an additional schedule entry, finalize the class entry.
     */
    [InferredType.ClassEntryHeader]: [
        [
            { up: InferredType.ClassEntryRow },
            PARSER_HANDLER_FUNCTIONS.finalizeClassEntry,
        ],
        [
            { up: InferredType.ClassEntryRowAdditionalScheduleEntry },
            PARSER_HANDLER_FUNCTIONS.finalizeClassEntry,
        ],
    ],
    /**
     * A class entry row is followed by:
     * a) another class entry row
     * b) a class entry row additional schedule entry
     * c) a class entry header
     *
     * 1) If a class entry row is reached after a class entry, finalize the previous class entry, then add the current class entry.
     * 2) If a class entry row is reached after an additional schedule entry, finalize the previous class entry, then add the current class entry.
     * 3) If a class entry row is reached after a header, add the class entry.
     * 4) If nothing is reached, finalize the class entry.
     */
    [InferredType.ClassEntryRow]: [
        [
            { up: InferredType.ClassEntryRow },
            mergeHandlerFunctions(
                PARSER_HANDLER_FUNCTIONS.finalizeClassEntry,
                PARSER_HANDLER_FUNCTIONS.addClassEntry,
            ),
        ],
        [
            { up: InferredType.ClassEntryRowAdditionalScheduleEntry },
            mergeHandlerFunctions(
                PARSER_HANDLER_FUNCTIONS.finalizeClassEntry,
                PARSER_HANDLER_FUNCTIONS.addClassEntry,
            ),
        ],

        [
            { up: InferredType.ClassEntryHeader },
            PARSER_HANDLER_FUNCTIONS.addClassEntry, // Add the current class entry if it's the first one
        ],

        [
            { down: InferredType.Nothing },
            PARSER_HANDLER_FUNCTIONS.finalizeClassEntry,
        ],
    ],
    [InferredType.ClassEntryRowAdditionalScheduleEntry]: [
        [
            { up: InferredType.ClassEntryRow },
            PARSER_HANDLER_FUNCTIONS.addAdditionalScheduleEntry, // Add the additional schedule entry
        ],
        [
            { up: InferredType.ClassEntryRowAdditionalScheduleEntry },
            PARSER_HANDLER_FUNCTIONS.addAdditionalScheduleEntry, // Add the additional schedule entry
        ],
        [
            { down: InferredType.Nothing },
            PARSER_HANDLER_FUNCTIONS.finalizeClassEntry,
        ],
    ],
} as const;
