import type { ClassEntry } from "@/library/class-entry/types";
import type { Cheerio, CheerioAPI, Element as CheerioElement } from "cheerio";

export const enum HTMLProcessorInferredType {
    /**
     * This is not "empty", it is the entire lack of a row, this is used to indicate the -1th and n+1th rows.
     */
    Nothing = "nothing",
    DepartmentTitle = "department-title",
    ClassEntryHeader = "class-entry-header",
    ClassEntryRow = "class-entry-row",
    ClassEntryRowAdditionalScheduleEntry = "class-entry-row-additional-schedule-entry",
}

export type RowReference = string;

export type HTMLProcessorCheerioElement = Cheerio<CheerioElement>;

export type HTMLProcessorRow = {
    rowReference: RowReference;
    row: number;
    type: HTMLProcessorInferredType;
};

export type HTMLProcessorPosition = {
    up: HTMLProcessorRow;
    current: HTMLProcessorRow;
    down: HTMLProcessorRow;
};

export type HTMLProcessorContext = {
    cursor: number;
    cheerioApi: CheerioAPI;
    position: HTMLProcessorPosition;
    rowElements: Map<RowReference, HTMLProcessorCheerioElement>;
};

export type ParserContext = {
    processorContext: HTMLProcessorContext;

    department: string;
    classEntryBuffer: ClassEntry;

    classEntries: Array<ClassEntry>;
};

export type ParserTransition = {
    up?: HTMLProcessorInferredType;
    down?: HTMLProcessorInferredType;
};

export type ParserHandlerFunction = (context: ParserContext) => void;
export type ParserTransitionHandlerTuple = [
    ParserTransition,
    ParserHandlerFunction,
];
export type ParserRowTypeHandlers = Record<
    HTMLProcessorInferredType,
    Array<ParserTransitionHandlerTuple>
>;

export type ParserResult = Array<ClassEntry>;
