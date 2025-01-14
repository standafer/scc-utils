import { expect, test } from "vitest";
import { loadHTML, processHTML } from "./html-processor";
import { HTMLProcessorInferredType, type HTMLProcessorContext } from "../types";
import { clone } from "remeda";

function createMockHtml(trs: number) {
    return `
        <!DOCTYPE html>
            <html>
            <body>
                <table class="datadisplaytable">
                    ${new Array(trs).fill(0).map(
                        () => `<tr>
                        <td class="dddefault">1</td>
                    </tr>`,
                    )}
                </table>
            </body>
        </html>
    `;
}

test("loadHTML to not throw", () => {
    expect(loadHTML("<html></html>")).to.not.throw;
});

test("processHTML to not throw", () => {
    expect(processHTML(loadHTML("<html></html>"), () => {})).to.not.throw;
});

test("to have proper amount of callbacks", () => {
    const callbacks = Math.floor(Math.random() * 10);

    const $ = loadHTML(createMockHtml(callbacks));

    let actual = 0;
    processHTML($, () => {
        actual++;
    });

    expect(actual).toBe(callbacks + 1);
});

test("to handle basic data", () => {
    const $ = loadHTML(createMockHtml(1));

    const callbacks: Array<HTMLProcessorContext> = [];
    processHTML($, (data) => {
        callbacks.push(clone(data));
    });

    expect(callbacks).toEqual([
        {
            cheerioApi: expect.any(Function),
            cursor: -1,
            position: {
                up: {
                    row: -2,
                    type: HTMLProcessorInferredType.Nothing,
                    rowReference: expect.any(String),
                },
                current: {
                    row: -1,
                    type: HTMLProcessorInferredType.Nothing,
                    rowReference: expect.any(String),
                },
                down: {
                    row: 0,
                    type: HTMLProcessorInferredType.ClassEntryRow,
                    rowReference: expect.any(String),
                },
            },
            rowElements: expect.any(Object),
        },
        {
            cheerioApi: expect.any(Function),
            cursor: 0,
            position: {
                up: {
                    row: -1,
                    type: HTMLProcessorInferredType.Nothing,
                    rowReference: expect.any(String),
                },
                current: {
                    row: 0,
                    type: HTMLProcessorInferredType.ClassEntryRow,
                    rowReference: expect.any(String),
                },
                down: {
                    row: 1,
                    type: HTMLProcessorInferredType.Nothing,
                    rowReference: expect.any(String),
                },
            },
            rowElements: expect.any(Object),
        },
    ]);
});
