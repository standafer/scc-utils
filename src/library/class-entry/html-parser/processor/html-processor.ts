import {
    type HTMLProcessorContext,
    type HTMLProcessorRow,
    HTMLProcessorInferredType,
} from "@/library/class-entry/html-parser/types";
import * as Constants from "@/library/class-entry/html-parser/constants";
import type { ValueOf } from "@/library/utilTypes";
import * as Cheerio from "cheerio";
import { uid } from "uid/single";

export function getCheerioElement(
    context: HTMLProcessorContext,
    rowReference: string,
): Cheerio.Cheerio<Cheerio.Element> | undefined {
    const rowElement = context.rowElements.get(rowReference);
    if (!rowElement) return;
    return rowElement;
}

export function getTextFromElementChildren(
    context: HTMLProcessorContext,
    element: Cheerio.Cheerio<Cheerio.Element>,
): Array<string> {
    const { cheerioApi: $ } = context;

    return element
        .children()
        .map((_, cell) => $(cell).text())
        .get();
}

export function loadHTML(html: string): Cheerio.CheerioAPI {
    return Cheerio.load(html);
}

export function processHTML(
    $: Cheerio.CheerioAPI,
    callback: (context: HTMLProcessorContext) => void,
) {
    const context: HTMLProcessorContext = {
        cursor: 0,
        cheerioApi: $,
        position: {
            up: makeRow(-3, HTMLProcessorInferredType.Nothing),
            current: makeRow(-2, HTMLProcessorInferredType.Nothing),
            down: makeRow(-1, HTMLProcessorInferredType.Nothing),
        },
        rowElements: new Map(),
    };

    // Run main processing logic
    processTableRows();

    function processTableRows() {
        const rows = $(Constants.HTML_SELECTORS.TableRows);

        for (let i = 0; i <= rows.length; i++) {
            // Shift the top, current, and bottom positions
            context.position.up = context.position.current;
            context.position.current = context.position.down;

            const downIndex = i;

            try {
                const downRow = rows.get(downIndex);
                if (!downRow) throw new Error(`No row found below ${i}`);

                const result = getRowData(downIndex, $(downRow));
                if (!result)
                    throw new Error(
                        `No row data able to be extracted below ${i}`,
                    );

                const [downRowData, downCheerioElement] = result;

                context.rowElements.set(
                    downRowData.rowReference,
                    downCheerioElement,
                );
                context.position.down = downRowData;
            } catch (err) {
                context.position.down = makeRow(
                    downIndex,
                    HTMLProcessorInferredType.Nothing,
                );
            }

            context.cursor = context.position.current.row;

            callback(context);
        }
    }

    /**
     * Processes a row in the HTML document and returns an HTMLProcessorRow object.
     *
     * @param _ - The index of the row.
     * @param element - The Cheerio.Element representing the row.
     * @returns An HTMLProcessorRow object if the row type can be inferred, otherwise undefined.
     */
    function getRowData(
        index: number,
        element: Cheerio.Cheerio<Cheerio.Element>,
    ): [HTMLProcessorRow, Cheerio.Cheerio<Cheerio.Element>] | undefined {
        const children = element.children();

        const inferredType = inferType(children);
        if (!inferredType) return;

        return [makeRow(index, inferredType), element];
    }

    /**
     * Infers the type of the HTML element based on the first matched class.
     * @param children - The Cheerio elements to process.
     * @returns The inferred type of the HTML element, or undefined if no type is inferred.
     */
    function inferType(
        children: Cheerio.Cheerio<Cheerio.Element>,
    ): HTMLProcessorInferredType | undefined {
        const firstElement = children.first();

        const matchedClass = getMatchedClass(firstElement);
        if (!matchedClass) return;

        let inferredType: HTMLProcessorInferredType;

        switch (matchedClass) {
            case Constants.HTML_CLASSES.DepartmentTitle:
                inferredType = HTMLProcessorInferredType.DepartmentTitle;
                break;
            case Constants.HTML_CLASSES.ClassEntryHeader:
                inferredType = HTMLProcessorInferredType.ClassEntryHeader;
                break;
            case Constants.HTML_CLASSES.ClassEntryRow: {
                // There's a special case where a class entry row can be an additional schedule entry
                // The easiest way is to just check if the second row is empty
                // I would maybe want to re-visit this later

                // We cannot check the first first row, because in cases where you're already
                // enrolled in the class, the first row is blank even if it's not an additional
                // schedule entry
                if (children.first().next().text().trim() === "")
                    return HTMLProcessorInferredType.ClassEntryRowAdditionalScheduleEntry;

                inferredType = HTMLProcessorInferredType.ClassEntryRow;
                break;
            }
        }

        return inferredType;
    }

    // function getOffsetPosition(index: number, offset: number): HTMLProcessorPosition {

    // }

    /**
     * Retrieves the first matched class from the given children elements.
     *
     * @param children - The Cheerio elements to search for a matched class.
     * @returns The first matched class from the children elements, or undefined if no match is found.
     */
    function getMatchedClass(
        firstElement: Cheerio.Cheerio<Cheerio.Element>,
    ): ValueOf<typeof Constants.HTML_CLASSES> | undefined {
        const classAttribute = firstElement.first().attr("class");
        if (!classAttribute || typeof classAttribute !== "string") return;

        const classList = classAttribute.split(" ");
        if (classList.length <= 0) return;

        const firstMatchedClass = Object.values(Constants.HTML_CLASSES).find(
            (checkingClass) => classList.includes(checkingClass),
        );
        if (!firstMatchedClass) return;

        return firstMatchedClass;
    }

    function makeRow(
        row: number,
        type: HTMLProcessorInferredType,
    ): HTMLProcessorRow {
        return { row, type, rowReference: uid() };
    }
}
