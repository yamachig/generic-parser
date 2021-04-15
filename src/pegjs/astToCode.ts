import peg from "./pegjsTypings/pegjs";
// import pegjs from "./optionalPegjs";
import ts from "typescript";

const grammarToCodeDefaultOptions = {
    header: "",
    genericParserPath: "generic-parser/lib",
};

export const grammarToCode = (
    grammar: peg.Grammar,
    _options?: {
        header?: string,
        genericParserPath?: string,
    },
): string => {
    const options = { ...grammarToCodeDefaultOptions, ..._options };
    const retFragments: string[] = [];
    if (options.header) retFragments.push(options.header);
    retFragments.push(getHeader(options.genericParserPath));
    const initializer = initializerToCode(grammar
        .initializer);
    retFragments.push(initializer.code);
    const ruleNames: string[] = [];
    for (const rule of grammar.rules) {
        const ruleCode = ruleToCode(rule, [...initializer.addEnvNames, "error", "expected", "location", "offset", "range", "text"], 0);
        retFragments.push(ruleCode);
        ruleNames.push(rule.name);
    }
    retFragments.push(getParse(ruleNames));
    return retFragments.join("\r\n");
};

const getHeader = (genericParserPath: string): string => {
    return `
import { stringOffsetToPos, Rule, Empty } from "${genericParserPath}/core";
import { RuleFactory } from "${genericParserPath}/rules/factory";

type Env = ReturnType<typeof initializer>;
type ValueRule<TValue> = Rule<string, TValue, Env, Empty>

const factory = new RuleFactory<string, Env>();
`.trimStart();
};

const getParse = (ruleNames: string[]): string => {
    return `
const rules = {
${ruleNames.map(name => `${INDENTUNIT}${name}: $${name},`).join("\r\n")}
};

export const parse = (text: string, options: Record<string | number | symbol, unknown>) => {
${INDENTUNIT}let rule: ValueRule<unknown> = $${ruleNames[0]};
${INDENTUNIT}if ("startRule" in options) {
${INDENTUNIT}${INDENTUNIT}rule = rules[options.startRule as keyof typeof rules];
${INDENTUNIT}}
${INDENTUNIT}const result = rule.match(
${INDENTUNIT}${INDENTUNIT}0,
${INDENTUNIT}${INDENTUNIT}text,
${INDENTUNIT}${INDENTUNIT}initializer(options),
${INDENTUNIT});
${INDENTUNIT}if (result.ok) return result.value;
${INDENTUNIT}throw new Error(\`Expected \${result.expected} \${JSON.stringify(result)}\`);
};
`.trimStart();
};

const INDENTUNIT = "    ";

const safeChar = (str: string) => {
    return str.replace(/[\u007F-\uFFFF]/g, c => {
        return "\\u" + c.charCodeAt(0).toString(16).padStart(4, "0");
    });
};

const assertNever = (value: never) => {
    throw new Error(`unexpected ${JSON.stringify(value)}`);
};


function *iterateIdentifierOfBinding(element: ts.ArrayBindingElement | ts.BindingElement): IterableIterator<ts.Identifier> {
    if ("name" in element) {
        const name = element.name;
        if (ts.isIdentifier(name)) {
            yield name;
        } else {
            for (const element of name.elements) {
                yield* iterateIdentifierOfBinding(element);
            }
        }
    }
}

