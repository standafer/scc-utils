import {
    loadHTML,
    processHTML,
} from "@/library/class-entry/html-parser/processor/html-processor";
import {
    type HTMLProcessorContext,
    type ParserContext,
    type ParserResult,
} from "@/library/class-entry/html-parser/types";
import type { ClassEntry } from "@/library/class-entry/types";
import { ROW_TYPE_HANDLERS } from "@/library/class-entry/html-parser/parser/parser-row-type-handlers";

export function parse(html: string): ParserResult {
    const context: ParserContext = {
        processorContext: {} as HTMLProcessorContext,
        department: "",
        classEntryBuffer: {} as ClassEntry,
        classEntries: [],
    };

    processHTML(loadHTML(html), (processorContext) => {
        const {
            position: { up, current, down },
        } = processorContext;

        context.processorContext = processorContext;

        ROW_TYPE_HANDLERS[current.type].forEach(([transition, handler]) => {
            if (transition.up) {
                if (up.type !== transition.up) return;
            }

            if (transition.down) {
                if (down.type !== transition.down) return;
            }

            handler(context);
        });
    });

    return context.classEntries;
}
