import { parse } from "./pegjsParser";
import fs from "fs";
import path from "path";
import pegjs from "./optionalPegjs";
import { grammarToCode } from "./astToCode";

// const parsePegjs = (source: string) => {
//     if (pegjs === null) throw new Error("PEG.js not installed.");
//     const ast = parse(source);
//     const passes = pegjs.util.convertPasses( pegjs.compiler.passes as unknown as peg.IStageMap );
//     const session = new pegjs.compiler.Session( { passes } );
//     const parser = pegjs.compiler.compile(ast, session, { output: "parser" });
//     if (typeof parser === "string") throw new Error();
//     return { ast, parser };
// };

describe("Test astToCode", () => {
    if (pegjs === null) {
        console.warn("PEG.js not installed. Skipping tests for pegjsParser.");
        return;
    }

    it("Success case", () => {
        if (pegjs === null) throw new Error("PEG.js not installed.");
        const source = fs.readFileSync(path.join(__dirname, "../../node_modules/pegjs-dev/src/parser.pegjs"), { encoding: "utf-8" });

        const grammar = parse(source);
        // const targetAstStr = inspect(targetAst, undefined, null);
        // fs.writeFileSync(path.join(__dirname, "temp_target_ast.txt"), targetAstStr, { encoding: "utf-8" });

        // const origAst = pegjs.parser.parse(source, { extractComments: true });
        // const origAstStr = inspect(origAst, undefined, null);
        // fs.writeFileSync(path.join(__dirname, "temp_orig_ast.txt"), origAstStr, { encoding: "utf-8" });

        const code = grammarToCode(grammar, {
            header: `
import peg from "generic-parser/pegjs/optionalPegjs";
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const util = peg!.util;
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const ast = peg!.ast;
`.trimStart(),
        });
        fs.writeFileSync(path.join(__dirname, "temp_grammar.ts"), code, { encoding: "utf-8" });
    });

});