const initializerToCode = (initializer?: peg.ast.Initializer): {code: string, addEnvNames: string[]} => {
    const addEnvNames: string[] = [];
    if (initializer?.code) {
        const tsSource = ts.createSourceFile(
            "initializer.ts",
            initializer.code,
            ts.ScriptTarget.ES2015,
        );
        for (const statement of tsSource.statements) {
            if (ts.isVariableStatement(statement)) {
                for (const decl of statement.declarationList.declarations) {
                    if ("elements" in decl.name) {
                        for (const element of decl.name.elements) {
                            for (const id of iterateIdentifierOfBinding(element)) {
                                const name = id.escapedText as string;
                                if (name) addEnvNames.push(name.replace(/^__/, "_"));
                            }
                        }
                    } else {
                        const name = decl.name.escapedText as string;
                        if (name) addEnvNames.push(name.replace(/^__/, "_"));
                    }
                }
            } else if (ts.isFunctionDeclaration(statement)) {
                if (statement.name) {
                    const name = statement.name.escapedText as string;
                    if (name) addEnvNames.push(name.replace(/^__/, "_"));
                }
            } else if (ts.isClassDeclaration(statement)) {
                if (statement.name) {
                    const name = statement.name.escapedText as string;
                    if (name) addEnvNames.push(name.replace(/^__/, "_"));
                }
            } else if (ts.isEnumDeclaration(statement)) {
                const name = statement.name.escapedText as string;
                if (name) addEnvNames.push(name.replace(/^__/, "_"));
            }
        }
    }
    return {
        code: `
const initializer = (options: Record<string | number | symbol, unknown>) => {
${INDENTUNIT}let currentStart = 0;
${INDENTUNIT}let currentEnd = 0;
${INDENTUNIT}let currentTarget = "";
${INDENTUNIT}const registerCurrentRangeTarget = (start: number, end: number, target: string) => {
${INDENTUNIT}${INDENTUNIT}currentStart = start;
${INDENTUNIT}${INDENTUNIT}currentEnd = end;
${INDENTUNIT}${INDENTUNIT}currentTarget = target;
${INDENTUNIT}};
${INDENTUNIT}const location = () => ({
${INDENTUNIT}${INDENTUNIT}start: offsetToPos(currentTarget, currentStart),
${INDENTUNIT}${INDENTUNIT}end: offsetToPos(currentTarget, currentEnd),
${INDENTUNIT}});
${INDENTUNIT}const offsetToPos = stringOffsetToPos;
${initializer?.code ?? ""}
${INDENTUNIT}return {
${INDENTUNIT}${INDENTUNIT}offsetToPos,
${INDENTUNIT}${INDENTUNIT}registerCurrentRangeTarget,
${INDENTUNIT}${INDENTUNIT}options,
${[...addEnvNames].map(name => `${INDENTUNIT}${INDENTUNIT}${name},`).join("\r\n")}
${INDENTUNIT}};
};
`.replace(/^\r?\n/, ""),
        addEnvNames,
    };
};

const ruleToCode = (rule: peg.ast.Rule, envNames: string[], indent: number): string => {
    const retFragments: string[] = [];
    retFragments.push(`export const $${rule.name} = factory`);
    let expression = rule.expression;
    if (expression.type === "named") {
        retFragments.push(`${INDENTUNIT.repeat(indent + 1)}.withName("${expression.name}")`);
        expression = expression.expression;
    }
    const { code } = expressionToCode(expression, envNames, indent + 1);
    retFragments.push(code);
    retFragments.push(`${INDENTUNIT.repeat(indent + 1)}.abstract()`);
    retFragments.push(`${INDENTUNIT.repeat(indent + 1)};`);
    retFragments.push("");
    return retFragments.join("\r\n");
};

const expressionToCode = (expression: peg.ast.Expression, envNames: string[], indent: number): {code: string, addEnvNames: string[]} => {
    let result: {code: string, addEnvNames: string[]};
    if (expression.type === "action") {
        result = actionToCode(expression, envNames, indent);
    } else if (expression.type === "any") {
        result = anyToCode(expression, envNames, indent);
    } else if (expression.type === "choice") {
        result = choiceToCode(expression, envNames, indent);
    } else if (expression.type === "class") {
        result = classToCode(expression, envNames, indent);
    } else if (expression.type === "group") {
        result = groupToCode(expression, envNames, indent);
    } else if (expression.type === "literal") {
        result = literalToCode(expression, envNames, indent);
    } else if (expression.type === "optional" || expression.type === "zero_or_more" || expression.type === "one_or_more") {
        result = suffixedToCode(expression, envNames, indent);
    } else if (expression.type === "rule_ref") {
        result = refToCode(expression, envNames, indent);
    } else if (expression.type === "semantic_and" || expression.type === "semantic_not") {
        result = predicateToCode(expression, envNames, indent);
    } else if (expression.type === "sequence" || expression.type === "labeled") {
        const e: peg.ast.SequenceExpression =
            expression.type === "labeled"
                ? {
                    type: "sequence",
                    elements: [expression],
                    location: expression.location,
                } : expression;
        result = sequenceToCode(e, envNames, indent);
    } else if (expression.type === "simple_and" || expression.type === "simple_not" || expression.type === "text") {
        result = prefixedToCode(expression, envNames, indent);
    } else {
        throw assertNever(expression.type);
    }
    return result;
};

