export type Token = {
    kind: string;
    value?: string;
    startIndex: number;
    endIndex: number;
    error?: string | undefined;
    depth?: number;
};

export type Bracket = [string, string, string];

const KEYWORDS = {
    ["true"]: "keywordTrue",
    ["false"]: "keywordFalse",
    ["and"]: "symbolAnd",
    ["not"]: "symbolNot",
    ["or"]: "symbolOr",
} as Record<string, string>;
const HIGH_PRECEDENCE_SYMBOLS = {
    ["+"]: "symbolPlus",
    ["-"]: "symbolMinus",
    ["*"]: "symbolAsterisk",
    ["/"]: "symbolSlash",
    [":<="]: "symbolLessThanOrEqual",
    [":>="]: "symbolGreaterThanOrEqual",
    [":>"]: "symbolGreaterThan",
    [":<"]: "symbolLessThan",
    [":="]: "symbolEquals",
    [":"]: "symbolFuzzyEquals",
} as Record<string, string>;
const LOW_PRECEDENCE_SYMBOLS = {} as Record<string, string>;

const BRACKETS = [
    ["(", ")", "expression"],
    ["'", "'", "string"],
    ['"', '"', "string"],
] as Array<Bracket>;

function isSymbol(
    input: string,
    index: number,
    symbolLookup: Record<string, string>,
): [string, number] | null {
    for (const symbol in symbolLookup) {
        if (input.startsWith(symbol, index)) {
            return [symbol, symbol.length];
        }
    }
    return null;
}

function tokenizeExpression(identifier: string): Array<Token> {
    if (identifier.length <= 0) return [];

    const keyword = KEYWORDS[identifier];
    if (keyword) {
        return [
            {
                kind: keyword,
                value: identifier,
                startIndex: 0,
                endIndex: identifier.length,
            },
        ];
    }

    const highPSymbol = HIGH_PRECEDENCE_SYMBOLS[identifier];
    const lowPSymbol = LOW_PRECEDENCE_SYMBOLS[identifier];
    if (highPSymbol || lowPSymbol) {
        return [
            {
                kind: (highPSymbol || lowPSymbol) as string,
                value: identifier,
                startIndex: 0,
                endIndex: identifier.length,
            },
        ];
    }

    if (identifier.match(/^\d+$/)) {
        return [
            {
                kind: "number",
                value: identifier,
                startIndex: 0,
                endIndex: identifier.length,
            },
        ];
    }

    return [
        {
            kind: "identifier",
            value: identifier,
            startIndex: 0,
            endIndex: identifier.length,
        },
    ];
}

