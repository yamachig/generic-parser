import { assert } from "chai";
import { parse } from "./pegjsParser";
import { inspect } from "util";
import fs from "fs";
import path from "path";
import peg from "./pegjsTypings/pegjs";
import pegjs from "./optionalPegjs";

const parsePegjs = (source: string) => {
    if (pegjs === null) throw new Error("PEG.js not installed.");
    const ast = parse(source, { extractComments: true });
    const passes = pegjs.util.convertPasses( pegjs.compiler.passes as unknown as peg.IStageMap );
    const session = new pegjs.compiler.Session( { passes } );
    const parser = pegjs.compiler.compile(ast, session, { output: "parser" });
    if (typeof parser === "string") throw new Error();
    return { ast, parser };
};

export const defaultOptions: peg.parser.IOptions = {
    reservedWords: [

        // Keyword
        "break",
        "case",
        "catch",
        "continue",
        "debugger",
        "default",
        "delete",
        "do",
        "else",
        "finally",
        "for",
        "function",
        "if",
        "in",
        "instanceof",
        "new",
        "return",
        "switch",
        "this",
        "throw",
        "try",
        "typeof",
        "var",
        "void",
        "while",
        "with",

        // FutureReservedWord
        "class",
        "const",
        "enum",
        "export",
        "extends",
        "implements",
        "import",
        "interface",
        "let",
        "package",
        "private",
        "protected",
        "public",
        "static",
        "super",
        "yield",

        // Literal
        "false",
        "null",
        "true",
    ],
    extractComments: true,
};

describe("Test pegjsParser", () => {
    if (pegjs === null) {
        console.warn("PEG.js not installed. Skipping tests for pegjsParser.");
        return;
    }

    it("Success case", () => {
        const source = `
plus = "+"
`;
        const { parser } = parsePegjs(source);
        // const astStr = inspect(ast, undefined, null);
        const result = parser.parse("+", { startRule: "plus" });
        assert.strictEqual(result, "+");
    });

    it("Success case", () => {
        const source = `
sum = $([0-9]+ "+" [0-9]+)
`;
        const { parser } = parsePegjs(source);
        // const astStr = inspect(ast, undefined, null);
        const result = parser.parse("1+1", { startRule: "sum" });
        assert.strictEqual(result, "1+1");
    });

    it("Success case", () => {
        const source = `
sum = left:$[0-9]+ "+" right:$[0-9]+
        { return Number(left) + Number(right) }
`;
        const { parser } = parsePegjs(source);
        // const astStr = inspect(ast, undefined, null);
        const result = parser.parse("1+1", { startRule: "sum" });
        assert.strictEqual(result, 2);
    });

    it("Success case", () => {
        const source = `
sum = left:num "+" right:num
        { return left + right }

num = strNum:$([0-9]+)
        { return Number(strNum) }
`;
        const { parser } = parsePegjs(source);
        // const astStr = inspect(ast, undefined, null);
        const result = parser.parse("1+1", { startRule: "sum" });
        assert.strictEqual(result, 2);
    });

    it("Success case", () => {
        if (pegjs === null) throw new Error("PEG.js not installed.");
        const source = fs.readFileSync(path.join(__dirname, "../../node_modules/pegjs-dev/src/parser.pegjs"), { encoding: "utf-8" });

        const targetAst = parse(source, { extractComments: true });
        const targetAstStr = inspect(targetAst, undefined, null);
        fs.writeFileSync(path.join(__dirname, "temp_target_ast.txt"), targetAstStr, { encoding: "utf-8" });

        const origAst = pegjs.parser.parse(source, { extractComments: true });
        const origAstStr = inspect(origAst, undefined, null);
        fs.writeFileSync(path.join(__dirname, "temp_orig_ast.txt"), origAstStr, { encoding: "utf-8" });

        assert.strictEqual(targetAstStr, origAstStr);
    });

});