const actionToCode = (expression: peg.ast.ActionExpression, envNames: string[], indent: number): {code: string, addEnvNames: string[]} => {
    const INDENTS = INDENTUNIT.repeat(indent);
    const retFragments: string[] = [];
    const { code, addEnvNames } = expressionToCode(expression.expression, envNames, indent + 1);
    retFragments.push(`
${INDENTS}.action(r => r
${code}
${INDENTS}, (({ ${[...envNames, ...addEnvNames].join(", ")} }) => {
${expression.code.trim()}
${INDENTS}})
${INDENTS})
`.replace(/^\r?\n/, "").trimEnd());
    return {
        code: retFragments.join("\r\n"),
        addEnvNames: [],
    };
};

const anyToCode = (_expression: peg.ast.AnyMatcher, _envNames: string[], indent: number): {code: string, addEnvNames: string[]} => {
    const INDENTS = INDENTUNIT.repeat(indent);
    const retFragments: string[] = [];
    retFragments.push(`
${INDENTS}.anyOne()
`.replace(/^\r?\n/, "").trimEnd());
    return {
        code: retFragments.join("\r\n"),
        addEnvNames: [],
    };
};

const choiceToCode = (expression: peg.ast.ChoiceExpression, envNames: string[], indent: number): {code: string, addEnvNames: string[]} => {
    const INDENTS = INDENTUNIT.repeat(indent);
    const retFragments: string[] = [];
    retFragments.push(`
${INDENTS}.choice(c => c
${expression.alternatives.map(e => `
${INDENTS}${INDENTUNIT}.or(r => r
${expressionToCode(e, envNames, indent + 2).code}
${INDENTS}${INDENTUNIT})
`.replace(/^\r?\n/, "").trimEnd()).join("\r\n")}
${INDENTS})
`.replace(/^\r?\n/, "").trimEnd());
    return {
        code: retFragments.join("\r\n"),
        addEnvNames: [],
    };
};

const groupToCode = (expression: peg.ast.GroupExpression, envNames: string[], indent: number): {code: string, addEnvNames: string[]} => {
    return {
        ...expressionToCode(expression.expression, envNames, indent),
        addEnvNames: [],
    };
};

const literalToCode = (expression: peg.ast.LiteralMatcher, _envNames: string[], indent: number): {code: string, addEnvNames: string[]} => {
    const INDENTS = INDENTUNIT.repeat(indent);
    const retFragments: string[] = [];
    if (expression.ignoreCase) {
        retFragments.push(`
${INDENTS}.regExp(/${safeChar(JSON.stringify(expression.value).slice(1, -1).replace("\\\"", "\"")).replace(/[.+*?^$()[]{}|]/g, "\\$&")}/i)
    `.replace(/^\r?\n/, "").trimEnd());
    } else {
        retFragments.push(`
${INDENTS}.seqEqual(${safeChar(JSON.stringify(expression.value))})
`.replace(/^\r?\n/, "").trimEnd());

    }
    return {
        code: retFragments.join("\r\n"),
        addEnvNames: [],
    };
};

const classToCode = (expression: peg.ast.CharacterClassMatcher, _envNames: string[], indent: number): {code: string, addEnvNames: string[]} => {
    const INDENTS = INDENTUNIT.repeat(indent);
    const retFragments: string[] = [];
    const inverted = expression.inverted ? "^" : "";
    const parts = safeChar(expression.parts.map(p => (typeof p === "string" ? [p] : p).map(pp => JSON.stringify(pp).slice(1, -1).replace("\\\"", "\"").replace(/[.+*?^$()[]{}|]/g, "\\$&")).join("")).join(""));
    const ignoreCase = expression.ignoreCase ? "i" : "";
    retFragments.push(`
${INDENTS}.regExp(/[${inverted}${parts}]/${ignoreCase})
    `.replace(/^\r?\n/, "").trimEnd());
    return {
        code: retFragments.join("\r\n"),
        addEnvNames: [],
    };
};

