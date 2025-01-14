import type { FilterableClassEntry } from "@/library/class-entry/types";
import type { CSTNode } from "./cst";

export type ArrayCursor = [Array<unknown>, ...string[]];

function getPropertyValue(obj: unknown, path: string): unknown {
    const parts = path.split(".");
    let value: unknown = obj;

    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];

        if (part == null || part.length === 0) return undefined;
        if (value == null) return undefined;

        if (Array.isArray(value)) return [value, ...parts.slice(i)];

        if (typeof value === "object") {
            value = (value as Record<string, unknown>)[part];
        } else {
            return undefined;
        }
    }

    return value;
}

function levenshteinDistance(a: string, b: string): number {
    const m = a.length;
    const n = b.length;

    if (m < n) {
        return levenshteinDistance(b, a);
    }

    if (n === 0) {
        return m;
    }

    let previousRow = Array.from({ length: n + 1 }, (_, i) => i);

    for (let i = 1; i <= m; i++) {
        const currentRow = [i];
        for (let j = 1; j <= n; j++) {
            const insertCost = (currentRow[j - 1] as number) + 1;
            const deleteCost = (previousRow[j] as number) + 1;
            const replaceCost =
                (previousRow[j - 1] as number) +
                (a[i - 1] !== b[j - 1] ? 1 : 0);
            currentRow.push(Math.min(insertCost, deleteCost, replaceCost));
        }
        previousRow = currentRow;
    }

    return previousRow[n] as number;
}

function fuzzyEquals(a: unknown, b: unknown, threshold: number = 0.8): boolean {
    if (typeof a === "string" && typeof b === "string") {
        const loweredA = a.toLowerCase();
        const loweredB = b.toLowerCase();

        if (loweredA.includes(loweredB) || loweredB.includes(loweredA)) {
            return true;
        }

        const maxLength = Math.max(loweredA.length, loweredB.length);
        const distance = levenshteinDistance(loweredA, loweredB);
        return (maxLength - distance) / maxLength >= threshold;
    }
    return a == b;
}

function evaluateEquality(
    left: CSTNode,
    right: CSTNode,
    classEntry: FilterableClassEntry,
    root: CSTNode,
    comparator: (a: unknown, b: unknown) => boolean,
) {
    try {
        const evaluatedLeft = evaluateNode(left, classEntry, root);
        const evaluatedRight = evaluateNode(right, classEntry, root);

        function recursiveArrayCheck(value: unknown, path: string[]): boolean {
            if (Array.isArray(value)) {
                return value.some((item) => recursiveArrayCheck(item, path));
            } else if (typeof value === "object" && value !== null) {
                const propertyValue = getPropertyValue(value, path.join("."));
                if (Array.isArray(propertyValue)) {
                    return propertyValue.some((item) =>
                        comparator(item, evaluatedRight),
                    );
                } else {
                    return comparator(propertyValue, evaluatedRight);
                }
            }
            return false;
        }

        if (Array.isArray(evaluatedLeft)) {
            const [value, ...path] = evaluatedLeft;
            return recursiveArrayCheck(value, path);
        }

        return comparator(evaluatedLeft, evaluatedRight);
    } catch (e) {
        console.error(e);
        return false;
    }
}

