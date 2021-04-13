import peg from "./pegjsTypings/pegjs";
// import pegjs from "./optionalPegjs";


export const grammarToCode = (grammar: peg.Grammar): string => {
    const retFragments: string[] = [];
    retFragments.push(getHeader());
    for (const rule of grammar.rules) {
        const ruleCode = ruleToCode(rule, 0);
        retFragments.push(ruleCode);
    }
    return retFragments.join("\r\n");
};

export const getHeader = (): string => {
    return `
import { BaseEnv, Location, ValueRule } from "generic-parser/rules/common";
import { stringOffsetToPos, StringPos } from "generic-parser/rules/string/env";
import { StringRuleFactory } from "generic-parser/rules/string/factory";

const rootEnv: BaseEnv<string, StringPos> = {
    offsetToPos: stringOffsetToPos,
};

type Env = typeof rootEnv;

const factory = new StringRuleFactory<Env>();
`.trimStart();
};

const INDENTUNIT = "    ";

const escapeStr = (str: string) => {
    return str.replace(/[\u007F-\uFFFF]/g, c => {
        return "\\u" + c.charCodeAt(0).toString(16).padStart(4, "0");
    });
};

const assertNever = (value: never) => {
    throw new Error(`unexpected ${JSON.stringify(value)}`);
};

export const ruleToCode = (rule: peg.ast.Rule, indent: number): string => {
    const retFragments: string[] = [];
    retFragments.push(`const ${rule.name} = factory`);
    let expression = rule.expression;
    if (expression.type === "named") {
        retFragments.push(`${INDENTUNIT.repeat(indent + 1)}.withName("${expression.name}")`);
        expression = expression.expression;
    }
    const innerCode = expressionToCode(expression, indent + 1);
    retFragments.push(innerCode);
    retFragments.push(`${INDENTUNIT.repeat(indent + 1)}.abstract()`);
    retFragments.push(`${INDENTUNIT.repeat(indent + 1)};`);
    retFragments.push("");
    return retFragments.join("\r\n");
};

export const expressionToCode = (expression: peg.ast.Expression, indent: number): string => {
    const retFragments: string[] = [];
    if (expression.type === "action") {
        retFragments.push(actionToCode(expression, indent));
    } else if (expression.type === "any") {
        retFragments.push(anyToCode(expression, indent));
    } else if (expression.type === "choice") {
        retFragments.push(choiceToCode(expression, indent));
    } else if (expression.type === "class") {
        retFragments.push(classToCode(expression, indent));
    } else if (expression.type === "group") {
        retFragments.push(groupToCode(expression, indent));
    } else if (expression.type === "literal") {
        retFragments.push(literalToCode(expression, indent));
    } else if (expression.type === "optional" || expression.type === "zero_or_more" || expression.type === "one_or_more") {
        retFragments.push(suffixedToCode(expression, indent));
    } else if (expression.type === "rule_ref") {
        retFragments.push(refToCode(expression, indent));
    } else if (expression.type === "semantic_and" || expression.type === "semantic_not") {
        retFragments.push(predicateToCode(expression, indent));
    } else if (expression.type === "sequence") {
        retFragments.push(sequenceToCode(expression, indent));
    } else if (expression.type === "simple_and" || expression.type === "simple_not" || expression.type === "text") {
        retFragments.push(prefixedToCode(expression, indent));
    } else if (expression.type === "labeled") {
        retFragments.push(sequenceToCode({
            type: "sequence",
            elements: [expression],
            location: expression.location,
        }, indent));
    } else {
        throw assertNever(expression.type);
    }
    return retFragments.join("\r\n");
};

export const actionToCode = (expression: peg.ast.ActionExpression, indent: number): string => {
    const INDENTS = INDENTUNIT.repeat(indent);
    const retFragments: string[] = [];
    retFragments.push(`
${INDENTS}.action(r => r
${expressionToCode(expression.expression, indent + 1)}
${INDENTS}, (({ error, expected, location, offset, range, text }) => {
${expression.code.trim()}
${INDENTS}})
${INDENTS})
`.replace(/^\r?\n/, "").trimEnd());
    return retFragments.join("\r\n");
};

export const anyToCode = (_expression: peg.ast.AnyMatcher, indent: number): string => {
    const INDENTS = INDENTUNIT.repeat(indent);
    const retFragments: string[] = [];
    retFragments.push(`
${INDENTS}.anyOne()
`.replace(/^\r?\n/, "").trimEnd());
    return retFragments.join("\r\n");
};

export const choiceToCode = (expression: peg.ast.ChoiceExpression, indent: number): string => {
    const INDENTS = INDENTUNIT.repeat(indent);
    const retFragments: string[] = [];
    retFragments.push(`
${INDENTS}.choice(c => c
${expression.alternatives.map(e => `
${INDENTS}${INDENTUNIT}.or(r => r
${expressionToCode(e, indent + 2)}
${INDENTS}${INDENTUNIT})
`.replace(/^\r?\n/, "").trimEnd()).join("\r\n")}
${INDENTS})
`.replace(/^\r?\n/, "").trimEnd());
    return retFragments.join("\r\n");
};

