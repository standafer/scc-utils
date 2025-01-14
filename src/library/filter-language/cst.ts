import * as Lexer from "./lexer";

export const PRECEDENCE = [
    ["symbolAnd", "symbolOr"],
    ["symbolNot"],
    [
        "symbolLessThanOrEqual",
        "symbolGreaterThanOrEqual",
        "symbolGreaterThan",
        "symbolLessThan",
        "symbolAsterisk",
        "symbolEquals",
        "symbolFuzzyEquals",
    ],
    ["symbolPlus", "symbolMinus", "symbolAsterisk", "symbolSlash"],
];

export const GLOBAL_IDENTIFIERS = [
    "crn",
    "type",
    "title",
    "campus",
    "credit",
    "subject",
    "course",
    "section",
    "capacity.total",
    "capacity.actual",
    "capacity.remaining",
    "waitlist.total",
    "waitlist.actual",
    "waitlist.remaining",

    // These are part of schedule entry
    "schedule.days",
    "schedule.instuctor",
    "schedule.location",
    "schedule.attributes",

    // Following are part of the filterable class entry
    "selected",
    "expanded",
];

export type CSTNode = Omit<Lexer.Token, "error"> & {
    children: Array<CSTNode>;
    error?: CSTError;
};

export type CSTError = {
    message: string;
    startIndex: number;
    endIndex: number;
};

export function parse(tokens: Array<Lexer.Token>): {
    root: CSTNode | null;
    errors: Array<CSTError>;
} {
    let currentIndex = 0;
    const errors: Array<CSTError> = [];

    function createNode(token: Lexer.Token): CSTNode {
        const { error, ...rest } = token;
        return {
            ...rest,
            children: [],
            error: error
                ? {
                      message: error,
                      startIndex: token.startIndex,
                      endIndex: token.endIndex,
                  }
                : undefined,
        } as CSTNode;
    }

    function addError(message: string, token: Lexer.Token): void {
        if (!token) {
            errors.push({
                message,
                startIndex: -1,
                endIndex: -1,
            });
            return;
        }
        errors.push({
            message,
            startIndex: token.startIndex,
            endIndex: token.endIndex,
        });
    }

    function peek(): Lexer.Token | undefined {
        return tokens[currentIndex];
    }

    function consume(): Lexer.Token | undefined {
        return tokens[currentIndex++];
    }

    function parseExpression(minPrecedence = 0): CSTNode | null {
        let left: CSTNode | null = null;

        if (currentIndex >= tokens.length) {
            return null;
        }

        if (peek()?.kind === "symbolNot") {
            const notToken = consume() as Lexer.Token;
            const notNode = createNode(notToken);
            const expr = parseExpression(getPrecedence(notToken));
            if (!expr) {
                addError("Expected expression after NOT operator", notToken);
                return notNode;
            }
            notNode.children = [expr];
            left = notNode;
        } else {
            left = parsePrimary();
        }

        if (!left) return null;

        while (true) {
            const operator = peek();
            if (!operator) break;

            const precedence = getPrecedence(operator);
            if (precedence < minPrecedence) break;

            consume();

            const right = parseExpression(precedence + 1);
            if (!right) {
                addError("Expected expression after operator", operator);
                break;
            }

            const node = createNode(operator);
            node.children = [left, right];
            left = node;
        }

        return left;
    }

    function parsePrimary(): CSTNode | null {
        const token = peek();
        if (!token) {
            addError(
                "Unexpected end of input",
                tokens[tokens.length - 1] as Lexer.Token,
            );
            return null;
        }

        if (token.kind === "symbolNot") {
            consume();
            const notNode = createNode(token);
            const expr = parsePrimary();
            if (!expr) {
                addError("Expected expression after NOT operator", token);
                return notNode;
            }
            notNode.children = [expr];
            return notNode;
        }

        consume();

        switch (token.kind) {
            case "expressionOpen": {
                const openNode = createNode(token);
                const expr = parseExpression();
                const closing = consume();
                if (!closing || closing.kind !== "expressionClose") {
                    addError("Missing closing parenthesis", token);
                    openNode.children = expr ? [expr] : [];
                    return openNode;
                }
                const closeNode = createNode(closing);
                openNode.children = expr ? [expr, closeNode] : [closeNode];
                return openNode;
            }
            case "number":
            case "string":
            case "keywordTrue":
            case "keywordFalse":
                return createNode(token);
            case "identifier":
                if (!GLOBAL_IDENTIFIERS.includes(token.value || "")) {
                    let didYouMean = "";
                    for (const identifier of GLOBAL_IDENTIFIERS) {
                        if (identifier.startsWith(token.value || "")) {
                            didYouMean = identifier;
                            break;
                        }
                    }

                    const append = didYouMean
                        ? `. Did you mean: ${didYouMean}?`
                        : "";

                    addError(
                        `Unknown identifier: "${token.value}"` + append,
                        token,
                    );
                }

                return createNode(token);
            default:
                addError(`Unexpected token: ${token.kind}`, token);
                return createNode(token); // Still create a node for unexpected tokens
        }
    }

    function getPrecedence(token: Lexer.Token): number {
        for (let i = 0; i < PRECEDENCE.length; i++) {
            if ((PRECEDENCE[i] as Array<string>).includes(token.kind)) {
                return i;
            }
        }
        return -1;
    }

    const root = parseExpression();

    if (currentIndex < tokens.length) {
        addError(
            "Unexpected tokens after parsing",
            tokens[currentIndex] as Lexer.Token,
        );
    }

    return { root, errors };
}