const suffixedToCode = (expression: peg.ast.SuffixedExpression, envNames: string[], indent: number): {code: string, addEnvNames: string[]} => {
    const INDENTS = INDENTUNIT.repeat(indent);
    const retFragments: string[] = [];
    const funcName =
        expression.type === "optional"
            ? "zeroOrOne"
            : expression.type === "zero_or_more"
                ? "zeroOrMore"
                : expression.type === "one_or_more"
                    ? "oneOrMore"
                    : assertNever(expression.type);
    retFragments.push(`
${INDENTS}.${funcName}(r => r
${expressionToCode(expression.expression, envNames, indent + 1).code}
${INDENTS})
`.replace(/^\r?\n/, "").trimEnd());
    return {
        code: retFragments.join("\r\n"),
        addEnvNames: [],
    };
};

const refToCode = (expression: peg.ast.RuleReferenceExpression, _envNames: string[], indent: number): {code: string, addEnvNames: string[]} => {
    const INDENTS = INDENTUNIT.repeat(indent);
    const retFragments: string[] = [];
    retFragments.push(`
${INDENTS}.ref(() => $${expression.name})
`.replace(/^\r?\n/, "").trimEnd());
    return {
        code: retFragments.join("\r\n"),
        addEnvNames: [],
    };
};

const predicateToCode = (expression: peg.ast.SemanticPredicateExpression, envNames: string[], indent: number): {code: string, addEnvNames: string[]} => {
    const INDENTS = INDENTUNIT.repeat(indent);
    const retFragments: string[] = [];
    const funcName =
        expression.type === "semantic_and"
            ? "assert"
            : expression.type === "semantic_not"
                ? "assertNot"
                : assertNever(expression.type);
    retFragments.push(`
${INDENTS}.${funcName}(({ ${envNames.join(", ")} }) => {
${expression.code.trim()}
${INDENTS}})
    `.replace(/^\r?\n/, "").trimEnd());
    return {
        code: retFragments.join("\r\n"),
        addEnvNames: [],
    };
};

const sequenceElementToCode = (expression: peg.ast.SuffixedExpression | peg.ast.LabeledExpression | peg.ast.PrefixedExpression | peg.ast.PrimaryExpression, pickExists: boolean, envNames: string[], indent: number): {code: string, addEnvNames: string[]} => {
    const INDENTS = INDENTUNIT.repeat(indent);
    const retFragments: string[] = [];
    const funcName =
        !pickExists || (expression.type === "labeled" && expression.pick)
            ? "and"
            : "andOmit";
    const label =
        expression.type === "labeled" && expression.label
            ? `, "${expression.label}"`
            : "";
    const e = expression.type === "labeled" ? expression.expression : expression;
    retFragments.push(`
${INDENTS}.${funcName}(r => r
${expressionToCode(e, envNames, indent + 1).code}
${INDENTS}${label})
`.replace(/^\r?\n/, "").trimEnd());
    return {
        code: retFragments.join("\r\n"),
        addEnvNames:
            expression.type === "labeled" && expression.label
                ? [expression.label]
                : []
    };
};

const sequenceToCode = (expression: peg.ast.SequenceExpression, envNames: string[], indent: number): {code: string, addEnvNames: string[]} => {
    const INDENTS = INDENTUNIT.repeat(indent);
    const pickExists = expression.elements.some(e => e.type === "labeled" && e.pick);
    const retFragments: string[] = [];
    const newAddEnvNames: string[] = [];
    retFragments.push(`${INDENTS}.sequence(c => c`);
    for (const e of expression.elements) {
        const { code, addEnvNames } = sequenceElementToCode(e, pickExists, [...envNames, ...newAddEnvNames], indent + 1);
        retFragments.push(code);
        newAddEnvNames.push(...addEnvNames);
    }
    retFragments.push(`${INDENTS})`);
    return {
        code: retFragments.join("\r\n"),
        addEnvNames: newAddEnvNames,
    };
};

const prefixedToCode = (expression: peg.ast.PrefixedExpression, envNames: string[], indent: number): {code: string, addEnvNames: string[]} => {
    const INDENTS = INDENTUNIT.repeat(indent);
    const retFragments: string[] = [];
    const funcName =
        expression.type === "simple_and"
            ? "nextIs"
            : expression.type === "simple_not"
                ? "nextIsNot"
                : expression.type === "text"
                    ? "asSlice"
                    : assertNever(expression.type);
    retFragments.push(`
${INDENTS}.${funcName}(r => r
${expressionToCode(expression.expression, envNames, indent + 1).code}
${INDENTS})
`.replace(/^\r?\n/, "").trimEnd());
    return {
        code: retFragments.join("\r\n"),
        addEnvNames: [],
    };
};