export const groupToCode = (expression: peg.ast.GroupExpression, indent: number): string => {
    return expressionToCode(expression.expression, indent);
};

export const literalToCode = (expression: peg.ast.LiteralMatcher, indent: number): string => {
    const INDENTS = INDENTUNIT.repeat(indent);
    const retFragments: string[] = [];
    if (expression.ignoreCase) {
        retFragments.push(`
${INDENTS}.regExp(/${escapeStr(expression.value).replace(/[.+*?^$()[]{}|\\]/g, "\\$&")}/i)
    `.replace(/^\r?\n/, "").trimEnd());
    } else {
        retFragments.push(`
${INDENTS}.seqEqual(${escapeStr(JSON.stringify(expression.value))})
`.replace(/^\r?\n/, "").trimEnd());

    }
    return retFragments.join("\r\n");
};

export const classToCode = (expression: peg.ast.CharacterClassMatcher, indent: number): string => {
    const INDENTS = INDENTUNIT.repeat(indent);
    const retFragments: string[] = [];
    const inverted = expression.inverted ? "^" : "";
    const parts = escapeStr(expression.parts.map(p => (typeof p === "string" ? [p] : p).map(pp => pp.replace(/[.+*?^$()[]{}|\\]/g, "\\$&")).join("")).join(""));
    const ignoreCase = expression.ignoreCase ? "i" : "";
    retFragments.push(`
${INDENTS}.regExp(/[${inverted}${parts}]/${ignoreCase})
    `.replace(/^\r?\n/, "").trimEnd());
    return retFragments.join("\r\n");
};

export const suffixedToCode = (expression: peg.ast.SuffixedExpression, indent: number): string => {
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
${expressionToCode(expression.expression, indent + 1)}
${INDENTS})
`.replace(/^\r?\n/, "").trimEnd());
    return retFragments.join("\r\n");
};

export const refToCode = (expression: peg.ast.RuleReferenceExpression, indent: number): string => {
    const INDENTS = INDENTUNIT.repeat(indent);
    const retFragments: string[] = [];
    retFragments.push(`
${INDENTS}.ref(() => ${expression.name})
`.replace(/^\r?\n/, "").trimEnd());
    return retFragments.join("\r\n");
};

export const predicateToCode = (expression: peg.ast.SemanticPredicateExpression, indent: number): string => {
    const INDENTS = INDENTUNIT.repeat(indent);
    const retFragments: string[] = [];
    const funcName =
        expression.type === "semantic_and"
            ? "assert"
            : expression.type === "semantic_not"
                ? "assertNot"
                : assertNever(expression.type);
    retFragments.push(`
${INDENTS}.${funcName}(({ error, expected, location, offset, range, text }) => {
${expression.code.trim()}
${INDENTS}})
    `.replace(/^\r?\n/, "").trimEnd());
    return retFragments.join("\r\n");
};

const sequenceElementToCoode = (expression: peg.ast.SuffixedExpression | peg.ast.LabeledExpression | peg.ast.PrefixedExpression | peg.ast.PrimaryExpression, pickExists: boolean, indent: number): string => {
    const INDENTS = INDENTUNIT.repeat(indent);
    const retFragments: string[] = [];
    const funcName = !pickExists || (expression.type === "labeled" && expression.pick)
        ? "and"
        : "andOmit";
    const label = expression.type === "labeled"
        ? `, "${expression.label}"`
        : "";
    const e = expression.type === "labeled" ? expression.expression : expression;
    retFragments.push(`
${INDENTS}.${funcName}(r => r
${expressionToCode(e, indent + 1)}
${INDENTS}${label})
`.replace(/^\r?\n/, "").trimEnd());
    return retFragments.join("\r\n");
};

export const sequenceToCode = (expression: peg.ast.SequenceExpression, indent: number): string => {
    const INDENTS = INDENTUNIT.repeat(indent);
    const pickExists = expression.elements.some(e => e.type === "labeled" && e.pick);
    const retFragments: string[] = [];
    retFragments.push(`
${INDENTS}.sequence(c => c
${expression.elements.map(e => sequenceElementToCoode(e, pickExists, indent + 1)).join("\r\n")}
${INDENTS})
`.replace(/^\r?\n/, "").trimEnd());
    return retFragments.join("\r\n");
};

export const prefixedToCode = (expression: peg.ast.PrefixedExpression, indent: number): string => {
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
${expressionToCode(expression.expression, indent + 1)}
${INDENTS})
`.replace(/^\r?\n/, "").trimEnd());
    return retFragments.join("\r\n");
};