function evaluateNode(
    node: CSTNode,
    classEntry: FilterableClassEntry,
    root: CSTNode,
): ArrayCursor | boolean | number | string | undefined {
    if (node == root) {
        if (node.kind === "string") {
            // If it's just a string, match it to the title property
            return fuzzyEquals(classEntry.title, node.value);
        } else if (node.kind === "number") {
            // If it's just a number, match it to the crn property
            return (
                ((classEntry as Record<string, unknown>)["crn"] as number) ===
                parseFloat(node.value || "0")
            );
        }
    }

    const left = node.children?.[0];
    const right = node.children?.[1];
    let canCompare = true;
    if (!left || !right) {
        canCompare = false;
    }

    switch (node.kind) {
        case "symbolPlus":
            if (!canCompare) return 0;
            return (
                (evaluateNode(left as CSTNode, classEntry, root) as number) +
                (evaluateNode(right as CSTNode, classEntry, root) as number)
            );
        case "symbolMinus":
            if (!canCompare) return 0;
            return (
                (evaluateNode(left as CSTNode, classEntry, root) as number) -
                (evaluateNode(right as CSTNode, classEntry, root) as number)
            );
        case "symbolAsterisk":
            if (!canCompare) return 0;
            return (
                (evaluateNode(left as CSTNode, classEntry, root) as number) *
                (evaluateNode(right as CSTNode, classEntry, root) as number)
            );
        case "symbolSlash":
            if (!canCompare) return 0;
            return (
                (evaluateNode(left as CSTNode, classEntry, root) as number) /
                (evaluateNode(right as CSTNode, classEntry, root) as number)
            );
        case "symbolNot":
            if (left == null) return false;
            return !evaluateNode(left as CSTNode, classEntry, root);
        case "symbolAnd":
            if (!canCompare) return false;
            return (
                Boolean(evaluateNode(left as CSTNode, classEntry, root)) &&
                Boolean(evaluateNode(right as CSTNode, classEntry, root))
            );
        case "symbolOr":
            if (!canCompare) return false;
            return (
                Boolean(evaluateNode(left as CSTNode, classEntry, root)) ||
                Boolean(evaluateNode(right as CSTNode, classEntry, root))
            );
        case "symbolLessThanOrEqual":
            if (!canCompare) return false;

            return evaluateEquality(
                left as CSTNode,
                right as CSTNode,
                classEntry,
                root,
                (a, b) => {
                    if (
                        (typeof a == "string" && typeof b == "string") ||
                        (typeof a == "number" && typeof b == "number")
                    ) {
                        return a <= b;
                    }
                    return false;
                },
            );
        case "symbolGreaterThanOrEqual":
            if (!canCompare) return false;

            return evaluateEquality(
                left as CSTNode,
                right as CSTNode,
                classEntry,
                root,
                (a, b) => {
                    if (
                        (typeof a == "string" && typeof b == "string") ||
                        (typeof a == "number" && typeof b == "number")
                    ) {
                        return a >= b;
                    }
                    return false;
                },
            );
        case "symbolGreaterThan":
            if (!canCompare) return false;

            return evaluateEquality(
                left as CSTNode,
                right as CSTNode,
                classEntry,
                root,
                (a, b) => {
                    if (
                        (typeof a == "string" && typeof b == "string") ||
                        (typeof a == "number" && typeof b == "number")
                    ) {
                        return a > b;
                    }
                    return false;
                },
            );
        case "symbolLessThan":
            if (!canCompare) return false;

            return evaluateEquality(
                left as CSTNode,
                right as CSTNode,
                classEntry,
                root,
                (a, b) => {
                    if (
                        (typeof a == "string" && typeof b == "string") ||
                        (typeof a == "number" && typeof b == "number")
                    ) {
                        return a < b;
                    }
                    return false;
                },
            );
        case "symbolEquals":
            if (!canCompare) return false;

            return evaluateEquality(
                left as CSTNode,
                right as CSTNode,
                classEntry,
                root,
                (a, b) => {
                    return a == b;
                },
            );
        case "symbolFuzzyEquals":
            if (!canCompare) return false;

            return evaluateEquality(
                left as CSTNode,
                right as CSTNode,
                classEntry,
                root,
                (a, b) => {
                    return fuzzyEquals(a, b);
                },
            );
        case "expressionOpen":
            return evaluateNode(left as CSTNode, classEntry, root);
        case "identifier":
            return getPropertyValue(classEntry, node.value || "") as
                | ArrayCursor
                | boolean
                | number
                | string
                | undefined;
        case "number":
            return parseFloat(node.value || "0");
        case "string":
            return node.value;
        case "keywordTrue":
            return true;
        case "keywordFalse":
            return false;
        case "expressionClose":
            return undefined;
        default:
            throw new Error(`Unsupported node kind: ${node.kind}`);
    }
}

export function runComparison(
    classEntry: FilterableClassEntry,
    root: CSTNode,
): boolean {
    return !!evaluateNode(root, classEntry, root);
}