export function tokenize(
    input: string,
    exitBracket: number | null,
    depth = 0,
): [Array<Token>, number, boolean] {
    let i = 0;
    const output: Array<Token> = [];
    let builtIndex: number | null = null;
    let built: Array<string> = [];

    function processBuilt() {
        if (built.length == 0) return;
        if (builtIndex == null) return;

        const identifier = built.join("");
        const expressions = tokenizeExpression(identifier);

        for (const expression of expressions) {
            expression.startIndex += builtIndex;
            expression.endIndex += builtIndex;
            output.push(expression);
        }

        built = [];
        builtIndex = null;
    }

    const leftBrackets: Array<string> = [];
    const rightBrackets: Array<string> = [];
    for (const bracket of BRACKETS) {
        leftBrackets.push(bracket[0]);
        rightBrackets.push(bracket[1]);
    }

    function pushTokensWithOffset(tokens: Array<Token>, offset: number) {
        for (const token of tokens) {
            token.startIndex += i + offset;
            token.endIndex += i + offset;
            output.push(token);
        }
    }

    function addChar(char: string) {
        if (builtIndex === null) {
            builtIndex = i;
        }
        built.push(char);
    }

    function processSymbol(
        input: string,
        symbolLookup: Record<string, string>,
    ): boolean {
        const symbol = isSymbol(input, i, symbolLookup);
        if (symbol) {
            const symbolLength = (symbol as [string, number])[1];
            processBuilt();

            for (let j = 0; j < symbolLength; j++) {
                addChar(input.substring(i + j, i + j + 1));
            }
            i += symbolLength;

            return true;
        }
        return false;
    }

    while (i < input.length) {
        const current = input[i];

        if (current == undefined) {
            break;
        }

        if (exitBracket !== null) {
            const bracket = BRACKETS[exitBracket] as Bracket;
            const rightBracket = bracket[1];

            if (current === rightBracket) {
                processBuilt();
                output.push({
                    kind: bracket[2] + "Close",
                    startIndex: i,
                    endIndex: i + 1,
                    depth: depth,
                });
                return [output, i + 1, false];
            }
        }

        const bracketIndex = leftBrackets.indexOf(current);

        if (bracketIndex !== -1) {
            const bracket = BRACKETS[bracketIndex] as Bracket;
            const kind = bracket[2];

            processBuilt();

            if (kind === "string") {
                const [tokens, endIndex] = tokenizeString(
                    input.slice(i + 1),
                    bracketIndex,
                );
                pushTokensWithOffset(tokens, 1);
                i += endIndex + 1;
            } else {
                const [tokens, endIndex, missing] = tokenize(
                    input.slice(i + 1),
                    bracketIndex,
                    depth + 1,
                );

                pushTokensWithOffset(
                    [
                        {
                            kind: kind + "Open",
                            startIndex: i - 1,
                            endIndex: i,
                            depth: depth + 1,
                        },
                        ...tokens,
                    ],
                    1,
                );

                if (missing) {
                    output.push({
                        kind: kind + "Close",
                        startIndex: i + endIndex + 1,
                        endIndex: i + endIndex + 1,
                        depth: depth + 1,
                        error: "Missing closing bracket",
                    });
                }

                i += endIndex + 1;
            }
            continue;
        }

        if (current == " ") {
            processBuilt();
            i++;
            continue;
        }

        if (
            processSymbol(input, HIGH_PRECEDENCE_SYMBOLS) ||
            processSymbol(input, LOW_PRECEDENCE_SYMBOLS)
        ) {
            processBuilt();
            continue;
        }

        if (current == "\n") {
            processBuilt();
            output.push({
                kind: "break",
                startIndex: i,
                endIndex: i + 1,
            });
            i++;
            continue;
        }

        const endBracketIndex = rightBrackets.indexOf(current);
        if (endBracketIndex != -1) {
            processBuilt();
            output.push({
                kind: (BRACKETS[endBracketIndex] as Bracket)[2] + "Close",
                startIndex: i,
                endIndex: i + 1,
                depth: depth,
                error: `Unexpected closing bracket, expected ${(BRACKETS[exitBracket || 0] as Bracket)[0]}`,
            });
            i++;
            continue;
        }

        addChar(current);
        i++;
    }

    processBuilt();

    if (exitBracket !== null) {
        output.push({
            kind: (BRACKETS[exitBracket] as Bracket)[2] + "Close",
            startIndex: i,
            endIndex: i + 1,
            depth: depth,
            error: "Missing closing bracket",
        });
    }

    return [output, i, exitBracket !== null];
}

function tokenizeString(
    input: string,
    exitBracket?: number,
): [Token[], number, boolean] {
    let i = 0;
    const built: string[] = [];

    const makeToken = (errorMessage?: string): Token => ({
        kind: "string",
        value: built.join(""),
        startIndex: -1,
        endIndex: i,
        error: errorMessage,
    });

    let isEscape = false;
    let newLine = false;
    let closed = false;

    while (i < input.length) {
        const current = input[i];

        if (current == undefined) {
            break;
        }

        if (current === "\\" && !isEscape) {
            isEscape = true;
            i++;
            continue;
        }

        if (
            exitBracket !== undefined &&
            current === (BRACKETS[exitBracket] as Bracket)[1] &&
            !isEscape
        ) {
            closed = true;
            i++; // Move past the closing quote
            break;
        }

        if (current === "\n") {
            if (isEscape) {
                i++;
                continue;
            }
            newLine = true;
            break;
        }

        isEscape = false;
        built.push(current);
        i++;
    }

    const tokens: Token[] = [
        makeToken(closed ? undefined : "string not closed off"),
    ];

    if (newLine) {
        tokens.push({
            kind: "break",
            startIndex: i - 1,
            endIndex: i,
        });
    }

    return [tokens, i, !closed];
}
